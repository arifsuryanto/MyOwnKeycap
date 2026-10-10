import { NextRequest, NextResponse } from 'next/server';
import { PrintQueueService } from '@/server/services/print-queue.service';
import { prisma, PrintJobStatus, OrderStatus } from '@keycap/db';
import { transition as transitionOrder } from '@keycap/shared';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, printerId, reason, metrics } = body;

    if (action === 'start') {
      const job = await PrintQueueService.startJob(id, printerId);
      return NextResponse.json({ success: true, job });
    }

    if (action === 'complete') {
      const job = await PrintQueueService.completeJob(id, metrics);
      return NextResponse.json({ success: true, job });
    }

    if (action === 'fail') {
      const job = await PrintQueueService.failJob(id, reason ?? 'Operator aborted');
      return NextResponse.json({ success: true, job });
    }

    if (action === 'reprint') {
      const currentJob = await prisma.printJob.findUnique({
        where: { id },
        include: { order: true },
      });

      if (!currentJob) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }

      // Transition order PRINT_FAILED -> QUEUED
      if (currentJob.order.status === OrderStatus.PRINT_FAILED) {
        const nextStatus = transitionOrder(currentJob.order.status, 'reprint');
        await prisma.order.update({
          where: { id: currentJob.order.id },
          data: { status: nextStatus },
        });
      }

      // Create new print job with attempt + 1
      const newJob = await prisma.printJob.create({
        data: {
          orderId: currentJob.orderId,
          printerId: printerId ?? currentJob.printerId,
          status: PrintJobStatus.PENDING,
          plateJson: currentJob.plateJson ?? {},
          profileId: currentJob.profileId,
          material: currentJob.material,
          attempt: currentJob.attempt + 1,
        },
      });

      return NextResponse.json({ success: true, job: newJob });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
