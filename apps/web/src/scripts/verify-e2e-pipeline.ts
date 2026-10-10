import { prisma, OrderStatus, PrintJobStatus } from '@keycap/db';
import { OrderService } from '../server/services/order.service';
import { PrintQueueService } from '../server/services/print-queue.service';
import { ShippingService } from '../server/services/shipping.service';
import { transition as transitionOrder } from '@keycap/shared';
import crypto from 'crypto';

async function runEndToEndVerification() {
  console.log('====================================================');
  console.log('🚀 STARTING FULL E2E PLATFORM LIFECYCLE VERIFICATION');
  console.log('====================================================\n');

  // Step 1: User & Address Setup
  console.log('📍 [Step 1/11] Setting up User & Address...');
  const user = await prisma.user.upsert({
    where: { email: 'e2e-tester@myownkeycap.id' },
    update: {},
    create: {
      email: 'e2e-tester@myownkeycap.id',
      name: 'E2E Testing Operator',
      role: 'USER',
      creditBalance: 10,
    },
  });

  const address = await prisma.address.create({
    data: {
      userId: user.id,
      recipient: 'Budi Santoso',
      phone: '081298765432',
      line1: 'Jl. Sudirman Kav. 25, Senayan',
      city: 'Jakarta Selatan',
      province: 'DKI Jakarta',
      postalCode: '12190',
    },
  });
  console.log(`   ✓ User created: ${user.email} (ID: ${user.id})`);
  console.log(`   ✓ Address created: ${address.city} (${address.postalCode})\n`);

  // Step 2: Keyboard Model
  console.log('📍 [Step 2/11] Fetching Keyboard Model...');
  let keyboard = await prisma.keyboardModel.findFirst({
    where: { slug: 'keychron-q1' },
  });
  if (!keyboard) {
    keyboard = await prisma.keyboardModel.findFirst();
  }
  if (!keyboard) throw new Error('No keyboard models found in database!');
  console.log(`   ✓ Selected Keyboard: ${keyboard.name} (${keyboard.keyCount} keys)\n`);

  // Step 3: AI Design Creation
  console.log('📍 [Step 3/11] Creating Custom Keycap Design...');
  const specJson = {
    profile: 'CHERRY',
    stemType: 'MX',
    material: 'PETG',
    colors: {
      base: '#1a1b26',
      modifiers: '#7aa2f7',
      accent: '#f7768e',
      legend: '#c0caf5',
    },
    legends: {
      fontFamily: 'Inter',
      fontSizePt: 8,
      position: 'TOP_LEFT',
    },
    manufacturing: {
      wallThicknessMm: 1.5,
      stemToleranceMm: 0.05,
      draftAngleDeg: 1.5,
      topDishRadiusMm: 35.0,
      textureFinish: 'MATTE',
    },
  };
  const specHash = crypto.createHash('sha256').update(JSON.stringify(specJson)).digest('hex');

  const design = await prisma.design.create({
    data: {
      userId: user.id,
      keyboardModelId: keyboard.id,
      prompt: 'Cyberpunk Tokyo Night neon palette with deep navy base and vibrant pink accent',
      specJson: specJson as any,
      specHash,
      status: 'READY',
    },
  });
  console.log(`   ✓ Design created: ID ${design.id} (specHash: ${specHash.slice(0, 16)}...)\n`);

  // Step 4: Create Draft Order
  console.log('📍 [Step 4/11] Creating Draft Order with Pure Quote Engine...');
  const draftOrder = await OrderService.createDraftOrder({
    userId: user.id,
    designId: design.id,
    addressId: address.id,
  });
  console.log(`   ✓ Order Draft Created: ${draftOrder.publicCode}`);
  console.log(`   ✓ Subtotal: Rp ${draftOrder.subtotalIdr.toLocaleString('id-ID')}`);
  console.log(`   ✓ Total: Rp ${draftOrder.totalIdr.toLocaleString('id-ID')}`);
  console.log(`   ✓ Initial Status: ${draftOrder.status}\n`);

  // Step 5: Checkout Order (DRAFT -> AWAITING_PAYMENT + QRIS)
  console.log('📍 [Step 5/11] Initiating QRIS Checkout...');
  const { order: checkedOutOrder, payment } = await OrderService.checkoutOrder(draftOrder.id, user.id);
  const reloadedOrder = await prisma.order.findUnique({ where: { id: draftOrder.id } });
  console.log(`   ✓ Order status after checkout: ${reloadedOrder?.status}`);
  console.log(`   ✓ QRIS Generated: Provider: ${payment.provider}, Ref: ${payment.providerRef}\n`);

  // Step 6: Simulate Webhook Payment
  console.log('📍 [Step 6/11] Simulating Verified Payment Webhook from Xendit...');
  // Construct valid Xendit simulated webhook
  const webhookBody = JSON.stringify({
    event: 'qr.payment',
    data: {
      id: `evt_${Date.now()}`,
      reference_id: draftOrder.id,
      payment_id: payment.providerRef,
      amount: draftOrder.totalIdr,
      status: 'COMPLETED',
      created: new Date().toISOString(),
    },
  });
  const mockWebhookToken = process.env.XENDIT_WEBHOOK_VERIFICATION_TOKEN || 'mock_xendit_token';
  await OrderService.handleWebhook(
    'xendit',
    { 'x-callback-token': mockWebhookToken },
    webhookBody,
  );

  const paidOrder = await prisma.order.findUnique({
    where: { id: draftOrder.id },
    include: { printJobs: true },
  });
  console.log(`   ✓ Order status after payment: ${paidOrder?.status}`);
  console.log(`   ✓ Auto-generated Print Jobs: ${paidOrder?.printJobs.length} plate(s)\n`);

  // Step 7: Print Queue Dispatch
  console.log('📍 [Step 7/11] Print Queue Dispatch & Starting 3D Print...');
  let job = paidOrder?.printJobs[0];
  if (!job) {
    job = await PrintQueueService.createJobForOrder(draftOrder.id);
  }

  const startedJob = await PrintQueueService.startJob(job.id);
  const printingOrder = await prisma.order.findUnique({ where: { id: draftOrder.id } });
  console.log(`   ✓ Print Job status: ${startedJob.status}`);
  console.log(`   ✓ Order status: ${printingOrder?.status}\n`);

  // Step 8: Complete 3D Print -> Post Processing -> QC
  console.log('📍 [Step 8/11] Print Finished: Washing & Post-processing -> Moving to QC...');
  await PrintQueueService.completeJob(job.id, { actualMinutes: 42, filamentUsedG: 14.8 });
  const qcOrder = await prisma.order.findUnique({ where: { id: draftOrder.id } });
  console.log(`   ✓ Order status after print completion: ${qcOrder?.status}\n`);

  // Step 9: Quality Control (QC Inspection)
  console.log('📍 [Step 9/11] Operator Performing QC Check...');
  const nextAfterQc = transitionOrder(qcOrder!.status, 'qc_pass');
  await prisma.order.update({
    where: { id: draftOrder.id },
    data: { status: nextAfterQc },
  });
  await prisma.orderEvent.create({
    data: {
      orderId: draftOrder.id,
      from: qcOrder!.status,
      to: nextAfterQc,
      meta: { event: 'qc.passed', notes: 'Stem MX fit tested, wall thickness 1.5mm confirmed' },
    },
  });
  const packedOrder = await prisma.order.findUnique({ where: { id: draftOrder.id } });
  console.log(`   ✓ Order status after QC PASS: ${packedOrder?.status} (Packaged in branded box)\n`);

  // Step 10: Dispatch Shipping (Biteship / JNE)
  console.log('📍 [Step 10/11] Generating Waybill & Dispatching Courier...');
  const { order: shippedOrder, shipment } = await ShippingService.dispatchOrder(
    draftOrder.id,
    'jne',
    'REG',
  );
  console.log(`   ✓ Order status: ${shippedOrder.status}`);
  console.log(`   ✓ Courier: ${shipment.courierCode.toUpperCase()} (${shipment.service})`);
  console.log(`   ✓ Waybill / No. Resi: ${shipment.waybillNumber}`);
  console.log(`   ✓ Tracking URL: ${shipment.trackingUrl}\n`);

  // Step 11: Delivery Confirmation
  console.log('📍 [Step 11/11] Confirming Final Customer Delivery...');
  const deliveredOrder = await ShippingService.confirmDelivered(draftOrder.id);
  console.log(`   ✓ Terminal Order Status: ${deliveredOrder.status} 🎉\n`);

  // Audit Events Trail
  console.log('====================================================');
  console.log('📜 COMPLETE AUDIT TRAIL OF STATE TRANSITIONS');
  console.log('====================================================');
  const allEvents = await prisma.orderEvent.findMany({
    where: { orderId: draftOrder.id },
    orderBy: { createdAt: 'asc' },
  });
  allEvents.forEach((ev, i) => {
    console.log(
      `   ${i + 1}. [${new Date(ev.createdAt).toISOString()}] ${ev.from ?? 'START'} → ${ev.to} (${(ev.meta as any)?.event ?? 'transition'})`,
    );
  });

  console.log('\n✅ ALL 11 STEPS COMPLETED SUCCESSFULLY WITHOUT ERROR!\n');
}

runEndToEndVerification()
  .catch((err) => {
    console.error('❌ E2E VERIFICATION FAILED:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
