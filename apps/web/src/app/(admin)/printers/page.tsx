import { PrintQueueService } from '@/server/services/print-queue.service';
import { PrintersClient } from './printers-client';

export const dynamic = 'force-dynamic';

export default async function PrintersAdminPage() {
  const printers = await PrintQueueService.listPrinters();
  const printersWithTelemetry = await Promise.all(
    printers.map(async (p) => {
      const tel = await PrintQueueService.getPrinterTelemetry(p.id);
      return {
        ...p,
        telemetry: tel ?? {
          nozzle: 0,
          bed: 0,
          online: p.enabled,
          updatedAt: p.lastSeenAt?.toISOString() ?? new Date().toISOString(),
        },
      };
    }),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
          3D Printer Fleet & Telemetry
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Monitor status mesin, nozzle and bed temperatures, dan integrasi Moonraker Klipper / Simulator.
        </p>
      </div>

      <PrintersClient initialPrinters={printersWithTelemetry} />
    </div>
  );
}
