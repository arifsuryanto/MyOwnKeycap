import Link from 'next/link';
import { Calculator, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Cpu, Layers, HelpCircle } from 'lucide-react';
import LandingPricingEstimator from '@/components/home/LandingPricingEstimator';

export const metadata = {
  title: 'Estimator Harga Cetak Keycap Custom — Hitung Transparan & Seketika',
  description:
    'Kalkulator biaya cetak keycap 3D real-time. Hitung transparan berdasarkan jumlah tombol, material (PETG / Resin), profil, dan fitur relief timbul.',
};

const TIERS = [
  {
    name: 'Sampler Pack',
    range: '1 - 4 Keycaps',
    discount: 'Harga Standar',
    pricePerKey: 'Rp 25.000',
    desc: 'Paling pas untuk mencoba kualitas material, mencetak tombol ESC Artisan, atau accent spacebar.',
    features: [
      'Tanpa minimum pemesanan',
      'Pilihan profil Cherry / OEM',
      'Bisa tambah 3D relief timbul',
      'Garansi fit MX Stem 100%',
    ],
    highlight: false,
    badge: 'Satuan Novelty',
  },
  {
    name: 'Accent Cluster',
    range: '5 - 49 Keycaps',
    discount: 'Hemat 10%',
    pricePerKey: 'Rp 18.000',
    desc: 'Paket paling populer untuk cluster gaming (WASD + Arrows), Numpad, atau deretan tombol modifier.',
    features: [
      'Diskon otomatis 10%',
      'Kombinasi warna multi-keys',
      'Preset tombol siap klik',
      'QC toleransi ketat 0.05mm',
    ],
    highlight: true,
    badge: 'Favorit Gamer',
  },
  {
    name: 'Full Mechanical Set',
    range: '50+ Keycaps',
    discount: 'Hemat 20%',
    pricePerKey: 'Rp 14.000',
    desc: 'Transformasi total keyboard Anda dari Alpha, Numrow, Modifier, hingga spasi panjang.',
    features: [
      'Diskon maksimal 20%',
      'Gratis Premium Wire Puller',
      'Kotak tray pelindung eksklusif',
      'Prioritas antrian print agent',
    ],
    highlight: false,
    badge: 'Full Keyboard',
  },
];

const ESTIMATOR_FAQS = [
  {
    q: 'Apakah ada biaya setup atau pembuatan cetakan terpisah?',
    a: 'Tidak ada sama sekali! Teknologi 3D printing presisi kami mencetak langsung dari model CAD digital tanpa perlu membuat molding cetakan fisik mahal.',
  },
  {
    q: 'Bagaimana cara kerja diskon kuantitas?',
    a: 'Diskon berlaku otomatis di kalkulator dan checkout: 10% untuk pemesanan 5-49 tombol, dan 20% untuk 50 tombol ke atas.',
  },
  {
    q: 'Apakah relief timbul (Image-to-3D) menambah biaya?',
    a: 'Biaya relief timbul sudah dihitung secara transparan di dalam generator studio dan tidak ada biaya tambahan siluman saat checkout.',
  },
  {
    q: 'Berapa lama estimasi proses cetak hingga dikirim?',
    a: 'Cetak satuan biasanya selesai dalam 1 hari kerja, sedangkan full set 2-3 hari kerja sebelum lolos uji QC dan diserahkan ke kurir.',
  },
];

export default function EstimatorPage() {
  return (
    <div className="min-h-screen bg-[#071E33] text-[#FAF0CA] pb-24 font-sans selection:bg-[#F95738]/20 selection:text-[#0D3B66]">
      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-[#FAF0CA]/10 bg-gradient-to-b from-[#071E33] via-[#0A2640] to-[#071E33] px-4 py-16 sm:px-6 lg:px-8">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-[#F4D35E]/20 to-transparent blur-3xl pointer-events-none" />
        <div className="relative mx-auto max-w-5xl text-center space-y-4">
          <div className="clay-pill inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-[#0D3B66]">
            <Calculator className="w-3.5 h-3.5 text-[#F95738]" />
            <span>Kalkulator Transparan &amp; Real-Time</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#FAF0CA] leading-tight">
            Estimator Biaya Cetak Keycap
          </h1>
          <p className="mt-3 text-base sm:text-lg text-[#BACAD6] max-w-2xl mx-auto leading-relaxed">
            Hitung perkiraan biaya kustomisasi keycap Anda dengan akurasi 100%.
            Pilih paket satuan, cluster gaming, atau full set dengan diskon otomatis.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">
        {/* Interactive Pricing Estimator Card */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0D3B66]">
              Simulasi Biaya Langsung
            </h2>
            <p className="text-sm text-[#BACAD6]">
              Geser slider tombol dan pilih material untuk melihat rincian kalkulasi harga.
            </p>
          </div>

          <LandingPricingEstimator />
        </section>

        {/* Pricing Tiers Comparison */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0D3B66]">
              Paket Pemesanan &amp; Diskon Bundle
            </h2>
            <p className="text-sm text-[#BACAD6]">
              Semakin banyak tombol yang Anda pesan, semakin hemat biaya per keycap.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`clay-card p-7 flex flex-col justify-between transition-all duration-300 relative ${
                  tier.highlight
                    ? 'bg-[#0D3B66] border-2 border-[#F95738] shadow-xl shadow-[#F95738]/10 scale-[1.02]'
                    : 'bg-[#0D3B66] border border-[#FAF0CA]/12 hover:border-[#F4D35E]'
                }`}
              >
                {tier.highlight && (
                  <span className="clay-pill absolute -top-3 left-1/2 -translate-x-1/2 bg-[#F95738] text-white text-[10px] font-extrabold px-3 py-1 shadow-md">
                    {tier.badge}
                  </span>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#BACAD6]">{tier.range}</span>
                    <span className="clay-pill bg-[#071E33] border border-[#F4D35E]/60 text-[10px] font-bold text-[#0D3B66] px-2.5 py-0.5">
                      {tier.discount}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-extrabold text-[#0D3B66]">{tier.name}</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-2xl font-black text-[#FAF0CA] font-mono">{tier.pricePerKey}</span>
                      <span className="text-xs text-[#BACAD6]">/ keycap</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#BACAD6] leading-relaxed">{tier.desc}</p>

                  <ul className="space-y-2.5 pt-4 border-t border-[#FAF0CA]/12">
                    {tier.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2 text-xs text-[#FAF0CA]">
                        <CheckCircle2 className="w-4 h-4 text-[#F95738] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-6">
                  <Link
                    href="/design"
                    className={`w-full py-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition ${
                      tier.highlight
                        ? 'clay-btn-primary bg-gradient-to-r from-[#F95738] to-[#EE964B] text-white shadow-lg shadow-[#F95738]/20'
                        : 'clay-btn-secondary text-[#0D3B66] bg-[#071E33] border border-[#0D3B66]/15 hover:bg-[#0D3B66]'
                    }`}
                  >
                    <span>Mulai Desain Paket Ini</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Value Guarantees Banner */}
        <section className="clay-card p-8 bg-gradient-to-br from-[#0A2C4C] to-[#051524] text-white shadow-xl space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#FAF0CA]">
              Mengapa Estimasi Kami 100% Terpercaya?
            </h2>
            <p className="text-xs sm:text-sm text-[#FFFDF8]/80 leading-relaxed">
              Semua harga sudah mencakup pengujian toleransi fisik, material tahan benturan, dan garansi fit tanpa biaya tersembunyi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            <div className="clay-card bg-[#0D3B66]/10 backdrop-blur-md p-5 border border-white/10 text-center space-y-2">
              <ShieldCheck className="w-7 h-7 text-[#F4D35E] mx-auto" />
              <h4 className="text-sm font-bold text-white">Garansi Pas 100%</h4>
              <p className="text-[11px] text-[#FAF0CA]/80 leading-relaxed">
                Jika keycap longgar atau terlalu sempit pada stem switch Anda, kami cetak ulang gratis.
              </p>
            </div>
            <div className="clay-card bg-[#0D3B66]/10 backdrop-blur-md p-5 border border-white/10 text-center space-y-2">
              <Cpu className="w-7 h-7 text-[#F4D35E] mx-auto" />
              <h4 className="text-sm font-bold text-white">Slicing Presisi CAD</h4>
              <p className="text-[11px] text-[#FAF0CA]/80 leading-relaxed">
                Algoritma generator CAD otomatis menghitung volume filament dan waktu cetak nozel.
              </p>
            </div>
            <div className="clay-card bg-[#0D3B66]/10 backdrop-blur-md p-5 border border-white/10 text-center space-y-2">
              <Layers className="w-7 h-7 text-[#F4D35E] mx-auto" />
              <h4 className="text-sm font-bold text-white">Bahan Baku Premium</h4>
              <p className="text-[11px] text-[#FAF0CA]/80 leading-relaxed">
                PETG Tough dan Resin 8K tersertifikasi aman, tidak mudah luntur, dan tahan panas.
              </p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-[#0D3B66]">
              Pertanyaan Seputar Harga &amp; Estimasi
            </h2>
            <p className="text-xs sm:text-sm text-[#BACAD6]">
              Informasi lengkap sebelum Anda memesan di MyOwnKeycap.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {ESTIMATOR_FAQS.map((faq, i) => (
              <div key={i} className="clay-card p-5 bg-[#0D3B66] border border-[#FAF0CA]/12 space-y-2">
                <h3 className="text-sm font-bold text-[#0D3B66] flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#F95738] shrink-0" />
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs text-[#BACAD6] leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="text-center space-y-4 pt-8">
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#FAF0CA]">
            Siap Merealisasikan Keycap Impian Anda?
          </h3>
          <p className="text-xs sm:text-sm text-[#BACAD6] max-w-md mx-auto">
            Gunakan AI Studio kami sekarang untuk membuat desain dalam hitungan detik.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/design"
              className="clay-btn-primary px-8 py-3.5 text-xs font-extrabold text-white bg-gradient-to-r from-[#F95738] to-[#EE964B] shadow-xl hover:scale-105 inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Buka AI Design Studio</span>
            </Link>
            <Link
              href="/keyboards"
              className="clay-btn-secondary px-6 py-3.5 text-xs font-bold text-[#0D3B66] bg-[#071E33] border border-[#0D3B66]/15 hover:bg-[#0D3B66] inline-flex items-center gap-2"
            >
              <span>Lihat Katalog Keyboard</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
