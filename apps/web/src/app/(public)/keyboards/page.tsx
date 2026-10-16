import Link from 'next/link';
import { KeyboardService } from '@/server/services/keyboard.service';
import { Search, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface KeyboardsPageProps {
  searchParams: Promise<{
    q?: string;
    brand?: string;
    switch?: string;
  }>;
}

export const metadata = {
  title: 'Katalog Keyboard — Fit-Guaranteed Custom Keycaps',
  description:
    'Pilih model keyboard mekanik Anda. Ukuran keycap, layout, dan stem dijamin presisi 100% tanpa perlu ukur manual.',
};

export default async function KeyboardsPage({ searchParams }: KeyboardsPageProps) {
  const params = await searchParams;
  const brand = params.brand;
  const search = params.q;
  const switchType = params.switch;

  const [{ items: keyboards }, brands] = await Promise.all([
    KeyboardService.listKeyboards({
      search,
      brand,
      switchType,
      limit: 24,
    }),
    KeyboardService.getDistinctBrands(),
  ]);

  return (
    <div className="min-h-screen bg-[#071E33] text-[#FAF0CA] pb-24 font-sans selection:bg-[#F95738]/20 selection:text-[#0D3B66]">
      {/* Header & Hero */}
      <section className="relative overflow-hidden border-b border-[#FAF0CA]/10 bg-gradient-to-b from-[#071E33] via-[#0A2640] to-[#071E33] px-4 py-16 sm:px-6 lg:px-8">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-[#F4D35E]/20 to-transparent blur-3xl pointer-events-none" />
        <div className="relative mx-auto max-w-5xl text-center space-y-4">
          <div className="clay-pill inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-[#0D3B66]">
            <Sparkles className="w-3.5 h-3.5 text-[#F95738]" />
            <span>Database Terverifikasi • 100% Fit MX Stems</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#FAF0CA] leading-tight">
            Pilih Model Keyboard Anda
          </h1>
          <p className="mt-3 text-base sm:text-lg text-[#BACAD6] max-w-2xl mx-auto leading-relaxed">
            Setiap keyboard punya layout, ukuran spasi, dan modifier yang spesifik.
            Pilih model Anda di bawah ini agar keycap yang dicetak dijamin pas sempurna.
          </p>

          {/* Search bar */}
          <form method="GET" action="/keyboards" className="mt-8 mx-auto max-w-xl">
            <div className="relative flex items-center">
              <input
                type="text"
                name="q"
                defaultValue={search ?? ''}
                placeholder="Cari berdasarkan model atau brand (contoh: Q1, RK61, Akko)..."
                className="w-full rounded-full border border-white/90 bg-[#0D3B66] px-6 py-4 pl-12 text-sm text-[#FAF0CA] placeholder-[#4A6B8A] shadow-[8px_12px_28px_rgba(13,59,102,0.08),inset_0_1px_2px_rgba(255,255,255,0.95)] transition focus:border-[#F95738] focus:outline-none focus:ring-2 focus:ring-[#F95738]/20"
              />
              <Search className="absolute left-4 h-5 w-5 text-[#8FAEC7]" />
              {brand && <input type="hidden" name="brand" value={brand} />}
              <button
                type="submit"
                className="clay-btn-primary absolute right-2.5 px-5 py-2 text-xs font-bold text-white cursor-pointer"
              >
                Cari
              </button>
            </div>
          </form>

          {/* Brand pills */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 pt-2">
            <Link
              href={search ? `/keyboards?q=${encodeURIComponent(search)}` : '/keyboards'}
              className={`px-4 py-1.5 text-xs font-bold rounded-full transition cursor-pointer ${
                !brand
                  ? 'clay-btn-primary'
                  : 'clay-pill text-[#0D3B66] hover:text-[#F95738]'
              }`}
            >
              Semua Brand
            </Link>
            {brands.map((b) => {
              const active = brand?.toLowerCase() === b.toLowerCase();
              const url = `/keyboards?brand=${encodeURIComponent(b)}${search ? `&q=${encodeURIComponent(search)}` : ''}`;
              return (
                <Link
                  key={b}
                  href={url}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full transition cursor-pointer ${
                    active
                      ? 'clay-btn-primary'
                      : 'clay-pill text-[#0D3B66] hover:text-[#F95738]'
                  }`}
                >
                  {b}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Grid of Keyboards */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
          <p className="text-sm text-[#BACAD6]">
            Menampilkan <strong className="text-[#0D3B66] font-mono">{keyboards.length}</strong> model keyboard terverifikasi
          </p>
          <Link
            href="/design"
            className="text-xs font-bold text-[#F95738] hover:text-[#EE964B] transition flex items-center gap-1"
          >
            <span>Keyboard Anda tidak terdaftar? Desain dengan template bebas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {keyboards.length === 0 ? (
          <div className="clay-card p-12 text-center max-w-lg mx-auto">
            <div className="text-4xl mb-3">⌨️</div>
            <h3 className="text-lg font-extrabold text-[#FAF0CA]">Tidak ada model keyboard ditemukan</h3>
            <p className="mt-2 text-sm text-[#BACAD6] max-w-md mx-auto">
              Coba gunakan kata kunci lain, atau Anda bisa langsung mulai kustomisasi di Studio Desain 3D.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/keyboards"
                className="clay-btn-secondary px-5 py-2.5 text-xs font-bold cursor-pointer"
              >
                Reset Filter
              </Link>
              <Link
                href="/design"
                className="clay-btn-primary px-5 py-2.5 text-xs font-bold cursor-pointer"
              >
                Buka Studio 3D
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {keyboards.map((keyboard) => {
              const layout = keyboard.layoutJson as any;
              const keys = Array.isArray(layout?.keys) ? layout.keys : [];

              return (
                <div
                  key={keyboard.id}
                  className="clay-card group relative flex flex-col justify-between p-6 transition-all duration-300 hover:scale-[1.01]"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="clay-pill px-3 py-1 text-xs font-bold text-[#0D3B66] font-mono">
                        {keyboard.brand}
                      </span>
                      {keyboard.verified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#071E33] border border-[#F4D35E]/50 px-2.5 py-0.5 text-[11px] font-bold text-[#0D3B66]">
                          <CheckCircle2 className="h-3 w-3 text-[#EE964B]" />
                          Fit Verified
                        </span>
                      ) : (
                        <span className="rounded-full bg-[#071E33] px-2.5 py-0.5 text-[11px] font-semibold text-[#8FAEC7]">
                          Community
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="mt-4 text-xl font-extrabold text-[#FAF0CA] group-hover:text-[#F95738] transition font-sans">
                      {keyboard.name}
                    </h3>

                    {/* Specs info */}
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#BACAD6]">
                      <span className="rounded-md bg-[#071E33] px-2.5 py-1 font-mono font-semibold text-[#0D3B66]">
                        {keyboard.keyCount} Tombol
                      </span>
                      <span className="rounded-md bg-[#071E33] px-2.5 py-1 font-mono text-[#0D3B66]">
                        Stem: {keyboard.switchType}
                      </span>
                    </div>

                    {/* Visual Layout Representation Preview */}
                    <div className="mt-6 rounded-xl border border-[#FAF0CA]/10 bg-[#071E33] p-3 shadow-inner">
                      <div className="flex flex-col gap-1">
                        {[0, 1, 2, 3, 4].map((r) => {
                          const rowKeys = keys.filter((k: any) => k.row === r);
                          return (
                            <div key={r} className="flex h-3 gap-0.5">
                              {rowKeys.length > 0 ? (
                                rowKeys.slice(0, 14).map((k: any, i: number) => {
                                  const widthWeight = Math.max(1, Math.min(4, k.size || 1));
                                  return (
                                    <div
                                      key={i}
                                      style={{ flex: widthWeight }}
                                      className={`h-full rounded-[2px] transition ${
                                        k.group === 'ESC' || k.group === 'ENTER' || k.group === 'SPACE'
                                          ? 'bg-gradient-to-r from-[#F95738] to-[#EE964B]'
                                          : 'bg-[#0D3B66] group-hover:bg-white shadow-[0_1px_2px_rgba(13,59,102,0.06)]'
                                      }`}
                                    />
                                  );
                                })
                              ) : (
                                <div className="h-full w-full rounded-[2px] bg-[#E8DEBC]/50" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex items-center gap-3">
                    <Link
                      href={`/design?model=${encodeURIComponent(keyboard.slug)}`}
                      className="clay-btn-primary flex-1 py-2.5 px-4 text-center text-xs font-bold cursor-pointer"
                    >
                      Mulai Desain →
                    </Link>
                    <Link
                      href={`/keyboards/${keyboard.slug}`}
                      className="clay-btn-secondary px-3.5 py-2.5 text-center text-xs font-bold cursor-pointer"
                    >
                      Detail
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
