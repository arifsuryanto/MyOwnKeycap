'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: 'Apakah stem keycap ini cocok untuk switch keyboard saya?',
    a: 'Ya, keycap kami menggunakan format standar Cherry MX Cross (+) dengan toleransi ±0.02mm. Sangat pas untuk switch Cherry MX, Gateron, Kailh, Outemu, Akko, Gazzew, TTC, hingga switch magnetik Hall Effect terkini (seperti Wooting, DrunkDeer, MonsGeek M1W-HE).',
  },
  {
    q: 'Bagaimana jika keycap yang diterima longgar atau sempit?',
    a: 'Kami memberikan Garansi Fit 100%. Jika ada keycap yang stem-nya longgar, miring, atau tidak muat pada switch keyboard Anda, cukup kirimkan foto/video dan kami akan mencetak ulang tombol tersebut secara GRATIS tanpa biaya tambahan.',
  },
  {
    q: 'Bisakah saya hanya memesan beberapa tombol saja seperti WASD atau tombol panah?',
    a: 'Tentu saja! Fitur kustomisasi modular kami dirancang khusus agar Anda bebas memesan mulai dari 1 tombol artisan (ESC / Enter / Spacebar), 4 tombol gaming (WASD / QWER / Arrow), hingga kluster modifier tertentu tanpa harus membeli satu set penuh.',
  },
  {
    q: 'Bagaimana cara kerja fitur 3D Image Relief dari foto?',
    a: 'Cukup upload foto logo tim, anime, atau gambar berpola di Studio Desain. Algoritma computer-vision kami secara otomatis mengonversi perbedaan terang-gelap gambar menjadi variasi ketinggian kontur timbul 3D nyata pada permukaan tombol keycap.',
  },
  {
    q: 'Berapa lama proses pembuatan dan pengirimannya?',
    a: 'Proses cetak presisi dan curing memakan waktu sekitar 2-3 hari kerja. Pesanan dikirim langsung dari workshop kami di Jakarta menggunakan kurir ekspedisi ke seluruh wilayah Indonesia (JNE, SiCepat, J&T, GoSend/Grab).',
  },
  {
    q: 'Metode pembayaran apa saja yang didukung?',
    a: 'Kami mendukung pembayaran instan QRIS (mendukung semua aplikasi mobile banking BCA, Mandiri, BRI, BNI serta e-wallet GoPay, OVO, Dana, ShopeePay, LinkAja) dengan verifikasi otomatis secara real-time tanpa perlu kirim bukti transfer manual.',
  },
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <div className="clay-pill inline-flex items-center gap-2 px-3.5 py-1 text-[#F95738] text-xs font-mono font-bold mb-3">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>FREQUENTLY ASKED QUESTIONS</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#FAF0CA] tracking-tight">
          Pertanyaan Seputar Keycap Kami
        </h2>
        <p className="mt-2 text-sm text-[#BACAD6]">
          Semua hal yang perlu Anda ketahui tentang spesifikasi, kompatibilitas switch, dan garansi.
        </p>
      </div>

      <div className="space-y-3.5">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`rounded-2xl transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'clay-card'
                  : 'clay-card-tint hover:bg-white'
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 select-none cursor-pointer"
              >
                <span className="text-base sm:text-lg font-bold text-[#FAF0CA] tracking-tight">
                  {faq.q}
                </span>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-transform duration-200 shrink-0 ${
                  isOpen ? 'rotate-180 clay-btn-primary text-white' : 'clay-pill text-[#4A6B8A]'
                }`}>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {isOpen && (
                <div className="px-5 sm:px-6 pb-6 text-sm sm:text-base text-[#BACAD6] leading-relaxed border-t border-[#E8DEBC] pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
