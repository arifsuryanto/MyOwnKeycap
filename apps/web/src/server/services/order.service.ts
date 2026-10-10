import crypto from 'crypto';
import { prisma, OrderStatus, PaymentStatus } from '@keycap/db';
import { transition as transitionOrder } from '@keycap/shared';
import { calculateQuote, type PricingConfig } from '@keycap/pricing';
import { getPaymentProvider } from './payment-provider';
import { PrintQueueService } from './print-queue.service';
import { env } from '@/lib/env';

export interface CreateOrderInput {
  userId: string;
  designId: string;
  bundleId?: string | null;
  addressId?: string | null;
  shippingCost?: number;
}

export class OrderService {
  /**
   * Fetch active pricing configuration
   */
  static async getActivePricingConfig(): Promise<PricingConfig> {
    const config = await prisma.pricingConfig.findFirst({
      where: { active: true },
      orderBy: { version: 'desc' },
    });

    if (config && config.json && typeof config.json === 'object') {
      const j: any = config.json;
      return {
        version: config.version,
        filamentCostPerGram: j.filamentCostPerGram ?? 350,
        machineRatePerHour: j.machineRatePerHour ?? 8000,
        laborRatePerHour: j.laborRatePerHour ?? 25000,
        postProcessMinutes: j.postProcessMinutes ?? 3,
        packagingPerKey: j.packagingPerKey ?? 500,
        packagingBase: j.packagingBase ?? 5000,
        failureRate: j.failureRate ?? 0.15,
        targetMargin: j.targetMargin ?? 0.4,
        roundTo: j.roundTo ?? 1000,
      };
    }

    // Default fallback
    return {
      version: 1,
      filamentCostPerGram: 350,
      machineRatePerHour: 8000,
      laborRatePerHour: 25000,
      postProcessMinutes: 3,
      packagingPerKey: 500,
      packagingBase: 5000,
      failureRate: env.FAILURE_RATE_DEFAULT ?? 0.15,
      targetMargin: 0.4,
      roundTo: 1000,
    };
  }

  /**
   * Create draft order from design
   */
  static async createDraftOrder(input: CreateOrderInput) {
    const design = await prisma.design.findUnique({
      where: { id: input.designId },
      include: {
        keyboardModel: true,
      },
    });

    if (!design) {
      throw new Error('Design not found');
    }

    const layout = (design.keyboardModel?.layoutJson ?? design.customLayout) as any;
    const keys: any[] = Array.isArray(layout?.keys) ? layout.keys : [];

    const pricingConfig = await this.getActivePricingConfig();

    // Prepare item quote inputs
    const quoteItems = keys.map((k, idx) => {
      const uSize = k.size || 1.0;
      const gramsWithSupport = Math.round(3.5 * Math.pow(uSize, 0.8) * 10) / 10;
      const printMinutes = Math.max(15, Math.round(20 * uSize));

      return {
        keyId: k.id || `key-${idx}`,
        qty: 1,
        gramsWithSupport,
        printMinutes,
      };
    });

    // Check bundle type if bundleId provided
    let bundleType: 'SAMPLER' | 'ACCENT' | 'FULL_SET' | undefined = undefined;
    if (input.bundleId) {
      const bundle = await prisma.bundle.findUnique({ where: { id: input.bundleId } });
      if (bundle) {
        if (bundle.code === 'sampler') bundleType = 'SAMPLER';
        else if (bundle.code === 'accent') bundleType = 'ACCENT';
        else if (bundle.code === 'full-set') bundleType = 'FULL_SET';
      }
    } else {
      bundleType = keys.length >= 60 ? 'FULL_SET' : 'ACCENT';
    }

    const quote = calculateQuote(
      {
        items: quoteItems,
        bundleType,
        shippingCost: input.shippingCost ?? 18000,
      },
      pricingConfig,
    );

    const publicCode = `KC-${Date.now().toString().slice(-6)}`;

    // Ensure we have at least one KeycapAsset to attach OrderItems to
    let fallbackAsset = await prisma.keycapAsset.findFirst({
      where: { specHash: design.specHash },
    });
    if (!fallbackAsset) {
      fallbackAsset = await prisma.keycapAsset.create({
        data: {
          specHash: design.specHash,
          paramsJson: { profile: 'CHERRY', unitSize: 1.0, row: 3 },
          stlKey: `designs/${design.specHash}/keys/default.stl`,
          threeMfKey: `designs/${design.specHash}/keys/default.3mf`,
          glbKey: `designs/${design.specHash}/keys/default.glb`,
          volumeMm3: 1500.0,
          estGrams: 3.5,
          printMinutes: 20,
          minWallMm: 1.5,
          validated: true,
        },
      });
    }

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          publicCode,
          userId: input.userId,
          designId: design.id,
          status: OrderStatus.DRAFT,
          subtotalIdr: quote.subtotal,
          discountIdr: quote.bundleDiscount,
          shippingIdr: quote.shipping,
          totalIdr: quote.total,
          pricingSnapshot: quote.pricingSnapshot as any,
          bundleId: input.bundleId ?? null,
          addressId: input.addressId ?? null,
          estimatedReadyAt: new Date(quote.estimatedReadyAt),
        },
      });

      // Create order items
      for (const item of quote.items) {
        await tx.orderItem.create({
          data: {
            orderId: createdOrder.id,
            assetId: fallbackAsset.id,
            qty: item.qty,
            unitPriceIdr: item.listPrice,
          },
        });
      }

      // Record created event
      await tx.orderEvent.create({
        data: {
          orderId: createdOrder.id,
          from: null,
          to: OrderStatus.DRAFT,
          actorId: input.userId,
          meta: { event: 'order.created', total: quote.total },
        },
      });

      return createdOrder;
    });

    return order;
  }

  /**
   * Checkout order: Transitions DRAFT -> AWAITING_PAYMENT, generates QRIS
   */
  static async checkoutOrder(orderId: string, userId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, payments: true },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.userId !== userId) {
      throw new Error('Unauthorized to checkout this order');
    }

    if (order.status !== OrderStatus.DRAFT && order.status !== OrderStatus.AWAITING_PAYMENT) {
      throw new Error(`Order cannot be checked out in status ${order.status}`);
    }

    // Check existing pending payment with valid QR
    const now = new Date();
    const existingPayment = order.payments.find(
      (p) => p.status === PaymentStatus.PENDING && p.expiresAt && p.expiresAt > now,
    );

    if (existingPayment) {
      return { order, payment: existingPayment };
    }

    // Advance state machine if still DRAFT
    if (order.status === OrderStatus.DRAFT) {
      const nextStatus = transitionOrder(order.status, 'checkout');
      await prisma.$transaction([
        prisma.order.update({
          where: { id: orderId },
          data: { status: nextStatus },
        }),
        prisma.orderEvent.create({
          data: {
            orderId,
            from: order.status,
            to: nextStatus,
            actorId: userId,
            meta: { event: 'order.checkout' },
          },
        }),
      ]);
    }

    // Request QRIS from active payment provider
    const provider = getPaymentProvider();
    const expiryMinutes = env.QRIS_EXPIRY_MIN ?? 30;
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
    const idempotencyKey = `pay_${orderId}_${Date.now()}`;

    const qris = await provider.createQris({
      orderId,
      amountIdr: order.totalIdr,
      expiresAt,
      idempotencyKey,
    });

    const payment = await prisma.payment.create({
      data: {
        orderId,
        provider: provider.name,
        providerRef: qris.providerRef,
        amountIdr: order.totalIdr,
        status: PaymentStatus.PENDING,
        qrString: qris.qrString,
        expiresAt: qris.expiresAt,
      },
    });

    return { order, payment };
  }

  /**
   * Handle signed payment webhook (Appendix C)
   */
  static async handleWebhook(
    providerName: string,
    headers: Record<string, string | string[] | undefined>,
    rawBody: string,
  ) {
    const provider = getPaymentProvider();
    if (provider.name !== providerName) {
      throw new Error(`Mismatched webhook provider: expected ${provider.name}, got ${providerName}`);
    }

    // 1. Verify webhook signature
    const verified = provider.verifyWebhook(headers, rawBody);
    const payloadHash = crypto.createHash('sha256').update(rawBody).digest('hex');

    // 2. Idempotency check via WebhookEvent
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: {
        provider_eventId: {
          provider: providerName,
          eventId: verified.eventId,
        },
      },
    });
    if (existingEvent) {
      return { duplicate: true, eventId: verified.eventId };
    }

    // 3. Process status update with transaction
    await prisma.$transaction(async (tx) => {
      // Record webhook event first
      await tx.webhookEvent.create({
        data: {
          provider: providerName,
          eventId: verified.eventId,
          payloadHash,
          processedAt: new Date(),
        },
      });

      // Find order and payment
      const order = await tx.order.findUnique({
        where: { id: verified.orderId },
        include: { payments: true },
      });

      if (!order) {
        throw new Error(`Order ${verified.orderId} not found in database`);
      }

      const payment =
        order.payments.find((p) => p.providerRef === verified.providerRef) ||
        order.payments[order.payments.length - 1];

      if (!payment) {
        throw new Error(`Payment record for order ${verified.orderId} not found`);
      }

      // Verify amount match
      if (verified.amountIdr !== payment.amountIdr) {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.NEEDS_REFUND },
        });
        throw new Error(
          `Amount mismatch: expected ${payment.amountIdr}, received ${verified.amountIdr}`,
        );
      }

      if (verified.status === 'PAID') {
        // Update payment
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.PAID,
            paidAt: verified.paidAt ?? new Date(),
          },
        });

        // Advance Order State Machine
        if (order.status === OrderStatus.AWAITING_PAYMENT) {
          const nextStatus = transitionOrder(order.status, 'webhook_paid');
          await tx.order.update({
            where: { id: order.id },
            data: {
              status: nextStatus,
              paidAt: verified.paidAt ?? new Date(),
            },
          });

          await tx.orderEvent.create({
            data: {
              orderId: order.id,
              from: order.status,
              to: nextStatus,
              meta: {
                event: 'payment.paid',
                providerRef: verified.providerRef,
                amountIdr: verified.amountIdr,
              },
            },
          });

          // Auto-queue: PAID -> QUEUED
          const queuedStatus = transitionOrder(nextStatus, 'auto_queue');
          await tx.order.update({
            where: { id: order.id },
            data: { status: queuedStatus },
          });

          await tx.orderEvent.create({
            data: {
              orderId: order.id,
              from: nextStatus,
              to: queuedStatus,
              meta: { event: 'order.auto_queue' },
            },
          });
        }
      } else if (verified.status === 'EXPIRED') {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.EXPIRED },
        });

        if (order.status === OrderStatus.AWAITING_PAYMENT) {
          const nextStatus = transitionOrder(order.status, 'timeout');
          await tx.order.update({
            where: { id: order.id },
            data: { status: nextStatus },
          });

          await tx.orderEvent.create({
            data: {
              orderId: order.id,
              from: order.status,
              to: nextStatus,
              meta: { event: 'payment.expired' },
            },
          });
        }
      }
    });

    if (verified.status === 'PAID') {
      try {
        await PrintQueueService.createJobForOrder(verified.orderId);
      } catch (err) {
        console.warn(`[OrderService] Auto-queue print job creation failed:`, err);
      }
    }

    return { success: true, eventId: verified.eventId };
  }

  /**
   * Cancel order (user action)
   */
  static async cancelOrder(orderId: string, userId: string, reason?: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new Error('Order not found');
    if (order.userId !== userId) throw new Error('Unauthorized');

    if (order.status !== OrderStatus.AWAITING_PAYMENT && order.status !== OrderStatus.DRAFT) {
      throw new Error(`Order in status ${order.status} cannot be cancelled`);
    }

    const nextStatus =
      order.status === OrderStatus.DRAFT
        ? OrderStatus.CANCELLED
        : transitionOrder(order.status, 'user_cancel');

    return prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { status: nextStatus },
      }),
      prisma.orderEvent.create({
        data: {
          orderId,
          from: order.status,
          to: nextStatus,
          actorId: userId,
          meta: { event: 'order.cancelled', reason },
        },
      }),
    ]);
  }

  /**
   * Get order detail
   */
  static async getOrder(orderId: string, userId: string) {
    return prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        design: true,
        items: {
          include: { asset: true },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
        events: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  /**
   * Get user order history
   */
  static async getUserOrders(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        design: true,
        items: {
          include: { asset: true },
        },
        payments: true,
      },
    });
  }
}
