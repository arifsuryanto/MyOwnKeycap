import { NextRequest, NextResponse } from 'next/server';
import { prisma, OrderStatus, PrintJobStatus } from '@keycap/db';
import { transition as transitionOrder } from '@keycap/shared';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { pass, notes } = body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { printJobs: { orderBy: { attempt: 'desc' }, take: 1 } },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status !== OrderStatus.QC) {
      return NextResponse.json(
        { error: `Cannot run QC on order in status ${order.status}` },
        { status: 400 },
      );
    }

    const event = pass ? 'qc_pass' : 'qc_fail';
    const nextStatus = transitionOrder(order.status, event);

    const updated = await prisma.$transaction(async (tx) => {
      const o = await tx.order.update({
        where: { id: order.id },
        data: { status: nextStatus },
      });

      await tx.orderEvent.create({
        data: {
          orderId: order.id,
          from: order.status,
          to: nextStatus,
          meta: { event: pass ? 'qc.passed' : 'qc.failed', notes },
        },
      });

      // If QC failed, requeue printing by creating a new print job
      if (!pass && order.printJobs[0]) {
        const lastJob = order.printJobs[0];
        await tx.printJob.create({
          data: {
            orderId: order.id,
            printerId: lastJob.printerId,
            status: PrintJobStatus.PENDING,
            plateJson: lastJob.plateJson ?? {},
            profileId: lastJob.profileId,
            material: lastJob.material,
            attempt: lastJob.attempt + 1,
            failureReason: notes ?? 'Failed visual/fit QC check',
          },
        });
      }

      return o;
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
