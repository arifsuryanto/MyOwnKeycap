'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calculator, ArrowRight, CheckCircle2, Sparkles, Tag, Shield } from 'lucide-react';

interface MaterialOption {
  id: string;
  name: string;
  pricePerKey: number;
  badge: string;
  desc: string;
}

const MATERIALS: MaterialOption[] = [
  {
    id: 'pbt',
    name: 'PBT High-Density',
    pricePerKey: 18000,
    badge: 'Favorit Suara Thock',
    desc: 'Tebal 1.5mm, tekstur matte halus anti-minyak, daya tahan puluhan juta ketukan.',
  },
  {
    id: 'relief',
    name: '3D Image Surface Relief',
    pricePerKey: 32000,
    badge: 'Kontur Timbul 3D',
    desc: 'Tekstur timbul mikro dari upload foto atau logo kesukaan Anda.',
  },
  {
    id: 'resin',
    name: 'Dual-Tone Resin Artisan',
    pricePerKey: 42000,
    badge: 'Glossy / Frosted Glass',
    desc: 'Permukaan semi-translusen berglamor tinggi dengan stem anodized kontras.',
  },
];

export default function LandingPricingEstimator() {
  const [keyCount, setKeyCount] = useState<number>(4);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('pbt');
  const [profile, setProfile] = useState<'CHERRY' | 'OEM' | 'SA'>('CHERRY');

  const defaultMat = MATERIALS[0] as MaterialOption;
  const currentMat = MATERIALS.find((m) => m.id === selectedMaterial) || defaultMat;

  // Dynamic Volume Discount Calculation
  let discountPercent = 0;
  if (keyCount >= 60) discountPercent = 28; // Full Set Tier
  else if (keyCount >= 15) discountPercent = 18; // Modifier Tier
  else if (keyCount >= 4) discountPercent = 10; // Cluster Tier (WASD)

  const rawSubtotal = keyCount * currentMat.pricePerKey;
  const discountAmount = Math.round(rawSubtotal * (discountPercent / 100));
  const finalTotal = rawSubtotal - discountAmount;

  return (
    <div className="w-full clay-card p-6 sm:p-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="clay-pill inline-flex items-center gap-2 px-3.5 py-1 text-[#F95738] text-xs font-mono font-bold mb-3">
            <Calculator className="w-3.5 h-3.5" />
            <span>KALKULATOR ESTIMASI LIVE</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#FAF0CA] tracking-tight">
            Hitung Biaya Keycap Kustom Anda
          </h3>
          <p className="text-sm text-[#BACAD6] mt-1 max-w-xl">
            Pilih jumlah tombol dan material cetak. Diskon volume otomatis dihitung secara transparan.
          </p>
        </div>

        {/* Discount Badge Pill */}
        {discountPercent > 0 && (
          <div className="clay-pill px-4 py-2 flex items-center gap-2 bg-[#08233C] border border-[#F95738]/30">
            <Tag className="w-4 h-4 text-[#F95738]" />
            <span className="text-xs font-bold text-[#F95738]">
              Diskon Volume {discountPercent}% Aktif!
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Slider Jumlah Tombol */}
          <div className="clay-card-tint p-5">
            <div className="flex justify-between items-center mb-3">
              <label htmlFor="key-slider" className="text-sm font-bold text-[#FAF0CA]">
                Jumlah Keycap yang Ingin Dibuat:
              </label>
              <div className="clay-pill px-3 py-1 text-sm font-mono font-extrabold text-[#F95738]">
                {keyCount} {keyCount === 1 ? 'Tombol' : 'Tombol (Cluster)'}
              </div>
            </div>

            <input
              id="key-slider"
              type="range"
              min="1"
              max="87"
              value={keyCount}
              onChange={(e) => setKeyCount(parseInt(e.target.value, 10))}
              className="w-full h-3 bg-[#061828] rounded-lg appearance-none cursor-pointer accent-[#F95738]"
            />

            {/* Presets Quick Select */}
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-xs text-[#8FAEC7] self-center mr-1">Pilihan Cepat:</span>
              {[
                { label: '1 Key (Artisan ESC)', count: 1 },
                { label: '4 Keys (WASD / Panah)', count: 4 },
                { label: '12 Keys (Numpad)', count: 12 },
                { label: '68 Keys (65% Full)', count: 68 },
              ].map((preset) => (
                <button
                  key={preset.count}
                  type="button"
                  onClick={() => setKeyCount(preset.count)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                    keyCount === preset.count
                      ? 'clay-btn-primary'
                      : 'clay-pill text-[#BACAD6] hover:text-[#FAF0CA]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Material Options */}
          <div>
            <label className="block text-sm font-bold text-[#FAF0CA] mb-3">
              Pilihan Material &amp; Finishing:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {MATERIALS.map((mat) => {
                const isSelected = selectedMaterial === mat.id;
                return (
                  <button
                    key={mat.id}
                    type="button"
                    onClick={() => setSelectedMaterial(mat.id)}
                    className={`p-4 rounded-2xl text-left transition relative cursor-pointer ${
                      isSelected
                        ? 'bg-[#134978] border-2 border-[#F95738]/40 shadow-[6px_8px_20px_rgba(255,118,84,0.15)] ring-1 ring-[#F95738]/20'
                        : 'clay-card-tint hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono font-bold text-[#F95738]">
                        Rp {mat.pricePerKey.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-[#FAF0CA] mb-1">{mat.name}</div>
                    <p className="text-[11px] text-[#BACAD6] leading-relaxed">{mat.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Profile Selector */}
          <div>
            <label className="block text-sm font-bold text-[#FAF0CA] mb-2">
              Profil Keycap:
            </label>
            <div className="flex gap-3">
              {(['CHERRY', 'OEM', 'SA'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setProfile(p)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
                    profile === p
                      ? 'clay-btn-primary'
                      : 'clay-pill text-[#BACAD6] hover:text-[#FAF0CA]'
                  }`}
                >
                  {p} Profile
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Price Breakdown Card */}
        <div className="lg:col-span-5 clay-card-tint p-6 rounded-3xl space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-[#FAF0CA]/10">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#8FAEC7]">
              Ringkasan Estimasi
            </span>
            <span className="clay-pill px-2.5 py-0.5 text-[11px] font-mono font-bold text-[#F95738]">
              {profile} / {currentMat.name}
            </span>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-[#BACAD6]">
              <span>Subtotal ({keyCount}x @ Rp {currentMat.pricePerKey.toLocaleString('id-ID')}):</span>
              <span className="font-mono text-[#FAF0CA]">Rp {rawSubtotal.toLocaleString('id-ID')}</span>
            </div>

            {discountPercent > 0 && (
              <div className="flex justify-between text-[#0D3B66] font-semibold">
                <span>Diskon Tier ({discountPercent}%):</span>
                <span className="font-mono">- Rp {discountAmount.toLocaleString('id-ID')}</span>
              </div>
            )}

            <div className="pt-4 border-t border-[#FAF0CA]/10 flex justify-between items-baseline">
              <span className="text-base font-bold text-[#FAF0CA]">Total Estimasi:</span>
              <div className="text-right">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#F95738] font-mono">
                  Rp {finalTotal.toLocaleString('id-ID')}
                </span>
                <p className="text-[11px] text-[#8FAEC7]">Belum termasuk ongkir kurir</p>
              </div>
            </div>
          </div>

          <div className="clay-pill p-3 text-[11px] text-[#BACAD6] flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#0D3B66] shrink-0" />
            <span>Termasuk 100% Fit Guarantee &amp; Stem Testing Manual</span>
          </div>

          <Link
            href={`/design?keys=${keyCount}&material=${selectedMaterial}&profile=${profile}`}
            className="clay-btn-primary w-full py-3.5 px-6 font-bold text-center text-sm flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <span>Bawa Konfigurasi ke Studio 3D</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
