import React from 'react';
import Link from 'next/link';
import { Sparkles, Keyboard, ShieldCheck, Heart } from 'lucide-react';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#071E33] text-[#FAF0CA] flex flex-col selection:bg-[#F95738]/30 selection:text-[#FAF0CA] font-sans">
      {/* Editorial Sticky Header Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-[#FAF0CA]/10 bg-[#071E33]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Logo & Tag */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="clay-btn-primary h-11 w-11 flex items-center justify-center text-white font-extrabold shadow-md group-hover:scale-105 transition-transform">
              <span className="text-xl">⌨</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-[#FAF0CA]">
                  MyOwn<span className="text-[#F95738]">Keycap</span>
                </span>
                <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider bg-[#0D3B66] text-[#F4D35E] border border-[#F4D35E]/30">
                  ATELIER
                </span>
              </div>
              <span className="text-[10px] text-[#8FAEC7] font-medium tracking-wide">
                Bespoke Mechanical Artisan &amp; 3D Relief
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-[#FAF0CA]/85">
            <Link
              href="/keyboards"
              className="px-4 py-2 rounded-full hover:text-[#F4D35E] hover:bg-[#0D3B66]/60 transition font-sans"
            >
              Katalog Keyboard
            </Link>
            <Link
              href="/design"
              className="px-4 py-2 rounded-full hover:text-[#F4D35E] hover:bg-[#0D3B66]/60 transition flex items-center gap-1.5 font-sans"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F95738]" />
              <span>AI Design Studio</span>
            </Link>
            <Link
              href="/estimator"
              className="px-4 py-2 rounded-full hover:text-[#F4D35E] hover:bg-[#0D3B66]/60 transition font-sans"
            >
              Estimator Harga
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex text-xs font-semibold text-[#8FAEC7] hover:text-[#FAF0CA] px-3 py-1.5 transition font-sans"
            >
              Masuk
            </Link>
            <Link
              href="/design"
              className="clay-btn-primary px-5 py-2.5 text-xs font-bold tracking-wide flex items-center gap-1.5 cursor-pointer font-sans"
            >
              <span>Mulai Rancang</span>
              <span className="text-[10px] opacity-80">➔</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {children}
      </main>

      {/* Atelier Footer */}
      <footer className="border-t border-[#FAF0CA]/10 bg-[#051524] py-12 px-4 sm:px-6 lg:px-8 mt-24 text-[#8FAEC7] text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="font-extrabold text-lg text-[#FAF0CA]">
              MyOwn<span className="text-[#F95738]">Keycap</span>
            </div>
            <p className="text-xs text-[#8FAEC7] leading-relaxed">
              Workshop kustomisasi keycap mekanik modular berbasis teknologi generative AI &amp; manufaktur aditif presisi di Jakarta.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-[#FAF0CA] mb-3 text-xs uppercase tracking-wider">Navigasi</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/keyboards" className="hover:text-[#F4D35E] transition">Katalog Keyboard</Link></li>
              <li><Link href="/design" className="hover:text-[#F4D35E] transition">AI Studio 3D</Link></li>
              <li><Link href="/estimator" className="hover:text-[#F4D35E] transition">Kalkulator Estimasi</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[#FAF0CA] mb-3 text-xs uppercase tracking-wider">Garansi &amp; Mutu</h4>
            <ul className="space-y-2 text-xs">
              <li>100% Fit Cherry MX Stems</li>
              <li>Toleransi Akurasi 0.05mm</li>
              <li>Dinding Tebal 1.5mm Thocky</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[#FAF0CA] mb-3 text-xs uppercase tracking-wider">Komunitas</h4>
            <p className="text-xs text-[#8FAEC7] leading-relaxed">
              Dibuat oleh sesama mechanical keyboard enthusiasts untuk para pecinta keindahan setup meja.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[#FAF0CA]">
              <span>Made with</span>
              <Heart className="w-3.5 h-3.5 text-[#F95738] fill-current" />
              <span>in Jakarta</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
