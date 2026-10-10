'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Printer as PrinterIcon,
  Flame,
  Layers,
  Thermometer,
  RefreshCw,
  Zap,
  CheckCircle2,
} from 'lucide-react';

interface PrintersClientProps {
  initialPrinters: any[];
}

export function PrintersClient({ initialPrinters }: PrintersClientProps) {
  const router = useRouter();
  const [printers] = useState(initialPrinters);
  const [testingId, setTestingId] = useState<string | null>(null);

  const simulateWarmup = async (printerId: string) => {
    setTestingId(printerId);
    try {
      await fetch('/api/agent/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          printerId,
          nozzleTemp: 240,
          bedTemp: 75,
          state: 'idle',
        }),
      });
      router.refresh();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setTestingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => router.refresh()}
          className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Status
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {printers.map((printer) => {
          const tel = printer.telemetry;
          const isPrinting = printer.printJobs?.length > 0;
          const nozzleTemp = tel?.nozzle ?? 0;
          const bedTemp = tel?.bed ?? 0;
          const nozzlePercent = Math.min(100, Math.round((nozzleTemp / (printer.maxNozzleC || 300)) * 100));
          const bedPercent = Math.min(100, Math.round((bedTemp / (printer.maxBedC || 120)) * 100));

          return (
            <div
              key={printer.id}
              className="rounded-3xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-sm relative overflow-hidden transition hover:border-zinc-700"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-emerald-400 shadow-inner">
                    <PrinterIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      {printer.name}
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {printer.adapter}
                      </span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Bed: {printer.bedX} × {printer.bedY} × {printer.bedZ} mm
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-950/50 text-emerald-300 border border-emerald-800/60">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  ONLINE
                </div>
              </div>

              {/* Thermal Indicators */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                {/* Nozzle */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                  <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                    <span className="flex items-center gap-1 font-medium">
                      <Flame className="h-3.5 w-3.5 text-amber-500" /> Nozzle Temp
                    </span>
                    <span className="font-mono text-zinc-200">{nozzleTemp}°C / {printer.maxNozzleC}°C</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-500"
                      style={{ width: `${nozzlePercent}%` }}
                    />
                  </div>
                </div>

                {/* Bed */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                  <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                    <span className="flex items-center gap-1 font-medium">
                      <Thermometer className="h-3.5 w-3.5 text-blue-400" /> Bed Temp
                    </span>
                    <span className="font-mono text-zinc-200">{bedTemp}°C / {printer.maxBedC}°C</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                      style={{ width: `${bedPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Active Print Status */}
              <div className="mt-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/40 p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-amber-400" /> Status Produksi:
                  </span>
                  {isPrinting ? (
                    <span className="font-semibold text-yellow-400 animate-pulse">Printing Active Plate...</span>
                  ) : (
                    <span className="font-semibold text-zinc-400">Idle (Ready for Jobs)</span>
                  )}
                </div>

                {isPrinting && (
                  <div className="mt-3 text-xs text-zinc-400">
                    Job ID: <code className="font-mono text-zinc-300">{printer.printJobs[0]?.id}</code>
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="mt-5 flex items-center justify-between pt-4 border-t border-zinc-800/80">
                <span className="text-xs text-zinc-500">
                  Last seen: {new Date(printer.lastSeenAt || Date.now()).toLocaleTimeString('id-ID')}
                </span>
                <button
                  onClick={() => simulateWarmup(printer.id)}
                  disabled={testingId === printer.id}
                  className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition active:scale-95 disabled:opacity-50"
                >
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                  {testingId === printer.id ? 'Warming...' : 'Test Thermal Warmup'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
