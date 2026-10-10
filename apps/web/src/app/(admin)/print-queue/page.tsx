import { PrintQueueService } from '@/server/services/print-queue.service';
import { PrintQueueClient } from './print-queue-client';

export const dynamic = 'force-dynamic';

export default async function PrintQueuePage() {
  const [jobs, printers] = await Promise.all([
    PrintQueueService.listPrintJobs(),
    PrintQueueService.listPrinters(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
          Print Queue & Plate Dispatch
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Kelola antrean cetak 3MF/G-code, delegasikan ke printer aktif, dan monitor progress piringan.
        </p>
      </div>

      <PrintQueueClient initialJobs={jobs} printers={printers} />
    </div>
  );
}
