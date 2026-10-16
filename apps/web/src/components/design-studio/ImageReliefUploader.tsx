'use client';

import React, { useState } from 'react';
import { ImageReliefSpec } from '@keycap/shared';

interface ImageReliefUploaderProps {
  value: ImageReliefSpec | null;
  onChange: (spec: ImageReliefSpec | null) => void;
}

// Preset samples for quick testing / demonstration
const SAMPLE_RELIEFS = [
  {
    name: 'Cyber Skull',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=200&auto=format&fit=crop&q=60',
    mode: 'EMBOSS' as const,
  },
  {
    name: 'Dragon Crest',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=60',
    mode: 'EMBOSS' as const,
  },
  {
    name: 'Pixel Heart',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=60',
    mode: 'ENGRAVE' as const,
  },
];

export default function ImageReliefUploader({
  value,
  onChange,
}: ImageReliefUploaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(value?.imageUrl || '');
  const [depthMm, setDepthMm] = useState<number>(value?.depthMm || 0.4);
  const [mode, setMode] = useState<'EMBOSS' | 'ENGRAVE'>(value?.mode || 'EMBOSS');
  const [invert, setInvert] = useState<boolean>(value?.invert || false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreviewUrl(result);
      onChange({
        imageUrl: result,
        name: file.name.slice(0, 30),
        depthMm,
        mode,
        invert,
        scale: 0.75,
      });
    };
    reader.readAsDataURL(file);
  };

  const applySample = (sample: typeof SAMPLE_RELIEFS[0]) => {
    setPreviewUrl(sample.url);
    setMode(sample.mode);
    onChange({
      imageUrl: sample.url,
      name: sample.name,
      depthMm,
      mode: sample.mode,
      invert,
      scale: 0.75,
    });
  };

  const handleDepthChange = (newDepth: number) => {
    setDepthMm(newDepth);
    if (value) {
      onChange({
        ...value,
        depthMm: newDepth,
      });
    }
  };

  const handleModeChange = (newMode: 'EMBOSS' | 'ENGRAVE') => {
    setMode(newMode);
    if (value) {
      onChange({
        ...value,
        mode: newMode,
      });
    }
  };

  const handleRemove = () => {
    setPreviewUrl('');
    onChange(null);
  };

  return (
    <div className="clay-card p-5 bg-[#0D3B66] border border-[#FAF0CA]/12 text-[#FAF0CA] shadow-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🗿</span>
          <div>
            <h3 className="text-xs font-extrabold text-[#0D3B66]">
              Bentuk 3D / Relief Kustom (Image-to-3D)
            </h3>
            <p className="text-[11px] text-[#BACAD6]">
              Buat keycap bertekstur timbul atau cekung dari logo &amp; ilustrasi.
            </p>
          </div>
        </div>

        {value ? (
          <button
            type="button"
            onClick={handleRemove}
            className="text-[11px] font-bold text-[#F95738] hover:underline transition cursor-pointer"
          >
            Hapus Relief
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="clay-btn-secondary px-3 py-1 text-[11px] font-bold text-[#0D3B66] cursor-pointer"
          >
            {isOpen ? 'Tutup' : '+ Tambah Gambar'}
          </button>
        )}
      </div>

      {/* Active state preview */}
      {value && (
        <div className="mt-3 rounded-2xl border border-[#FAF0CA]/12 bg-[#08233C] p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 overflow-hidden rounded-xl border border-[#0D3B66]/20 bg-[#0D3B66] flex items-center justify-center shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value.imageUrl}
                alt="Relief Preview"
                className="h-full w-full object-cover filter contrast-125"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#FAF0CA]">
                  {value.name || 'Gambar Kustom'}
                </span>
                <span className="clay-pill bg-[#F4D35E]/30 text-[#0D3B66] border-[#EE964B]/40 font-bold text-[9px] px-2 py-0.5">
                  {value.mode === 'EMBOSS' ? 'Timbul' : 'Cekung'}
                </span>
              </div>
              <p className="text-[10px] text-[#BACAD6] mt-0.5">
                Kedalaman: {value.depthMm}mm • Heightmap Aktif
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleModeChange(value.mode === 'EMBOSS' ? 'ENGRAVE' : 'EMBOSS')}
              className="clay-pill bg-[#0D3B66] border border-[#0D3B66]/20 px-2.5 py-1 text-[10px] font-bold text-[#0D3B66] hover:bg-[#08233C] transition cursor-pointer"
            >
              Mode: {value.mode} 🔄
            </button>
          </div>
        </div>
      )}

      {/* Upload & controls dropdown */}
      {(isOpen || !value) && (
        <div className="mt-3 pt-3 border-t border-[#FAF0CA]/12 space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-[#0D3B66] mb-1.5">
              Upload Gambar (PNG, JPG, SVG):
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="w-full text-xs text-[#BACAD6] file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#0D3B66] file:text-white hover:file:bg-[#071E33] cursor-pointer"
            />
          </div>

          <div>
            <span className="text-[10px] font-bold text-[#BACAD6] block mb-1">
              Atau coba sampel siap pakai:
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_RELIEFS.map((sample) => (
                <button
                  key={sample.name}
                  type="button"
                  onClick={() => applySample(sample)}
                  className="clay-pill bg-[#0D3B66] border border-[#FAF0CA]/12 px-2.5 py-1 text-[10px] font-semibold text-[#0D3B66] hover:bg-[#08233C] transition cursor-pointer"
                >
                  {sample.name}
                </button>
              ))}
            </div>
          </div>

          {/* Depth slider */}
          {value && (
            <div className="pt-2">
              <div className="flex justify-between text-[11px] text-[#BACAD6] mb-1">
                <span className="font-semibold">Ketebalan Relief (Depth):</span>
                <span className="font-extrabold text-[#F95738] font-mono">{depthMm} mm</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="0.8"
                step="0.05"
                value={depthMm}
                onChange={(e) => handleDepthChange(parseFloat(e.target.value))}
                className="w-full accent-[#F95738] cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-[#BACAD6]/70 font-semibold">
                <span>0.2 mm (Halus)</span>
                <span>0.4 mm (Rekomendasi)</span>
                <span>0.8 mm (Maksimum)</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
