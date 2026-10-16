import Link from 'next/link';
import { notFound } from 'next/navigation';
import { KeyboardService } from '@/server/services/keyboard.service';
import { CheckCircle2, ArrowRight, ShieldCheck, Cpu, Layers } from 'lucide-react';

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
    <div className="min-h-screen bg-[#071E33] text-[#FAF0CA] pb-24 font-sans selection:bg-[#F95738]/20 selection:text-[#0D3B66]">
      {/* Navigation breadcrumbs */}
      <div className="border-b border-[#FAF0CA]/10 bg-[#071E33]">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 text-xs text-[#BACAD6] sm:px-6">
          <Link href="/" className="hover:text-[#0D3B66] transition">
            Beranda
          </Link>
          <span className="text-[#EE964B]/40">/</span>
          <Link href="/keyboards" className="hover:text-[#0D3B66] transition">
            Katalog Keyboard
          </Link>
          <span className="text-[#EE964B]/40">/</span>
          <span className="text-[#0D3B66] font-bold">{keyboard.brand} {keyboard.name}</span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-10 space-y-10">
        {/* Header Hero */}
        <div className="clay-card p-8 sm:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="clay-pill px-3 py-1 text-xs font-bold text-[#0D3B66] font-mono">
                {keyboard.brand}
              </span>
              {keyboard.verified ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#071E33] border border-[#F4D35E]/50 px-3 py-1 text-xs font-bold text-[#0D3B66]">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#EE964B]" />
                  Terverifikasi Fit-Guaranteed
                </span>
              ) : (
                <span className="rounded-full bg-[#071E33] px-3 py-1 text-xs font-semibold text-[#8FAEC7]">
                  Community Verified
                </span>
              )}
            </div>

            <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold text-[#FAF0CA]">
              {keyboard.name}
            </h1>
            <p className="mt-2 text-sm text-[#BACAD6]">
              Spesifikasi layout resmi siap cetak untuk custom 3D keycaps modular dan full set.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/design?model=${encodeURIComponent(keyboard.slug)}`}
              className="clay-btn-primary px-8 py-4 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Desain Keycap Keyboard Ini</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Layout Visualizer */}
        <div className="clay-card p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-[#FAF0CA]">
                Visualisasi Layout ({keyboard.keyCount} Tombol)
              </h2>
              <p className="text-xs text-[#BACAD6] mt-1">
                Setiap tombol memiliki ukuran unit (u) dan profil row yang sudah disesuaikan secara presisi.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#BACAD6]">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-[3px] bg-[#0D3B66] border border-[#E8DEBC]" /> Standar
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-[3px] bg-gradient-to-r from-[#F95738] to-[#EE964B]" /> Accent (ESC / Enter / Space)
              </span>
            </div>
          </div>

          {/* Interactive Keyboard Matrix */}
          <div className="overflow-x-auto pb-4">
            <div className="min-w-[700px] flex flex-col gap-1.5 p-4 rounded-2xl border border-[#FAF0CA]/10 bg-[#071E33] shadow-inner">
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
                          className={`group relative flex flex-col items-center justify-center rounded-lg border text-xs font-bold select-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                            isAccent
                              ? 'border-[#F95738]/50 bg-gradient-to-r from-[#F95738] to-[#EE964B] text-white shadow-sm'
                              : 'border-white bg-[#0D3B66] text-[#0D3B66] hover:border-[#F4D35E]/60 shadow-[0_1px_3px_rgba(13,59,102,0.06)]'
                          }`}
                        >
                          <span className="truncate px-1 text-[11px] font-sans">{k.label}</span>
                          {uSize > 1 && (
                            <span className="absolute bottom-0.5 right-1 text-[9px] font-mono opacity-60">
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

        {/* Specifications & Fit Guarantee Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="clay-card p-6 flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 rounded-2xl bg-[#071E33] text-[#0D3B66] flex items-center justify-center mb-4">
                <Cpu className="w-5 h-5 text-[#0D3B66]" />
              </div>
              <h3 className="text-base font-extrabold text-[#FAF0CA]">Stem &amp; Switch Compatibility</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#BACAD6]">
                Stem MX standar cross 4.0 × 1.3 mm dengan stem tolerance calibrated ±0.02 mm untuk switch Cherry MX, Gateron, Kailh, Outemu, Akko, dll.
              </p>
            </div>
          </div>

          <div className="clay-card p-6 flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 rounded-2xl bg-[#071E33] text-[#EE964B] flex items-center justify-center mb-4">
                <Layers className="w-5 h-5 text-[#EE964B]" />
              </div>
              <h3 className="text-base font-extrabold text-[#FAF0CA]">Profil Didukung</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#BACAD6]">
                Tersedia profil <strong>Cherry</strong> (sculpted ergonomis sudut natural) dan <strong>OEM</strong> (tinggi standar bawaan pabrik).
              </p>
            </div>
          </div>

          <div className="clay-card p-6 flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 rounded-2xl bg-[#071E33] text-[#F95738] flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5 text-[#F95738]" />
              </div>
              <h3 className="text-base font-extrabold text-[#FAF0CA]">Jaminan Pas (Fit-Guarantee)</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#BACAD6]">
                Jika keycap longgar atau terlalu sempit pada keyboard {keyboard.name} Anda, kami cetak ulang gratis atau refund 100%.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
