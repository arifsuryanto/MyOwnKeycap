import { prisma, PrintJobStatus, OrderStatus, Prisma } from '@keycap/db';
import { transition as transitionOrder } from '@keycap/shared';
import { redis } from '@/lib/redis';

export interface UpdateProgressInput {
  jobId: string;
  state: string;
  percent: number;
  temps?: {
    nozzle: number;
    bed: number;
  };
}

export class PrintQueueService {
  /**
   * List print jobs for the operator dashboard
   */
  static async listPrintJobs(status?: PrintJobStatus) {
    const where: Prisma.PrintJobWhereInput = {};
    if (status) where.status = status;

    return prisma.printJob.findMany({
      where,
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      include: {
        printer: true,
        order: {
          include: {
            user: true,
            design: {
              include: { keyboardModel: true },
            },
          },
        },
      },
    });
  }

  /**
   * Create a print job for an order
   */
  static async createJobForOrder(orderId: string, estMinutes: number = 45) {
    // Select default available printer (simulator or active hardware)
    const printer = await prisma.printer.findFirst({
      where: { enabled: true },
      orderBy: [{ lastSeenAt: 'desc' }, { createdAt: 'asc' }],
    });

    const job = await prisma.printJob.create({
      data: {
        orderId,
        printerId: printer?.id ?? null,
        status: PrintJobStatus.PENDING,
        plateJson: {
          estMinutes,
          plateFileKey: `plates/order-${orderId}.3mf`,
        },
        profileId: 'standard-petg-0.2mm',
        material: 'PETG',
      },
    });

    return job;
  }

  /**
   * Start a print job (operator approve or agent claim)
   */
  static async startJob(jobId: string, printerId?: string) {
    const job = await prisma.printJob.findUnique({
      where: { id: jobId },
      include: { order: true },
    });

    if (!job) throw new Error('Print job not found');

    const updated = await prisma.$transaction(async (tx) => {
      const j = await tx.printJob.update({
        where: { id: jobId },
        data: {
          status: PrintJobStatus.PRINTING,
          startedAt: new Date(),
          printerId: printerId ?? job.printerId,
        },
      });

      if (job.order) {
        let currentStatus = job.order.status;
        if (currentStatus === OrderStatus.QUEUED) {
          const pendingApproval = transitionOrder(currentStatus, 'plate_ready');
          await tx.orderEvent.create({
            data: {
              orderId: job.order.id,
              from: currentStatus,
              to: pendingApproval,
              meta: { event: 'plate.ready', printJobId: jobId },
            },
          });
          currentStatus = pendingApproval;
        }

        if (currentStatus === OrderStatus.PENDING_APPROVAL) {
          const printingStatus = transitionOrder(currentStatus, 'admin_approve');
          await tx.order.update({
            where: { id: job.order.id },
            data: { status: printingStatus },
          });

          await tx.orderEvent.create({
            data: {
              orderId: job.order.id,
              from: currentStatus,
              to: printingStatus,
              meta: { event: 'print.started', printJobId: jobId },
            },
          });
        }
      }

      return j;
    });

    return updated;
  }

  /**
   * Complete print job -> advances order to POST_PROCESSING and auto-transitions to QC
   */
  static async completeJob(jobId: string, metrics?: { actualMinutes?: number; filamentUsedG?: number }) {
    const job = await prisma.printJob.findUnique({
      where: { id: jobId },
      include: { order: true },
    });

    if (!job) throw new Error('Print job not found');

    const plate = (job.plateJson as Record<string, unknown>) ?? {};
    const estMinutes = typeof plate['estMinutes'] === 'number' ? plate['estMinutes'] : 45;

    return prisma.$transaction(async (tx) => {
      const updatedJob = await tx.printJob.update({
        where: { id: jobId },
        data: {
          status: PrintJobStatus.DONE,
          finishedAt: new Date(),
          plateJson: {
            ...plate,
            actualMinutes: metrics?.actualMinutes ?? estMinutes,
            filamentUsedG: metrics?.filamentUsedG ?? 15.0,
          },
        },
      });

      if (job.order && job.order.status === OrderStatus.PRINTING) {
        // Transition PRINTING -> POST_PROCESSING
        const postProcStatus = transitionOrder(job.order.status, 'print_done');
        // Transition POST_PROCESSING -> QC
        const qcStatus = transitionOrder(postProcStatus, 'post_process_done');

        await tx.order.update({
          where: { id: job.order.id },
          data: { status: qcStatus },
        });

        await tx.orderEvent.create({
          data: {
            orderId: job.order.id,
            from: job.order.status,
            to: qcStatus,
            meta: { event: 'print.completed', printJobId: jobId },
          },
        });
      }

      return updatedJob;
    });
  }

  /**
   * Fail print job -> transitions order to PRINT_FAILED
   */
  static async failJob(jobId: string, reason: string) {
    const job = await prisma.printJob.findUnique({
      where: { id: jobId },
      include: { order: true },
    });

    if (!job) throw new Error('Print job not found');

    return prisma.$transaction(async (tx) => {
      const updatedJob = await tx.printJob.update({
        where: { id: jobId },
        data: {
          status: PrintJobStatus.FAILED,
          failureReason: reason,
          finishedAt: new Date(),
        },
      });

      if (job.order && job.order.status === OrderStatus.PRINTING) {
        const failStatus = transitionOrder(job.order.status, 'print_failed');
        await tx.order.update({
          where: { id: job.order.id },
          data: { status: failStatus },
        });

        await tx.orderEvent.create({
          data: {
            orderId: job.order.id,
            from: job.order.status,
            to: failStatus,
            meta: { event: 'print.failed', reason },
          },
        });
      }

      return updatedJob;
    });
  }

  /**
   * List all registered 3D printers and active jobs
   */
  static async listPrinters() {
    return prisma.printer.findMany({
      orderBy: { name: 'asc' },
      include: {
        agent: true,
        printJobs: {
          where: { status: PrintJobStatus.PRINTING },
          take: 1,
        },
      },
    });
  }

  /**
   * Update printer telemetry (temps, status)
   */
  static async updatePrinterTelemetry(
    printerId: string,
    nozzle: number,
    bed: number,
    online: boolean = true,
  ) {
    try {
      await redis.set(
        `printer:telemetry:${printerId}`,
        JSON.stringify({ nozzle, bed, online, updatedAt: new Date().toISOString() }),
        'EX',
        60,
      );
    } catch {
      // Non-fatal if Redis is temporarily unreachable
    }

    return prisma.printer.update({
      where: { id: printerId },
      data: {
        lastSeenAt: new Date(),
        enabled: online,
      },
    });
  }

  /**
   * Get cached telemetry from Redis
   */
  static async getPrinterTelemetry(printerId: string): Promise<{
    nozzle: number;
    bed: number;
    online: boolean;
    updatedAt: string;
  } | null> {
    try {
      const raw = await redis.get(`printer:telemetry:${printerId}`);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return null;
  }
}
