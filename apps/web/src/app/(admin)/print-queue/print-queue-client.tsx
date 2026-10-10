'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Play,
  CheckCircle,
  AlertOctagon,
  RotateCcw,
  Clock,
  Printer as PrinterIcon,
  Filter,
  Check,
  RefreshCw,
} from 'lucide-react';

interface PrintQueueClientProps {
  initialJobs: any[];
  printers: any[];
}

export function PrintQueueClient({ initialJobs, printers }: PrintQueueClientProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<string>('ALL');
  const [loadingJobId, setLoadingJobId] = useState<string | null>(null);
  const [selectedPrinter, setSelectedPrinter] = useState<string>(
    printers[0]?.id ?? '',
  );

  const filteredJobs = initialJobs.filter((job) => {
    if (filter === 'ALL') return true;
    return job.status === filter;
  });

  const handleAction = async (jobId: string, action: string, extra?: Record<string, any>) => {
    setLoadingJobId(jobId);
    try {
      const res = await fetch(`/api/admin/print-jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...extra }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(`Error: ${err.error || 'Failed to update job'}`);
        return;
      }

      router.refresh();
    } catch (err: any) {
      alert(`Network error: ${err.message}`);
    } finally {
      setLoadingJobId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Control bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 backdrop-blur-sm">
        {/* Status filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="h-4 w-4 text-zinc-500 mr-2 shrink-0" />
          {['ALL', 'PENDING', 'PRINTING', 'DONE', 'FAILED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                filter === st
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Printer selector & Refresh */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <PrinterIcon className="h-3.5 w-3.5 text-emerald-400" />
            <span>Target Printer:</span>
            <select
              value={selectedPrinter}
              onChange={(e) => setSelectedPrinter(e.target.value)}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-xs text-zinc-200 focus:border-amber-500 focus:outline-none"
            >
              {printers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.adapter})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => router.refresh()}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Jobs Grid / List */}
      {filteredJobs.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-12 text-center text-zinc-500">
          <p className="text-base font-medium">Tidak ada print job dengan status {filter}</p>
          <p className="text-xs mt-1">
            Pesanan yang telah dibayar (PAID) akan otomatis masuk ke antrean di sini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredJobs.map((job) => {
            const plate = (job.plateJson as Record<string, unknown>) ?? {};
            const estMinutes = typeof plate['estMinutes'] === 'number' ? plate['estMinutes'] : 45;
            const isLoading = loadingJobId === job.id;

            return (
              <div
                key={job.id}
                className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-5 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-5 transition hover:border-zinc-700"
              >
                {/* Info block */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {job.order?.publicCode ?? 'ORDER'}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                        job.status === 'PRINTING'
                          ? 'bg-yellow-950/60 text-yellow-300 border-yellow-800/60 animate-pulse'
                          : job.status === 'DONE'
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                            : job.status === 'FAILED'
                              ? 'bg-red-950/60 text-red-300 border-red-800/60'
                              : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                      }`}
                    >
                      {job.status}
                    </span>
                    {job.attempt > 1 && (
                      <span className="text-xs bg-purple-950/60 text-purple-300 border border-purple-800/60 px-2 py-0.5 rounded">
                        Attempt #{job.attempt}
                      </span>
                    )}
                  </div>

                  <div className="text-sm font-medium text-white flex items-center gap-3">
                    <span>
                      Material: <strong className="text-amber-300">{job.material}</strong>
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-400">Profile: {job.profileId}</span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-400 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-zinc-500" />
                      Est. ~{estMinutes} min
                    </span>
                  </div>

                  <div className="text-xs text-zinc-500 flex flex-wrap gap-4">
                    <span>Job ID: <code className="font-mono">{job.id.slice(0, 12)}...</code></span>
                    <span>Printer: {job.printer?.name ?? 'Unassigned'}</span>
                    <span>Created: {new Date(job.createdAt).toLocaleTimeString('id-ID')}</span>
                  </div>

                  {job.failureReason && (
                    <div className="text-xs text-rose-400 bg-rose-950/30 border border-rose-900/40 rounded-lg p-2 mt-2">
                      <strong>Failure reason:</strong> {job.failureReason}
                    </div>
                  )}
                </div>

                {/* Operator Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {job.status === 'PENDING' && (
                    <button
                      onClick={() =>
                        handleAction(job.id, 'start', { printerId: selectedPrinter })
                      }
                      disabled={isLoading}
                      className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs font-bold text-black shadow-lg shadow-amber-500/20 transition active:scale-95 disabled:opacity-50"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      {isLoading ? 'Starting...' : 'Start Printing'}
                    </button>
                  )}

                  {job.status === 'PRINTING' && (
                    <>
                      <button
                        onClick={() =>
                          handleAction(job.id, 'complete', {
                            metrics: { actualMinutes: estMinutes, filamentUsedG: 14.5 },
                          })
                        }
                        disabled={isLoading}
                        className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition active:scale-95 disabled:opacity-50"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        {isLoading ? 'Updating...' : 'Finish Print (Pass to QC)'}
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Alasan kegagalan cetak:', 'Warping / Bed adhesion failure');
                          if (reason) handleAction(job.id, 'fail', { reason });
                        }}
                        disabled={isLoading}
                        className="flex items-center gap-2 rounded-xl border border-red-800/80 bg-red-950/40 hover:bg-red-900/60 px-3 py-2 text-xs font-semibold text-red-300 transition active:scale-95 disabled:opacity-50"
                      >
                        <AlertOctagon className="h-3.5 w-3.5" />
                        Fail
                      </button>
                    </>
                  )}

                  {job.status === 'FAILED' && (
                    <button
                      onClick={() =>
                        handleAction(job.id, 'reprint', { printerId: selectedPrinter })
                      }
                      disabled={isLoading}
                      className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-purple-600/20 transition active:scale-95 disabled:opacity-50"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      {isLoading ? 'Reprinting...' : 'Reprint Plate (Attempt +1)'}
                    </button>
                  )}

                  {job.status === 'DONE' && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-3 py-1.5 rounded-xl">
                      <Check className="h-3.5 w-3.5" />
                      Printed Successfully
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
