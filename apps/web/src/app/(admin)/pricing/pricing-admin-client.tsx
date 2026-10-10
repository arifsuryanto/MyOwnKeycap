'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DollarSign,
  Layers,
  Sparkles,
  CheckCircle2,
  Plus,
  Save,
  Calculator,
} from 'lucide-react';

interface PricingAdminClientProps {
  configs: any[];
}

function formatIdr(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function PricingAdminClient({ configs }: PricingAdminClientProps) {
  const router = useRouter();
  const activeConfig = configs.find((c) => c.active) || configs[0];
  const activeData = (activeConfig?.json as any) || {
    materialCostPerGram: 180,
    machineRatePerHour: 8000,
    laborRatePerJob: 5000,
    packagingCost: 6000,
    failureRiskPercent: 15,
    targetMarginPercent: 40,
  };

  const [version, setVersion] = useState(`v${configs.length + 1}.0`);
  const [materialCostPerGram, setMaterialCostPerGram] = useState(activeData.materialCostPerGram || 180);
  const [machineRatePerHour, setMachineRatePerHour] = useState(activeData.machineRatePerHour || 8000);
  const [laborRatePerJob, setLaborRatePerJob] = useState(activeData.laborRatePerJob || 5000);
  const [packagingCost, setPackagingCost] = useState(activeData.packagingCost || 6000);
  const [failureRiskPercent, setFailureRiskPercent] = useState(activeData.failureRiskPercent || 15);
  const [targetMarginPercent, setTargetMarginPercent] = useState(activeData.targetMarginPercent || 40);
  const [saving, setSaving] = useState(false);

  // Live simulation for 1 single 1U keycap (1.8g, 25 minutes)
  const simWeightG = 1.8;
  const simHours = 25 / 60;
  const simMatCost = simWeightG * materialCostPerGram;
  const simMachCost = simHours * machineRatePerHour;
  const simBaseCost = simMatCost + simMachCost + (laborRatePerJob / 10) + (packagingCost / 10);
  const simWithRisk = simBaseCost * (1 + failureRiskPercent / 100);
  const simWithMargin = simWithRisk * (1 + targetMarginPercent / 100);
  const simFinalRounded = Math.ceil(simWithMargin / 1000) * 1000;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version,
          json: {
            materialCostPerGram,
            machineRatePerHour,
            laborRatePerJob,
            packagingCost,
            failureRiskPercent,
            targetMarginPercent,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(`Error: ${err.error || 'Failed to save pricing config'}`);
        return;
      }

      alert(`Sukses! Versi konfigurasi ${version} berhasil diaktifkan.`);
      router.refresh();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Live Formula Banner */}
      <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-zinc-900/60 to-zinc-900/40 p-6 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calculator className="h-3.5 w-3.5" /> Rumus Kalkulasi Resmi (Section 2.4)
            </span>
            <p className="font-mono text-sm sm:text-base text-zinc-100 mt-2 font-medium">
              Price = ⌈(Material + Machine + Labor + Packaging) × (1 + FailureRisk%) × (1 + Margin%)⌉<sub>Rp 1.000</sub>
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-zinc-400">Simulasi 1U Keycap PETG:</span>
            <div className="text-2xl font-bold text-amber-400 font-mono mt-0.5">
              {formatIdr(simFinalRounded)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Form */}
        <form
          onSubmit={handleSave}
          className="lg:col-span-2 rounded-3xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-sm space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              Buat / Update Konfigurasi Tarif
            </h2>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1 text-xs font-mono text-amber-400 focus:border-amber-500 focus:outline-none"
              placeholder="v1.1"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Filament cost per gram */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Biaya Filament (Rp / gram)
              </label>
              <input
                type="number"
                value={materialCostPerGram}
                onChange={(e) => setMaterialCostPerGram(Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none"
              />
              <span className="text-[11px] text-zinc-500">
                Default PETG spul Rp 180.000/kg = Rp 180/g
              </span>
            </div>

            {/* Machine rate per hour */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Tarif Mesin (Rp / jam)
              </label>
              <input
                type="number"
                value={machineRatePerHour}
                onChange={(e) => setMachineRatePerHour(Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none"
              />
              <span className="text-[11px] text-zinc-500">
                Depresiasi printer + listrik ~350W
              </span>
            </div>

            {/* Labor rate */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Ongkos Kerja / Operator (Rp / batch)
              </label>
              <input
                type="number"
                value={laborRatePerJob}
                onChange={(e) => setLaborRatePerJob(Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none"
              />
              <span className="text-[11px] text-zinc-500">
                Prep bed, support removal, QC audit
              </span>
            </div>

            {/* Packaging */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Packaging & Label Box (Rp / order)
              </label>
              <input
                type="number"
                value={packagingCost}
                onChange={(e) => setPackagingCost(Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none"
              />
              <span className="text-[11px] text-zinc-500">
                Box hardbox + bubble wrap anti static
              </span>
            </div>

            {/* Failure risk % */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Markup Risiko Kegagalan Cetak (%)
              </label>
              <input
                type="number"
                value={failureRiskPercent}
                onChange={(e) => setFailureRiskPercent(Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none"
              />
              <span className="text-[11px] text-zinc-500">
                Sesuai Spec: 15% buffer resiko warping/spaghetti
              </span>
            </div>

            {/* Target margin % */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Target Margin Keuntungan (%)
              </label>
              <input
                type="number"
                value={targetMarginPercent}
                onChange={(e) => setTargetMarginPercent(Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none"
              />
              <span className="text-[11px] text-zinc-500">
                Default 40% gross profit margin
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800/80 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-2.5 text-xs font-bold text-black shadow-lg shadow-amber-500/20 transition active:scale-95 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Menyimpan...' : 'Aktifkan Konfigurasi Baru'}
            </button>
          </div>
        </form>

        {/* History / Previous Configs */}
        <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-sm space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="h-4 w-4 text-zinc-400" />
            Riwayat Versi Tarif
          </h3>

          <div className="space-y-3">
            {configs.map((c) => (
              <div
                key={c.id}
                className={`rounded-2xl border p-3.5 transition ${
                  c.active
                    ? 'border-emerald-500/50 bg-emerald-950/20'
                    : 'border-zinc-800 bg-zinc-950/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white">
                    {c.version}
                  </span>
                  {c.active && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 uppercase bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="h-3 w-3" /> Active
                    </span>
                  )}
                </div>
                <div className="mt-2 text-[11px] text-zinc-400 space-y-0.5">
                  <p>Filament: Rp {(c.json as any)?.materialCostPerGram || 180}/g</p>
                  <p>Machine: Rp {(c.json as any)?.machineRatePerHour || 8000}/h</p>
                  <p>Margin: {(c.json as any)?.targetMarginPercent || 40}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
