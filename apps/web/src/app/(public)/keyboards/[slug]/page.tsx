import Link from 'next/link';
import { notFound } from 'next/navigation';
import { KeyboardService } from '@/server/services/keyboard.service';

interface KeyboardDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: KeyboardDetailPageProps) {
  const { slug } = await params;
  const keyboard = await KeyboardService.getKeyboardBySlug(slug);
  if (!keyboard) return { title: 'Keyboard Not Found' };

  return {
    title: `Keycap Custom untuk ${keyboard.brand} ${keyboard.name} — Fit-Guaranteed`,
    description: `Desain keycap khusus untuk ${keyboard.brand} ${keyboard.name} (${keyboard.keyCount} keys). Layout, ukuran spasi dan modifier 100% presisi.`,
  };
}

export default async function KeyboardDetailPage({ params }: KeyboardDetailPageProps) {
  const { slug } = await params;
  const keyboard = await KeyboardService.getKeyboardBySlug(slug);

  if (!keyboard) {
    notFound();
  }

  const layout = keyboard.layoutJson as any;
  const keys: any[] = Array.isArray(layout?.keys) ? layout.keys : [];

  // Group keys by row
  const rowNumbers = Array.from(new Set(keys.map((k) => k.row))).sort((a, b) => a - b);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
      {/* Navigation breadcrumbs */}
      <div className="border-b border-zinc-800/80 bg-zinc-900/30">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 text-xs text-zinc-400 sm:px-6">
          <Link href="/" className="hover:text-zinc-200 transition">
            Beranda
          </Link>
          <span>/</span>
          <Link href="/keyboards" className="hover:text-zinc-200 transition">
            Katalog Keyboard
          </Link>
          <span>/</span>
          <span className="text-zinc-200">{keyboard.brand} {keyboard.name}</span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-10">
        {/* Header Hero */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900/80 via-zinc-900/40 to-zinc-950 p-8 shadow-2xl backdrop-blur-md">
          <div>
            <div className="flex items-center gap-3">
              <span className="rounded-xl border border-zinc-700 bg-zinc-800/80 px-3 py-1 text-xs font-semibold text-zinc-300">
                {keyboard.brand}
              </span>
              {keyboard.verified ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Terverifikasi Fit-Guaranteed
                </span>
              ) : (
                <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-400">
                  Community Verified
                </span>
              )}
            </div>

            <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white">
              {keyboard.name}
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Spesifikasi layout resmi siap cetak untuk custom 3D keycaps.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/design?model=${encodeURIComponent(keyboard.slug)}`}
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-violet-600/30 transition hover:shadow-violet-600/50 hover:brightness-110"
            >
              Desain Keycap Keyboard Ini →
            </Link>
          </div>
        </div>

        {/* Layout Visualizer */}
        <div className="mt-10 rounded-3xl border border-zinc-800/90 bg-zinc-900/50 p-6 sm:p-8 backdrop-blur-md">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Visualisasi Layout ({keyboard.keyCount} Tombol)</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Setiap tombol memiliki ukuran (u) dan profil row yang sudah disesuaikan secara matematis.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-[2px] bg-zinc-800 border border-zinc-700" /> Standar
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-[2px] bg-violet-600/60 border border-violet-500/50" /> Accent (Enter/Space/Esc)
              </span>
            </div>
          </div>

          {/* Interactive Keyboard Matrix */}
          <div className="overflow-x-auto pb-4">
            <div className="min-w-[700px] flex flex-col gap-1.5 p-4 rounded-2xl border border-zinc-800/70 bg-zinc-950/80 shadow-inner">
              {rowNumbers.map((rowNum) => {
                const rowKeys = keys
                  .filter((k) => k.row === rowNum)
                  .sort((a, b) => a.col - b.col);

                return (
                  <div key={rowNum} className="flex gap-1.5 h-11">
                    {rowKeys.map((k, idx) => {
                      const uSize = k.size || 1;
                      const isAccent = ['ESC', 'ENTER', 'SPACE'].includes(k.group);

                      return (
                        <div
                          key={k.id || idx}
                          style={{ flex: uSize }}
                          title={`${k.label} (${uSize}u) - Row ${k.row}`}
                          className={`group relative flex flex-col items-center justify-center rounded-lg border text-xs font-semibold select-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                            isAccent
                              ? 'border-violet-500/40 bg-violet-950/40 text-violet-200 hover:bg-violet-900/60 shadow-violet-500/10'
                              : 'border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800 hover:text-white'
                          }`}
                        >
                          <span className="truncate px-1 text-[11px]">{k.label}</span>
                          {uSize > 1 && (
                            <span className="absolute bottom-0.5 right-1 text-[9px] text-zinc-500 group-hover:text-zinc-400">
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
        </div>

        {/* Specifications & Fit Guarantee Card */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="text-base font-semibold text-white">Stem & Switch Compatibility</h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
              Stem MX standar cross 4.0 × 1.3 mm dengan stem tolerance calibrated 0.15 mm untuk switch Cherry MX, Gateron, Kailh, Outemu, Akko, dll.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <div className="text-2xl mb-2">📐</div>
            <h3 className="text-base font-semibold text-white">Profil Didukung</h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
              Tersedia profil <strong>Cherry</strong> (sculpted ergonomis) dan <strong>OEM</strong> (tinggi standar keyboard bawaan).
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <div className="text-2xl mb-2">🛡️</div>
            <h3 className="text-base font-semibold text-white">Jaminan Pas (Fit-Guarantee)</h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
              Jika keycap longgar atau terlalu sempit pada keyboard {keyboard.name} Anda, kami cetak ulang gratis atau refund 100%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
