'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import KeySelectionToolbar, { KeySelectionMode } from './KeySelectionToolbar';
import KeycapCanvas3D from './KeycapCanvas3D';
import ImageReliefUploader from './ImageReliefUploader';
import { ImageReliefSpec } from '@keycap/shared';
import { BundleType } from '@keycap/pricing';

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

  // 3D Preview, Partial Key Selection, and Image-to-3D Relief
  const [previewTab, setPreviewTab] = useState<'2D' | '3D'>('2D');
  const [selectionMode, setSelectionMode] = useState<KeySelectionMode>('FULL_SET');
  const [manualSelectedKeyIds, setManualSelectedKeyIds] = useState<string[]>([]);
  const [imageRelief, setImageRelief] = useState<ImageReliefSpec | null>(null);

  const keys: any[] = useMemo(() => selectedModel?.layoutJson?.keys || [], [selectedModel]);

  // Resolve active keys based on selection mode
  const selectedKeyIds = useMemo(() => {
    if (selectionMode === 'FULL_SET') {
      return keys.map((k) => k.id);
    }
    if (selectionMode === 'WASD') {
      return keys
        .filter((k) => {
          const l = (k.label || '').toUpperCase();
          const id = (k.id || '').toLowerCase();
          return l === 'W' || l === 'A' || l === 'S' || l === 'D' || ['w', 'a', 's', 'd'].includes(id);
        })
        .map((k) => k.id);
    }
    if (selectionMode === 'ARROWS') {
      return keys
        .filter((k) => {
          const l = k.label || '';
          const id = (k.id || '').toLowerCase();
          return (
            ['up', 'down', 'left', 'right'].includes(id) ||
            ['↑', '↓', '←', '→', '▲', '▼', '◄', '►'].includes(l)
          );
        })
        .map((k) => k.id);
    }
    if (selectionMode === 'ACCENT') {
      return keys
        .filter((k) => {
          const l = (k.label || '').toUpperCase();
          const id = (k.id || '').toLowerCase();
          return (
            ['esc', 'enter', 'space'].includes(id) ||
            id.startsWith('esc') ||
            id.startsWith('space') ||
            ['ESC', 'ENTER', 'SPACE'].includes(l)
          );
        })
        .map((k) => k.id);
    }
    // CUSTOM mode
    return manualSelectedKeyIds;
  }, [selectionMode, keys, manualSelectedKeyIds]);

  // Determine bundle tier and estimated price based on selected keys count
  const { bundleTier, estimatedPrice } = useMemo(() => {
    const count = selectedKeyIds.length;
    let tier: BundleType = 'SAMPLER';
    let discount = 0;

    if (count > 50) {
      tier = 'FULL_SET';
      discount = 0.2; // 20%
    } else if (count >= 5) {
      tier = 'ACCENT';
      discount = 0.1; // 10%
    } else {
      tier = 'SAMPLER';
      discount = 0.0;
    }

    const pricePerKey = 15000; // Base IDR
    const rawTotal = count * pricePerKey;
    const finalTotal = Math.max(15000, Math.round(rawTotal * (1 - discount)));

    return { bundleTier: tier, estimatedPrice: finalTotal };
  }, [selectedKeyIds]);

  const handleKeyClick = (keyId: string) => {
    if (selectionMode !== 'CUSTOM') {
      const current = new Set(selectedKeyIds);
      if (current.has(keyId)) current.delete(keyId);
      else current.add(keyId);
      setManualSelectedKeyIds(Array.from(current));
      setSelectionMode('CUSTOM');
    } else {
      setManualSelectedKeyIds((prev) =>
        prev.includes(keyId) ? prev.filter((id) => id !== keyId) : [...prev, keyId]
      );
    }
  };

  const handleModeChange = (mode: KeySelectionMode) => {
    setSelectionMode(mode);
    if (mode === 'CUSTOM') {
      setManualSelectedKeyIds(selectedKeyIds);
    }
  };

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
            selection: {
              mode: selectionMode,
              selectedKeys: selectedKeyIds,
            },
            relief: imageRelief,
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
    const isSelected = selectedKeyIds.includes(keyItem.id);

    if (!generatedSpec) {
      return {
        backgroundColor: isSelected ? '#16538A' : '#0A2640',
        color: isSelected ? '#FAF0CA' : '#8FAEC7',
        borderColor: isSelected ? '#F95738' : 'rgba(13, 59, 102, 0.2)',
        opacity: isSelected ? 1 : 0.4,
      };
    }

    const { global, overrides } = generatedSpec;
    let baseColor = global.baseColor || '#0D3B66';
    let legendColor = global.legendColor || '#FAF0CA';

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
      borderColor: isSelected ? '#F95738' : `${legendColor}44`,
      opacity: isSelected ? 1 : 0.4,
    };
  };

  const rowNumbers = Array.from(new Set(keys.map((k) => k.row))).sort(
    (a: number, b: number) => a - b,
  );

  const currentBaseColor = generatedSpec?.global?.baseColor || '#0D3B66';
  const currentLegendColor = generatedSpec?.global?.legendColor || '#FAF0CA';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Banner */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#FAF0CA]/10 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#FAF0CA] sm:text-4xl">
            AI Keycap Studio &amp; 3D Lab
          </h1>
          <p className="mt-1 text-sm text-[#BACAD6]">
            Kustomisasi keycap satuan (WASD / Accent) hingga full set dengan AI, preview 3D interaktif, dan relief timbul dari gambar.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="clay-pill inline-flex items-center gap-1.5 bg-[#0D3B66] border border-[#FAF0CA]/12 px-3.5 py-1 text-xs font-bold text-[#0D3B66] shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F95738] animate-pulse" />
            Gemini 3.8 Flash Engine
          </span>
          <span className="clay-pill bg-[#08233C] border border-[#F4D35E]/60 px-3 py-1 text-xs font-semibold text-[#BACAD6]">
            5 Kuota Gratis / Hari
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Control Panel (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <form
            onSubmit={handleGenerate}
            className="clay-card p-6 sm:p-7 bg-[#0D3B66] border border-[#FAF0CA]/12 text-[#FAF0CA] shadow-md"
          >
            <h2 className="text-lg font-extrabold text-[#0D3B66] mb-4">Parameter Desain</h2>

            {/* Model Selector */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-[#0D3B66] mb-2">
                1. Target Keyboard
              </label>
              <select
                value={selectedModel?.slug}
                onChange={(e) => {
                  const found = initialModels.find((m) => m.slug === e.target.value);
                  if (found) setSelectedModel(found);
                }}
                className="w-full rounded-2xl border border-[#FAF0CA]/15 bg-[#08233C] px-4 py-3 text-sm text-[#FAF0CA] focus:border-[#0D3B66] focus:bg-[#0D3B66] focus:outline-none focus:ring-2 focus:ring-[#F4D35E] font-medium"
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
                <label className="text-xs font-bold text-[#0D3B66]">
                  2. Prompt Tema &amp; Estetika
                </label>
                <span className="text-[11px] font-mono text-[#BACAD6]">
                  {prompt.length}/600
                </span>
              </div>
              <textarea
                rows={4}
                maxLength={600}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Deskripsikan warna, nuansa, mood, atau gaya... Contoh: Nuansa kedai kopi sore hari dengan cokelat espresso, beige latte cream, dan aksen karamel pada spasi."
                className="w-full rounded-2xl border border-[#FAF0CA]/15 bg-[#08233C] p-4 text-sm text-[#FAF0CA] placeholder-[#2D4863]/60 focus:border-[#0D3B66] focus:bg-[#0D3B66] focus:outline-none focus:ring-2 focus:ring-[#F4D35E] font-medium leading-relaxed"
              />
            </div>

            {/* Preset chips */}
            <div className="mb-6">
              <p className="text-[11px] font-bold text-[#BACAD6] mb-2">
                Inspirasi Tema Cepat:
              </p>
              <div className="flex flex-wrap gap-2">
                {PRESET_PROMPTS.map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPrompt(preset)}
                    className="clay-pill bg-[#08233C] hover:bg-[#F4D35E]/30 border border-[#FAF0CA]/12 px-3 py-1.5 text-[11px] font-semibold text-[#BACAD6] hover:text-[#0D3B66] transition cursor-pointer text-left"
                  >
                    {preset.split('dengan')[0]}...
                  </button>
                ))}
              </div>
            </div>

            {/* Profile & Material Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-[#0D3B66] mb-2">
                  Profil Keycap
                </label>
                <div className="flex rounded-2xl border border-[#FAF0CA]/15 bg-[#08233C] p-1">
                  <button
                    type="button"
                    onClick={() => setProfile('CHERRY')}
                    className={`flex-1 rounded-xl py-2 text-xs font-bold transition cursor-pointer ${
                      profile === 'CHERRY'
                        ? 'bg-[#0D3B66] text-white shadow-sm'
                        : 'text-[#BACAD6] hover:text-[#0D3B66]'
                    }`}
                  >
                    Cherry
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfile('OEM')}
                    className={`flex-1 rounded-xl py-2 text-xs font-bold transition cursor-pointer ${
                      profile === 'OEM'
                        ? 'bg-[#0D3B66] text-white shadow-sm'
                        : 'text-[#BACAD6] hover:text-[#0D3B66]'
                    }`}
                  >
                    OEM
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0D3B66] mb-2">
                  Material Cetak
                </label>
                <div className="flex rounded-2xl border border-[#FAF0CA]/15 bg-[#08233C] p-1">
                  {(['PETG', 'PLA'] as const).map((mat) => (
                    <button
                      key={mat}
                      type="button"
                      onClick={() => setMaterial(mat)}
                      className={`flex-1 rounded-xl py-2 text-xs font-bold transition cursor-pointer ${
                        material === mat
                          ? 'bg-[#0D3B66] text-white shadow-sm'
                          : 'text-[#BACAD6] hover:text-[#0D3B66]'
                      }`}
                    >
                      {mat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Image-to-3D Relief Uploader */}
            <div className="mb-6">
              <ImageReliefUploader
                value={imageRelief}
                onChange={setImageRelief}
              />
            </div>

            {error && (
              <div className="mb-4 clay-card bg-[#F95738]/10 border border-[#F95738]/30 p-3.5 text-xs text-[#F95738] font-bold rounded-2xl">
                ⚠️ {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="clay-btn-primary w-full py-4 text-sm font-extrabold text-white bg-gradient-to-r from-[#F95738] to-[#EE964B] shadow-xl hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
          {/* Key Selection Toolbar */}
          <KeySelectionToolbar
            mode={selectionMode}
            onModeChange={handleModeChange}
            selectedCount={selectedKeyIds.length}
            totalCount={keys.length}
            bundleTier={bundleTier}
            estimatedPrice={estimatedPrice}
          />

          <div className="clay-card p-6 sm:p-7 bg-[#0D3B66] border border-[#FAF0CA]/12 text-[#FAF0CA] shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-extrabold text-[#0D3B66]">
                  Preview Studio
                </h2>
                <p className="text-xs text-[#BACAD6]">
                  {selectedModel?.brand} {selectedModel?.name} • {selectedKeyIds.length} Tombol Dipilih
                </p>
              </div>

              {/* 2D vs 3D switcher */}
              <div className="clay-card bg-[#08233C] border border-[#FAF0CA]/15 rounded-2xl p-1 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPreviewTab('2D')}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                    previewTab === '2D'
                      ? 'bg-[#0D3B66] text-white shadow-sm'
                      : 'text-[#BACAD6] hover:text-[#0D3B66]'
                  }`}
                >
                  Layout 2D
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('3D')}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                    previewTab === '3D'
                      ? 'bg-[#0D3B66] text-white shadow-sm'
                      : 'text-[#BACAD6] hover:text-[#0D3B66]'
                  }`}
                >
                  3D Studio 🎮
                </button>
              </div>
            </div>

            {/* Preview View Container: 2D Matrix OR 3D Canvas */}
            {previewTab === '3D' ? (
              <KeycapCanvas3D
                selectionMode={selectionMode}
                selectedKeyIds={selectedKeyIds}
                baseColor={currentBaseColor}
                legendColor={currentLegendColor}
                profile={profile}
                relief={imageRelief}
                keys={keys}
              />
            ) : (
              <div className="overflow-x-auto rounded-3xl border border-[#FAF0CA]/15 bg-[#08233C] p-5 shadow-inner">
                <div className="min-w-[650px] flex flex-col gap-1.5">
                  {rowNumbers.map((rowNum: number) => {
                    const rowKeys = keys
                      .filter((k) => k.row === rowNum)
                      .sort((a, b) => a.col - b.col);

                    return (
                      <div key={rowNum} className="flex gap-1.5 h-11">
                        {rowKeys.map((k, idx) => {
                          const uSize = k.size || 1;
                          const style = getKeyStyle(k);
                          const isSelected = selectedKeyIds.includes(k.id);

                          return (
                            <button
                              type="button"
                              key={k.id || idx}
                              onClick={() => handleKeyClick(k.id)}
                              style={{
                                flex: uSize,
                                backgroundColor: style.backgroundColor,
                                color: style.color,
                                borderColor: isSelected ? '#F95738' : style.borderColor,
                                opacity: style.opacity,
                              }}
                              title={`${k.label} (${uSize}u) - Klik untuk pilih/lepas`}
                              className={`relative flex flex-col items-center justify-center rounded-xl border text-xs font-bold select-none shadow-sm transition-all duration-300 hover:scale-105 hover:z-10 cursor-pointer ${
                                isSelected ? 'ring-2 ring-[#F95738] shadow-md shadow-[#F95738]/25 scale-[1.02]' : ''
                              }`}
                            >
                              <span className="truncate px-1 text-[11px] font-black">
                                {k.label}
                              </span>
                              {uSize > 1 && (
                                <span className="absolute bottom-0.5 right-1 text-[9px] opacity-70 font-mono">
                                  {uSize}u
                                </span>
                              )}
                              {imageRelief && isSelected && (
                                <span className="absolute top-0.5 right-1 text-[8px] opacity-90">
                                  🗿
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions Footer */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#FAF0CA]/10 pt-6">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#BACAD6]">Total Biaya Pesanan:</span>
                <span className="text-2xl font-black text-[#FAF0CA] font-mono">
                  Rp {estimatedPrice.toLocaleString('id-ID')}
                  <span className="ml-2 text-xs font-bold text-[#F95738]">
                    ({selectedKeyIds.length} Tombol • {bundleTier})
                  </span>
                </span>
              </div>

              <div className="w-full sm:w-auto flex items-center gap-3">
                {generatedSpec && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        JSON.stringify(
                          {
                            ...generatedSpec,
                            selection: {
                              mode: selectionMode,
                              selectedKeys: selectedKeyIds,
                            },
                            relief: imageRelief,
                          },
                          null,
                          2
                        )
                      );
                      alert('Spec JSON disalin ke clipboard!');
                    }}
                    className="w-full sm:w-auto clay-btn-secondary px-5 py-2.5 text-xs font-bold text-[#0D3B66] cursor-pointer"
                  >
                    Salin Spec
                  </button>
                )}

                <Link
                  href={`/checkout?model=${selectedModel?.slug}${designId ? `&designId=${designId}` : ''}&mode=${selectionMode}&keys=${selectedKeyIds.join(',')}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center clay-btn-primary px-7 py-3 text-xs font-extrabold text-white bg-gradient-to-r from-[#F95738] to-[#EE964B] shadow-lg hover:scale-105"
                >
                  Pesan {selectedKeyIds.length} Tombol (Checkout) ➔
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
