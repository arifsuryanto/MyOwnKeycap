'use client';

import React from 'react';
import { BundleType } from '@keycap/pricing';

export type KeySelectionMode = 'FULL_SET' | 'WASD' | 'ARROWS' | 'ACCENT' | 'CUSTOM';

interface KeySelectionToolbarProps {
  mode: KeySelectionMode;
  onModeChange: (mode: KeySelectionMode) => void;
  selectedCount: number;
  totalCount: number;
  bundleTier: BundleType;
  estimatedPrice: number;
}

export default function KeySelectionToolbar({
  mode,
  onModeChange,
  selectedCount,
  totalCount,
  bundleTier,
  estimatedPrice,
}: KeySelectionToolbarProps) {
  const PRESETS: Array<{ id: KeySelectionMode; label: string; desc: string; icon: string }> = [
    {
      id: 'FULL_SET',
      label: 'Full Keyboard Set',
      desc: `Semua ${totalCount} Tombol`,
      icon: '⌨️',
    },
    {
      id: 'WASD',
      label: 'WASD Gamer Pack',
      desc: '4 Tombol (W, A, S, D)',
      icon: '🎮',
    },
    {
      id: 'ARROWS',
      label: 'Arrow Cluster',
      desc: '4 Tombol Arah',
      icon: '🧭',
    },
    {
      id: 'ACCENT',
      label: 'Accent Essentials',
      desc: 'Esc + Enter + Space',
      icon: '✨',
    },
    {
      id: 'CUSTOM',
      label: 'Pilih Bebas',
      desc: 'Klik tombol di layout',
      icon: '🎯',
    },
  ];

  const getTierBadge = (tier: BundleType) => {
    switch (tier) {
      case 'SAMPLER':
        return {
          label: 'Sampler Tier (Satuan)',
          bg: 'bg-[#08233C] text-[#0D3B66] border-[#F4D35E]/60',
        };
      case 'ACCENT':
        return {
          label: 'Accent Pack (Diskon 10%)',
          bg: 'bg-[#F4D35E]/25 text-[#FAF0CA] border-[#EE964B]/40',
        };
      case 'FULL_SET':
        return {
          label: 'Full Set (Diskon 20%)',
          bg: 'bg-[#F95738]/15 text-[#F95738] border-[#F95738]/30 font-bold',
        };
    }
  };

  const tierBadge = getTierBadge(bundleTier);

  return (
    <div className="clay-card p-5 bg-[#0D3B66] border border-[#FAF0CA]/12 text-[#FAF0CA] shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-extrabold text-[#0D3B66] flex items-center gap-2">
            <span>🎯</span> Cakupan Cetak Keycap
          </h3>
          <p className="text-[12px] text-[#BACAD6]">
            Pilih paket sebagian tombol (WASD, Arrows, Accent) atau cetak full keyboard.
          </p>
        </div>

        {/* Live status badge */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`clay-pill inline-flex items-center border px-3 py-1 text-[11px] font-semibold ${tierBadge.bg}`}
          >
            {tierBadge.label}
          </span>
          <span className="clay-pill bg-[#08233C] border border-[#F4D35E]/50 px-3 py-1 text-[11px] font-bold text-[#0D3B66]">
            {selectedCount} / {totalCount} Tombol
          </span>
          <span className="clay-pill bg-[#F95738]/10 border border-[#F95738]/30 px-3 py-1 text-[11px] font-bold text-[#F95738] font-mono">
            Rp {estimatedPrice.toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      {/* Preset Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {PRESETS.map((preset) => {
          const isActive = mode === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onModeChange(preset.id)}
              className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-br from-[#0D3B66] to-[#071E33] text-white border-[#0D3B66] shadow-lg shadow-[#0D3B66]/20 scale-[1.02]'
                  : 'clay-card bg-[#0A2C4C] hover:bg-[#103D66] border-[#FAF0CA]/12 text-[#BACAD6] hover:text-[#0D3B66]'
              }`}
            >
              <div className="flex items-center gap-1.5 w-full">
                <span className="text-base">{preset.icon}</span>
                <span className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-[#FAF0CA]'}`}>
                  {preset.label}
                </span>
              </div>
              <span className={`mt-1 text-[10px] leading-tight ${isActive ? 'text-[#FAF0CA]' : 'text-[#BACAD6]'}`}>
                {preset.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
