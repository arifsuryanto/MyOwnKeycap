import { NextRequest, NextResponse } from 'next/server';
import { PrintQueueService } from '@/server/services/print-queue.service';
import { prisma } from '@keycap/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { printerId, nozzleTemp, bedTemp, state, percent, jobId } = body;

    if (!printerId) {
      return NextResponse.json({ error: 'printerId is required' }, { status: 400 });
    }

    const nozzle = typeof nozzleTemp === 'number' ? nozzleTemp : 200;
    const bed = typeof bedTemp === 'number' ? bedTemp : 60;
    const isOnline = state !== 'offline';

    await PrintQueueService.updatePrinterTelemetry(printerId, nozzle, bed, isOnline);

    // If job progress reported, update job progress
    if (jobId && typeof percent === 'number') {
      if (percent >= 100) {
        await PrintQueueService.completeJob(jobId);
      }
    }

    return NextResponse.json({ ok: true, timestamp: Date.now() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const printerId = searchParams.get('printerId');

    if (printerId) {
      const telemetry = await PrintQueueService.getPrinterTelemetry(printerId);
      return NextResponse.json({ telemetry });
    }

    // Return list of all printers with telemetry
    const printers = await PrintQueueService.listPrinters();
    const withTelemetry = await Promise.all(
      printers.map(async (p) => {
        const tel = await PrintQueueService.getPrinterTelemetry(p.id);
        return {
          ...p,
          telemetry: tel ?? {
            nozzle: 0,
            bed: 0,
            online: p.enabled && p.lastSeenAt ? Date.now() - new Date(p.lastSeenAt).getTime() < 120000 : false,
            updatedAt: p.lastSeenAt?.toISOString() ?? new Date().toISOString(),
          },
        };
      }),
    );

    return NextResponse.json({ printers: withTelemetry });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
