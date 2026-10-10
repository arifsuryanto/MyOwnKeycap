import Link from 'next/link';
import { KeyboardService } from '@/server/services/keyboard.service';

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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
      {/* Header & Hero */}
      <section className="relative overflow-hidden border-b border-zinc-800/80 bg-gradient-to-b from-zinc-900/50 via-zinc-950 to-zinc-950 px-4 py-16 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.12),transparent_50%)]" />
        <div className="relative mx-auto max-w-6xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300 mb-4 backdrop-blur-md">
            <span>✨</span>
            <span>Database Terverifikasi • Fit-Guaranteed</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-white">
            Pilih Model Keyboard Anda
          </h1>
          <p className="mt-4 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto">
            Setiap keyboard punya layout, ukuran spasi, dan modifier yang unik.
            Pilih model Anda untuk memastikan keycap pas sempurna.
          </p>

          {/* Search bar */}
          <form method="GET" action="/keyboards" className="mt-8 mx-auto max-w-xl">
            <div className="relative flex items-center">
              <input
                type="text"
                name="q"
                defaultValue={search ?? ''}
                placeholder="Cari berdasarkan model atau brand (contoh: Q1, RK61, Akko)..."
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/80 px-5 py-4 pl-12 text-sm text-zinc-100 placeholder-zinc-500 backdrop-blur-md shadow-2xl transition focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
              <svg
                className="absolute left-4 h-5 w-5 text-zinc-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {brand && <input type="hidden" name="brand" value={brand} />}
              <button
                type="submit"
                className="absolute right-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500"
              >
                Cari
              </button>
            </div>
          </form>

          {/* Brand pills */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <Link
              href={search ? `/keyboards?q=${encodeURIComponent(search)}` : '/keyboards'}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                !brand
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                  : 'border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
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
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                    active
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                      : 'border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
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
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-zinc-400">
            Menampilkan <strong className="text-zinc-200">{keyboards.length}</strong> model keyboard
          </p>
          <Link
            href="/design"
            className="text-xs font-medium text-violet-400 hover:text-violet-300 transition"
          >
            Keyboard Anda tidak ada di list? Desain dengan template bebas →
          </Link>
        </div>

        {keyboards.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-12 text-center backdrop-blur-sm">
            <div className="text-4xl mb-3">⌨️</div>
            <h3 className="text-lg font-semibold text-white">Tidak ada model keyboard ditemukan</h3>
            <p className="mt-2 text-sm text-zinc-400 max-w-md mx-auto">
              Coba gunakan kata kunci lain, atau Anda bisa mengimpor layout custom dari Keyboard Layout Editor (KLE).
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Link
                href="/keyboards"
                className="rounded-xl border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700 transition"
              >
                Reset Filter
              </Link>
              <Link
                href="/design"
                className="rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-violet-500 transition"
              >
                Buka Desain Studio
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
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800/90 bg-zinc-900/40 p-6 backdrop-blur-sm transition-all duration-300 hover:border-violet-500/50 hover:bg-zinc-900/80 hover:shadow-2xl hover:shadow-violet-500/10"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-lg border border-zinc-800 bg-zinc-800/50 px-2.5 py-1 text-xs font-medium text-zinc-300">
                        {keyboard.brand}
                      </span>
                      {keyboard.verified ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Fit Verified
                        </span>
                      ) : (
                        <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-[11px] font-medium text-zinc-400">
                          Community
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="mt-4 text-xl font-bold text-white group-hover:text-violet-300 transition">
                      {keyboard.name}
                    </h3>

                    {/* Specs info */}
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-400">
                      <span className="rounded bg-zinc-800/60 px-2 py-1">
                        {keyboard.keyCount} Tombol
                      </span>
                      <span className="rounded bg-zinc-800/60 px-2 py-1">
                        Stem: {keyboard.switchType}
                      </span>
                    </div>

                    {/* Visual Layout Representation Preview */}
                    <div className="mt-6 rounded-xl border border-zinc-800/60 bg-zinc-950/70 p-3">
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
                                          ? 'bg-violet-500/60'
                                          : 'bg-zinc-800/90 group-hover:bg-zinc-700/80'
                                      }`}
                                    />
                                  );
                                })
                              ) : (
                                <div className="h-full w-full rounded-[2px] bg-zinc-800/30" />
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
                      className="flex-1 rounded-xl bg-violet-600 px-4 py-2.5 text-center text-xs font-semibold text-white shadow-md shadow-violet-600/20 transition hover:bg-violet-500 hover:shadow-violet-600/30"
                    >
                      Mulai Desain Keycap →
                    </Link>
                    <Link
                      href={`/keyboards/${keyboard.slug}`}
                      className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2.5 text-center text-xs font-medium text-zinc-300 transition hover:border-zinc-700 hover:text-white"
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
