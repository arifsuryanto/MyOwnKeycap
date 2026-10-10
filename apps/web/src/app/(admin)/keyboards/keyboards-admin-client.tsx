'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  XCircle,
  Search,
  Keyboard as KeyboardIcon,
  Sparkles,
  Sliders,
} from 'lucide-react';

interface KeyboardsAdminClientProps {
  initialKeyboards: any[];
}

export function KeyboardsAdminClient({ initialKeyboards }: KeyboardsAdminClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = initialKeyboards.filter((kb) => {
    const q = search.toLowerCase();
    return (
      kb.name.toLowerCase().includes(q) ||
      kb.brand.toLowerCase().includes(q) ||
      kb.layout.toLowerCase().includes(q)
    );
  });

  const toggleVerified = async (id: string, current: boolean) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/keyboards/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: !current }),
      });
      if (!res.ok) {
        alert('Gagal mengupdate status verifikasi');
        return;
      }
      router.refresh();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari berdasarkan brand atau model (Keychron, Vortex...)"
          className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/60 pl-10 pr-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:border-amber-500 focus:outline-none backdrop-blur-sm"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((kb) => {
          const isLoading = loadingId === kb.id;

          return (
            <div
              key={kb.id}
              className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-sm transition hover:border-zinc-700 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
                    {kb.brand}
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">{kb.name}</h3>
                </div>

                <button
                  onClick={() => toggleVerified(kb.id, kb.verified)}
                  disabled={isLoading}
                  title="Klik untuk toggle status verifikasi"
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition ${
                    kb.verified
                      ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/50'
                      : 'bg-zinc-800/60 text-zinc-400 border-zinc-700 hover:bg-zinc-700/60'
                  }`}
                >
                  {kb.verified ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                      Verified
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 text-zinc-500" />
                      Unverified
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-zinc-800/60">
                <div className="rounded-xl bg-zinc-950/40 p-2 border border-zinc-800/40">
                  <span className="text-zinc-500 block">Layout</span>
                  <span className="font-semibold text-zinc-200 uppercase">{kb.layout}</span>
                </div>
                <div className="rounded-xl bg-zinc-950/40 p-2 border border-zinc-800/40">
                  <span className="text-zinc-500 block">Switch Mount</span>
                  <span className="font-semibold text-zinc-200">{kb.switchMount}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-800/60">
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  {kb._count.designs} custom designs
                </span>
                <a
                  href={`/catalog/${kb.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-400 hover:underline"
                >
                  Lihat Matriks KLE ↗
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
