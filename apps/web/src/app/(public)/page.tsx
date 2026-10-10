import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      {/* Hero Section */}
      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex items-center rounded-full border border-zinc-700 bg-zinc-900 px-4 py-1.5 text-sm text-zinc-400">
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500" />
          Segera Hadir — Early Bird Tersedia
        </div>

        <h1 className="mb-6 text-5xl font-bold tracking-tight text-white sm:text-7xl">
          Keycap Custom
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
            Desain dengan AI
          </span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-zinc-400">
          Deskripsikan tema keycap impian Anda → AI mendesain secara instan →
          Preview 3D interaktif → Bayar QRIS → Dicetak &amp; dikirim.
          <strong className="text-zinc-200"> Fit-guaranteed</strong> untuk model keyboard Anda.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/keyboards"
            className="inline-flex items-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:shadow-violet-500/40 hover:brightness-110"
          >
            Mulai Desain →
          </Link>
          <Link
            href="/estimator"
            className="inline-flex items-center rounded-xl border border-zinc-700 bg-zinc-900 px-8 py-3.5 text-base font-semibold text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-800"
          >
            Hitung Estimasi Harga
          </Link>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="mx-auto mt-24 grid max-w-5xl grid-cols-1 gap-6 px-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="mb-3 text-3xl">🎨</div>
          <h3 className="mb-2 text-lg font-semibold text-white">AI Desain Instan</h3>
          <p className="text-sm text-zinc-400">
            Cukup deskripsikan tema — AI menerjemahkan ke desain keycap presisi dengan warna,
            font, dan profil yang harmonis.
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="mb-3 text-3xl">⌨️</div>
          <h3 className="mb-2 text-lg font-semibold text-white">Fit-Guaranteed</h3>
          <p className="text-sm text-zinc-400">
            Pilih model keyboard Anda — layout dan ukuran tombol otomatis benar. Tidak perlu
            ukur manual.
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="mb-3 text-3xl">💳</div>
          <h3 className="mb-2 text-lg font-semibold text-white">Bayar QRIS</h3>
          <p className="text-sm text-zinc-400">
            Harga transparan di awal. Scan QRIS, selesai. Estimasi produksi dan ongkir
            ditampilkan sebelum bayar.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-24 pb-8 text-center text-xs text-zinc-600">
        © {new Date().getFullYear()} Keycap Platform. Semua harga adalah estimasi.
      </footer>
    </main>
  );
}
