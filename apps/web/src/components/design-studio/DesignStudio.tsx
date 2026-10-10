'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface KeyboardModelOption {
  id: string;
  slug: string;
  name: string;
  brand: string;
  keyCount: number;
  layoutJson: any;
}

interface DesignStudioProps {
  initialModels: KeyboardModelOption[];
  selectedModelSlug?: string | undefined;
}

const PRESET_PROMPTS = [
  'Retro 80s Synthwave aesthetic dengan ungu neon, pink fuchsia, dan aksen cyan',
  'Matcha Latte santai dengan sage green lembut, aksen cream, dan font minimalis',
  'Dark Cyberpunk industrial dengan bodi graphite matte dan aksen hazard orange pada Enter & Esc',
  'Nordic Moss Forest dengan nuansa dedaunan pinus hijau gelap dan font monospaced',
];

export default function DesignStudio({
  initialModels,
  selectedModelSlug,
}: DesignStudioProps) {
  const initialModel =
    initialModels.find((m) => m.slug === selectedModelSlug) || initialModels[0];

  const [selectedModel, setSelectedModel] = useState<KeyboardModelOption | undefined>(
    initialModel,
  );
  const [prompt, setPrompt] = useState('');
  const [profile, setProfile] = useState<'CHERRY' | 'OEM'>('CHERRY');
  const [material, setMaterial] = useState<'PETG' | 'PLA' | 'ASA'>('PETG');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedSpec, setGeneratedSpec] = useState<any | null>(null);
  const [designId, setDesignId] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !selectedModel) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          keyboardModelId: selectedModel.id,
          options: {
            profile,
            material,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal membuat desain');
      }

      setGeneratedSpec(data.data.spec);
      setDesignId(data.data.designId);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to get key appearance
  const getKeyStyle = (keyItem: any) => {
    if (!generatedSpec) {
      return {
        backgroundColor: '#27272a',
        color: '#a1a1aa',
        borderColor: '#3f3f46',
      };
    }

    const { global, overrides } = generatedSpec;
    let baseColor = global.baseColor || '#1a1a1a';
    let legendColor = global.legendColor || '#f4f4f5';

    // Find override for this key
    if (Array.isArray(overrides)) {
      const directOverride = overrides.find(
        (o: any) =>
          o.target?.keyId === keyItem.id ||
          (o.target?.group && o.target.group === keyItem.group),
      );
      if (directOverride) {
        if (directOverride.baseColor) baseColor = directOverride.baseColor;
        if (directOverride.legendColor) legendColor = directOverride.legendColor;
      }
    }

    return {
      backgroundColor: baseColor,
      color: legendColor,
      borderColor: `${legendColor}33`,
    };
  };

  const keys: any[] = selectedModel?.layoutJson?.keys || [];
  const rowNumbers = Array.from(new Set(keys.map((k) => k.row))).sort(
    (a, b) => a - b,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Banner */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            AI Keycap Studio
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Deskripsikan konsep dan estetika keycap Anda. AI mendesain skema warna, font, dan geometri yang siap cetak.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
            Gemini 3.8 Flash Engine
          </span>
          <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-400">
            5 Kuota Gratis / Hari
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Control Panel (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <form
            onSubmit={handleGenerate}
            className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-md shadow-2xl"
          >
            <h2 className="text-lg font-bold text-white mb-4">Parameter Desain</h2>

            {/* Model Selector */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-zinc-300 mb-2">
                1. Target Keyboard
              </label>
              <select
                value={selectedModel?.slug}
                onChange={(e) => {
                  const found = initialModels.find((m) => m.slug === e.target.value);
                  if (found) setSelectedModel(found);
                }}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 shadow-inner focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                {initialModels.map((m) => (
                  <option key={m.id} value={m.slug}>
                    {m.brand} {m.name} ({m.keyCount} Keys)
                  </option>
                ))}
              </select>
            </div>

            {/* Prompt Textarea */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-zinc-300">
                  2. Prompt Tema &amp; Estetika
                </label>
                <span className="text-[11px] text-zinc-500">
                  {prompt.length}/600
                </span>
              </div>
              <textarea
                rows={4}
                maxLength={600}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Deskripsikan warna, nuansa, mood, atau gaya... Contoh: Nuansa kedai kopi sore hari dengan cokelat espresso, beige latte cream, dan aksen karamel pada spasi."
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3.5 text-sm text-zinc-100 placeholder-zinc-500 shadow-inner focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            {/* Preset chips */}
            <div className="mb-6">
              <p className="text-[11px] font-semibold text-zinc-400 mb-2">
                Inspirasi Tema Cepat:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_PROMPTS.map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPrompt(preset)}
                    className="rounded-lg border border-zinc-800 bg-zinc-950/70 px-2.5 py-1 text-[11px] text-zinc-300 transition hover:border-violet-500/40 hover:text-white text-left"
                  >
                    {preset.split('dengan')[0]}...
                  </button>
                ))}
              </div>
            </div>

            {/* Profile & Material Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  Profil
                </label>
                <div className="flex rounded-xl border border-zinc-700 bg-zinc-950 p-1">
                  <button
                    type="button"
                    onClick={() => setProfile('CHERRY')}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                      profile === 'CHERRY'
                        ? 'bg-violet-600 text-white shadow-md'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Cherry
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfile('OEM')}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                      profile === 'OEM'
                        ? 'bg-violet-600 text-white shadow-md'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    OEM
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  Material
                </label>
                <div className="flex rounded-xl border border-zinc-700 bg-zinc-950 p-1">
                  {(['PETG', 'PLA'] as const).map((mat) => (
                    <button
                      key={mat}
                      type="button"
                      onClick={() => setMaterial(mat)}
                      className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                        material === mat
                          ? 'bg-violet-600 text-white shadow-md'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {mat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-500/40 bg-red-950/30 p-3 text-xs text-red-300">
                ⚠️ {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 text-sm font-bold text-white shadow-xl shadow-violet-600/30 transition hover:shadow-violet-600/50 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Menganalisis &amp; Merancang Desain...
                </span>
              ) : (
                'Generate Desain AI ✨'
              )}
            </button>
          </form>
        </div>

        {/* Right Preview Panel (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Preview Layout Keycap
                </h2>
                <p className="text-xs text-zinc-400">
                  {selectedModel?.brand} {selectedModel?.name} • {selectedModel?.keyCount} Tombol
                </p>
              </div>

              {generatedSpec && (
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400">
                  Desain Siap
                </span>
              )}
            </div>

            {/* Theme metadata banner if generated */}
            {generatedSpec && (
              <div className="mb-6 rounded-2xl border border-violet-500/30 bg-violet-950/20 p-4">
                <h3 className="text-base font-bold text-violet-200">
                  {generatedSpec.theme.name}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-zinc-300">
                  {generatedSpec.theme.description}
                </p>

                {/* Color swatches */}
                <div className="mt-3 flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-4 w-4 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: generatedSpec.global.baseColor }}
                    />
                    <span className="text-zinc-400">Base: {generatedSpec.global.baseColor}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-4 w-4 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: generatedSpec.global.legendColor }}
                    />
                    <span className="text-zinc-400">Legend: {generatedSpec.global.legendColor}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Matrix View */}
            <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950/90 p-4 shadow-inner">
              <div className="min-w-[650px] flex flex-col gap-1.5">
                {rowNumbers.map((rowNum) => {
                  const rowKeys = keys
                    .filter((k) => k.row === rowNum)
                    .sort((a, b) => a.col - b.col);

                  return (
                    <div key={rowNum} className="flex gap-1.5 h-11">
                      {rowKeys.map((k, idx) => {
                        const uSize = k.size || 1;
                        const style = getKeyStyle(k);

                        return (
                          <div
                            key={k.id || idx}
                            style={{
                              flex: uSize,
                              backgroundColor: style.backgroundColor,
                              color: style.color,
                              borderColor: style.borderColor,
                            }}
                            title={`${k.label} (${uSize}u)`}
                            className="relative flex flex-col items-center justify-center rounded-lg border text-xs font-semibold select-none shadow-md transition-all duration-300 hover:scale-105 hover:z-10 cursor-pointer"
                          >
                            <span className="truncate px-1 text-[11px] font-bold">
                              {k.label}
                            </span>
                            {uSize > 1 && (
                              <span className="absolute bottom-0.5 right-1 text-[9px] opacity-60">
                                {uSize}u
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions Footer */}
            {generatedSpec ? (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-800 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(generatedSpec, null, 2));
                    alert('Spec JSON disalin ke clipboard!');
                  }}
                  className="w-full sm:w-auto rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition"
                >
                  Salin JSON Spec
                </button>

                <div className="w-full sm:w-auto flex items-center gap-3">
                  <Link
                    href={`/checkout?model=${selectedModel?.slug}${designId ? `&designId=${designId}` : ''}`}
                    className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-600/30 transition hover:brightness-110"
                  >
                    Pesan Keycap Set Ini (Checkout) →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-4 text-center text-xs text-zinc-500">
                Pilih tema dan klik &ldquo;Generate Desain AI&rdquo; untuk mewarnai dan memvisualisasikan layout.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
