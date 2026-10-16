import React from 'react';
import { Check, X, Award } from 'lucide-react';

export default function CraftsmanshipComparison() {
  const comparisonData = [
    {
      feature: 'Ketebalan Dinding Tombol',
      myown: '1.5mm Solid High-Density PBT',
      generic: '0.8mm Tipis & Ringkih',
    },
    {
      feature: 'Profil Akustik Ketukan',
      myown: 'Deep Solid Thock (Bebas Kopong)',
      generic: 'Kopong, Cempreng & Berderit',
    },
    {
      feature: 'Toleransi Stem MX Cross',
      myown: '±0.02mm Precision Fit (Anti-Oblak)',
      generic: 'Sering Longgar / Mudah Patah',
    },
    {
      feature: 'Pilihan Kustomisasi Parsial',
      myown: 'Bebas pesan 1 Key / WASD / Arrow',
      generic: 'Wajib beli 1 set standar pabrik',
    },
    {
      feature: '3D Relief Timbul dari Foto',
      myown: 'Tersedia (Upload foto / logo custom)',
      generic: 'Tidak ada (Hanya cetak flat sablon)',
    },
    {
      feature: 'Garansi Pas (Fit-Guarantee)',
      myown: '100% Cetak Ulang Gratis Jika Tidak Pas',
      generic: 'Tidak ada garansi jika stem salah',
    },
  ];

  return (
    <div className="w-full clay-card p-6 sm:p-8">
      <div className="text-center mb-8">
        <div className="clay-pill inline-flex items-center gap-2 px-3.5 py-1 text-[#F95738] text-xs font-mono font-bold mb-3">
          <Award className="w-3.5 h-3.5" />
          <span>STANDAR ATELIER VS PABRIKAN</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-[#FAF0CA] tracking-tight">
          Mengapa Enthusiast Memilih MyOwnKeycap?
        </h3>
        <p className="text-sm text-[#BACAD6] mt-1 max-w-xl mx-auto">
          Perbandingan langsung antara kualitas rekayasa atelier kami dibanding keycap massal standar di pasaran.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-[#FAF0CA]/10 text-xs font-mono uppercase tracking-wider text-[#8FAEC7]">
              <th className="py-4 px-4 font-bold">Spesifikasi &amp; Fitur</th>
              <th className="py-4 px-4 text-[#F95738] font-bold bg-[#134978]/60 rounded-t-2xl">
                MyOwnKeycap Atelier
              </th>
              <th className="py-4 px-4 text-[#8FAEC7]">Keycap Pabrikan Murah</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8DEBC]/60">
            {comparisonData.map((row, idx) => (
              <tr key={idx} className="hover:bg-[#FFFDF8] transition">
                <td className="py-4 px-4 font-bold text-[#FAF0CA]">
                  {row.feature}
                </td>
                <td className="py-4 px-4 font-bold text-[#0D3B66] bg-[#134978]/60/40 flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-[#08233C] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-[#0D3B66]" />
                  </div>
                  <span>{row.myown}</span>
                </td>
                <td className="py-4 px-4 text-[#8FAEC7]">
                  <span className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-[#08233C] flex items-center justify-center shrink-0">
                      <X className="w-3.5 h-3.5 text-[#8FAEC7]" />
                    </div>
                    <span>{row.generic}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
