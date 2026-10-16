import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Layers, 
  Maximize2, 
  QrCode, 
  Keyboard, 
  CheckCircle2, 
  SlidersHorizontal,
  Flame,
  Star,
  Cpu,
  Truck
} from 'lucide-react';
import KeycapRubikCube3D from '@/components/3d/KeycapRubikCube3D';
import AcousticSoundboard from '@/components/home/AcousticSoundboard';
import CraftsmanshipComparison from '@/components/home/CraftsmanshipComparison';
import LandingPricingEstimator from '@/components/home/LandingPricingEstimator';
import FaqAccordion from '@/components/home/FaqAccordion';

export const metadata = {
  title: 'MyOwnKeycap | Atelier Keycap Mekanik Custom & Relief 3D',
  description:
    'Rancang dan miliki keycap mekanik modular custom: WASD gaming cluster, arrow keys, hingga relief timbul 3D dari foto Anda. Dinding PBT 1.5mm, fit-guaranteed Cherry MX switch.',
};

export default function HomePage() {
  return (
    <main className="w-full flex flex-col items-center overflow-x-hidden">
      {/* 1. HERO SECTION: RUBIK SEBAGAI ICON UTAMA LANDING PAGE (BORDERLESS & FLOATING) */}
      <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-2 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Hero Column: Headline & Action CTA */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
            {/* Atelier Status Pill Badge */}
            <div className="clay-pill inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-[#BACAD6]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F4D35E] animate-pulse" />
              <span>✦ Atelier Keycap Custom Jakarta</span>
              <span className="text-[#E2D9B8]">|</span>
              <span className="text-[#F95738] font-bold">Terima Pesanan Modular</span>
            </div>

            {/* Editorial Soft Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#FAF0CA] leading-[1.12]">
              Sentuhan Tactile.{' '}
              <span className="block text-[#F95738]">
                Karya Seni di Atas Switch Anda.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#BACAD6] max-w-xl leading-relaxed">
              Kustomisasi keycap modular (WASD, Arrows, hingga relief timbul 3D dari foto Anda). 
              Setiap tombol dicetak presisi dengan dinding PBT tebal 1.5mm untuk profil suara thock yang padat.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto pt-2">
              <Link
                href="/keyboards"
                className="clay-btn-primary w-full sm:w-auto px-7 py-3.5 text-sm font-bold flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Pilih Model Keyboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/design"
                className="clay-btn-secondary w-full sm:w-auto px-6 py-3.5 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#F95738]" />
                <span>Buka Studio 3D Langsung</span>
              </Link>
              <Link
                href="/estimator"
                className="clay-pill px-4 py-3.5 text-xs font-bold text-[#BACAD6] hover:text-[#FAF0CA] flex items-center gap-1.5 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Estimasi Biaya</span>
              </Link>
            </div>

            {/* Social Proof & Guarantees */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4 text-xs font-semibold text-[#BACAD6]">
              <div className="clay-pill px-3 py-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#F4D35E]" />
                <span>1,280+ Keycap Terkirim</span>
              </div>
              <div className="clay-pill px-3 py-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#F95738]" />
                <span>100% Fit MX Guarantee</span>
              </div>
              <div className="clay-pill px-3 py-1.5 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-[#0D3B66]" />
                <span>Bayar Instan QRIS</span>
              </div>
            </div>
          </div>

          {/* Right Hero Column: RUBIK 3D SEBAGAI ICON UTAMA (FLOATING BORDERLESS) */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative">
            {/* Soft Ambient Floating Glow behind Rubik */}
            <div className="absolute w-[360px] h-[360px] rounded-full bg-gradient-to-tr from-[#FAF0CA]/70 via-[#FFF6EC]/50 to-[#F4D35E]/40 blur-3xl pointer-events-none -z-10" />

            {/* 3D Rubik Keycap Centerpiece Icon */}
            <div className="w-full flex justify-center">
              <KeycapRubikCube3D />
            </div>
          </div>
        </div>
      </section>

      {/* 2. MODULAR KEYCAP PACKS SHOWCASE (WITH REAL GENERATED CLAY IMAGES) */}
      <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="clay-pill inline-flex items-center gap-2 px-3.5 py-1 text-[#F95738] text-xs font-mono font-bold mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>KUSTOMISASI FLEKSIBEL TANPA FULL SET</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#FAF0CA] tracking-tight">
            Pilih Paket Modular Favorit Anda
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#BACAD6]">
            Tak perlu mengganti seluruh keyboard. Personalisasi area tombol yang paling sering Anda sentuh dengan gaya claymorphic estetik.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Card 1: WASD Gamer Cluster */}
          <div className="clay-card p-6 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300">
            <div>
              {/* Product Image */}
              <div className="w-full h-52 relative rounded-2xl overflow-hidden mb-5 bg-[#0D3B66] shadow-inner">
                <Image
                  src="/images/landing/wasd_pack.jpg"
                  alt="WASD Gamer Cluster Keycaps"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <span className="absolute top-3 left-3 clay-pill px-2.5 py-0.5 text-[11px] font-mono font-bold text-[#F95738]">
                  4 Keys Cluster
                </span>
              </div>

              <h3 className="text-xl font-extrabold text-[#FAF0CA] mb-1">
                WASD Gamer Cluster
              </h3>
              <p className="text-xs text-[#BACAD6] mb-4 leading-relaxed">
                Empat tombol gerakan primer dengan tekstur timbul taktil anti-slip. Grip mantap untuk sesi gaming kompetitif.
              </p>
            </div>

            <div className="pt-4 border-t border-[#E8DEBC] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#8FAEC7]">Mulai dari</span>
                <div className="text-lg font-extrabold text-[#FAF0CA] font-mono">Rp 72.000</div>
              </div>
              <Link
                href="/design?keys=4&profile=CHERRY"
                className="clay-btn-primary px-4 py-2 text-xs font-bold"
              >
                Kustomisasi WASD
              </Link>
            </div>
          </div>

          {/* Card 2: Arrow Cluster Navigation */}
          <div className="clay-card p-6 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300">
            <div>
              {/* Product Image */}
              <div className="w-full h-52 relative rounded-2xl overflow-hidden mb-5 bg-[#0D3B66] shadow-inner">
                <Image
                  src="/images/landing/arrow_cluster.jpg"
                  alt="Arrow Navigation Cluster Keycaps"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <span className="absolute top-3 left-3 clay-pill px-2.5 py-0.5 text-[11px] font-mono font-bold text-[#F4D35E]">
                  4 Keys Navigation
                </span>
              </div>

              <h3 className="text-xl font-extrabold text-[#FAF0CA] mb-1">
                Arrow Cluster Navigation
              </h3>
              <p className="text-xs text-[#BACAD6] mb-4 leading-relaxed">
                Tombol panah pastel kontras untuk efisiensi koding, editing, dan navigasi desainer. Cekungan ergonomis lembut.
              </p>
            </div>

            <div className="pt-4 border-t border-[#E8DEBC] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#8FAEC7]">Mulai dari</span>
                <div className="text-lg font-extrabold text-[#FAF0CA] font-mono">Rp 72.000</div>
              </div>
              <Link
                href="/design?keys=4&profile=OEM"
                className="clay-btn-secondary px-4 py-2 text-xs font-bold"
              >
                Kustomisasi Panah
              </Link>
            </div>
          </div>

          {/* Card 3: Bespoke Image Relief 3D */}
          <div className="clay-card p-6 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300">
            <div>
              {/* Product Image */}
              <div className="w-full h-52 relative rounded-2xl overflow-hidden mb-5 bg-[#0D3B66] shadow-inner">
                <Image
                  src="/images/landing/artisan_relief.jpg"
                  alt="Bespoke Image Relief 3D Keycap"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <span className="absolute top-3 left-3 clay-pill px-2.5 py-0.5 text-[11px] font-mono font-bold text-[#F95738]">
                  1 Key Artisan (ESC/Enter)
                </span>
              </div>

              <h3 className="text-xl font-extrabold text-[#FAF0CA] mb-1">
                Bespoke Image Relief 3D
              </h3>
              <p className="text-xs text-[#BACAD6] mb-4 leading-relaxed">
                Ubah gambar foto atau logo favorit Anda menjadi ukiran relief kontur timbul 3D nyata di tombol ESC atau Enter.
              </p>
            </div>

            <div className="pt-4 border-t border-[#E8DEBC] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#8FAEC7]">Mulai dari</span>
                <div className="text-lg font-extrabold text-[#FAF0CA] font-mono">Rp 32.000</div>
              </div>
              <Link
                href="/design?relief=true"
                className="clay-btn-primary px-4 py-2 text-xs font-bold"
              >
                Upload Foto 3D
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ACOUSTIC SWITCH SOUNDBOARD LAB */}
      <section className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <AcousticSoundboard />
      </section>

      {/* 4. KEYCAP ANATOMY & CRAFTSMANSHIP (WITH REAL CROSS-SECTION MACRO IMAGE) */}
      <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-12">
          {/* Left: Cross-Section Macro Image */}
          <div className="lg:col-span-5 clay-card p-5 relative overflow-hidden group">
            <div className="w-full h-80 relative rounded-2xl overflow-hidden shadow-inner">
              <Image
                src="/images/landing/anatomy_cross_section.jpg"
                alt="Anatomi Keycap PBT 1.5mm & Stem Cross"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-bold text-[#BACAD6]">
              <span>🔍 Anatomi Rekayasa Keycap</span>
              <span className="text-[#F95738]">PBT Solid 1.5mm</span>
            </div>
          </div>

          {/* Right: Technical Features Breakdown */}
          <div className="lg:col-span-7 space-y-4">
            <div className="clay-pill inline-flex items-center gap-2 px-3.5 py-1 text-[#F95738] text-xs font-mono font-bold">
              <Cpu className="w-3.5 h-3.5" />
              <span>REKAYASA AKUSTIK &amp; STEM</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#FAF0CA] tracking-tight">
              Anatomi Keycap Standar Atelier
            </h2>
            <p className="text-sm sm:text-base text-[#BACAD6] leading-relaxed">
              Kualitas suara ketukan sebuah keyboard berakar dari ketebalan dinding tombol dan presisi stem cross. Kami mengeliminasi suara cempreng dan oblak melalui spesifikasi tanpa kompromi.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="clay-card-tint p-4">
                <div className="text-2xl font-extrabold text-[#F95738] font-mono">1.5 mm</div>
                <div className="text-xs font-bold text-[#FAF0CA] mt-1">Dinding PBT Tebal</div>
                <p className="text-[11px] text-[#BACAD6] mt-1">Mencegah pantulan berongga untuk suara deep thock padat.</p>
              </div>

              <div className="clay-card-tint p-4">
                <div className="text-2xl font-extrabold text-[#F4D35E] font-mono">±0.02 mm</div>
                <div className="text-xs font-bold text-[#FAF0CA] mt-1">Toleransi Stem MX</div>
                <p className="text-[11px] text-[#BACAD6] mt-1">Cengkeraman switch presisi, kokoh, dan tidak goyang saat ditekan.</p>
              </div>

              <div className="clay-card-tint p-4">
                <div className="text-2xl font-extrabold text-[#EE964B] font-mono">Spherical</div>
                <div className="text-xs font-bold text-[#FAF0CA] mt-1">Cekungan Ergonomis</div>
                <p className="text-[11px] text-[#BACAD6] mt-1">Memeluk ujung jari secara pas untuk kenyamanan mengetik berjam-jam.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Craftsmanship Comparison Table */}
        <CraftsmanshipComparison />
      </section>

      {/* 5. 4-STEP HOW IT WORKS (WITH ATELIER WORKSHOP IMAGE) */}
      <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1 clay-card p-5 relative overflow-hidden group">
            <div className="w-full h-88 relative rounded-2xl overflow-hidden shadow-inner">
              <Image
                src="/images/landing/how_it_works.jpg"
                alt="Proses Atelier Pembuatan Keycap"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
            <div className="mt-3 text-center text-xs font-bold text-[#BACAD6]">
              Alur Workshop: Dari Desain Digital ke Meja Kerja Anda
            </div>
          </div>

          <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
            <div>
              <div className="clay-pill inline-flex items-center gap-2 px-3.5 py-1 text-[#F95738] text-xs font-mono font-bold mb-3">
                <Flame className="w-3.5 h-3.5" />
                <span>ALUR PEMESANAN MUDAH</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#FAF0CA] tracking-tight">
                Bagaimana Cara Kerjanya?
              </h2>
              <p className="text-sm text-[#BACAD6] mt-1">
                Empat langkah praktis untuk mendapatkan keycap impian Anda di meja kerja.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="clay-card-tint p-4">
                <div className="clay-pill w-8 h-8 flex items-center justify-center text-xs font-mono font-bold text-[#F95738] mb-2">
                  01
                </div>
                <h4 className="text-sm font-bold text-[#FAF0CA]">Pilih Layout Keyboard</h4>
                <p className="text-xs text-[#BACAD6] mt-1">
                  Pilih model 60%, 65%, 75%, TKL, atau upload layout JSON kle kustom.
                </p>
              </div>

              <div className="clay-card-tint p-4">
                <div className="clay-pill w-8 h-8 flex items-center justify-center text-xs font-mono font-bold text-[#F4D35E] mb-2">
                  02
                </div>
                <h4 className="text-sm font-bold text-[#FAF0CA]">Racik 3D &amp; Relief</h4>
                <p className="text-xs text-[#BACAD6] mt-1">
                  Live 3D canvas studio, pilih warna pastel lembut, atau upload foto untuk relief timbul.
                </p>
              </div>

              <div className="clay-card-tint p-4">
                <div className="clay-pill w-8 h-8 flex items-center justify-center text-xs font-mono font-bold text-[#EE964B] mb-2">
                  03
                </div>
                <h4 className="text-sm font-bold text-[#FAF0CA]">Bayar Instan QRIS</h4>
                <p className="text-xs text-[#BACAD6] mt-1">
                  Scan kode QRIS dari mobile banking atau e-wallet. Verifikasi otomatis detik itu juga.
                </p>
              </div>

              <div className="clay-card-tint p-4">
                <div className="clay-pill w-8 h-8 flex items-center justify-center text-xs font-mono font-bold text-[#EE964B] mb-2">
                  04
                </div>
                <h4 className="text-sm font-bold text-[#FAF0CA]">Cetak &amp; Kirim Aman</h4>
                <p className="text-xs text-[#BACAD6] mt-1">
                  Produksi 2-3 hari kerja dengan foam proteksi khusus, dikirim ke seluruh Indonesia.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. LIVE PRICING ESTIMATOR SECTION */}
      <section className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
        <LandingPricingEstimator />
      </section>

      {/* 7. VERIFIED COMMUNITY BUILDS (WITH REAL PHOTO GALLERY) */}
      <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="clay-pill inline-flex items-center gap-2 px-3.5 py-1 text-[#F4D35E] text-xs font-mono font-bold mb-3">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>GALERI ENTHUSIAST &amp; REVIEW</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#FAF0CA] tracking-tight">
            Dipercaya Komunitas Mechanical Keyboard
          </h2>
          <p className="mt-2 text-sm text-[#BACAD6]">
            Lihat hasil build nyata keycap pastel kustom di atas keyboard favorit para builder.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Build 1 */}
          <div className="clay-card p-6 flex flex-col justify-between">
            <div>
              <div className="w-full h-56 relative rounded-2xl overflow-hidden mb-4 shadow-inner">
                <Image
                  src="/images/landing/build_matcha.jpg"
                  alt="Keychron Q1 Pro dengan Keycap Matcha Custom"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="flex items-center gap-1 text-amber-500 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs text-[#BACAD6] leading-relaxed italic mb-4">
                &ldquo;Dinding PBT 1.5mm membuat switch Oil King saya bersuara deep thock sempurna. Stem-nya presisi sekali dan tidak ada goyang sama sekali.&rdquo;
              </p>
            </div>
            <div className="pt-3 border-t border-[#E8DEBC] flex items-center justify-between text-xs">
              <div>
                <div className="font-extrabold text-[#FAF0CA]">Bagas Pratama</div>
                <div className="text-[11px] text-[#8FAEC7]">Keychron Q1 Pro Build</div>
              </div>
              <span className="clay-pill px-2.5 py-0.5 text-[10px] font-bold text-[#F4D35E]">Terverifikasi</span>
            </div>
          </div>

          {/* Build 2 */}
          <div className="clay-card p-6 flex flex-col justify-between">
            <div>
              <div className="w-full h-56 relative rounded-2xl overflow-hidden mb-4 shadow-inner">
                <Image
                  src="/images/landing/build_pastel.jpg"
                  alt="Zoom75 dengan Keycap Pastel Macaron Custom"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="flex items-center gap-1 text-amber-500 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs text-[#BACAD6] leading-relaxed italic mb-4">
                &ldquo;Warna pastel macaron-nya sangat cantik di meja! Detail relief hati di ESC-nya rapi banget dan finishing claymorphic-nya lembut di jari.&rdquo;
              </p>
            </div>
            <div className="pt-3 border-t border-[#E8DEBC] flex items-center justify-between text-xs">
              <div>
                <div className="font-extrabold text-[#FAF0CA]">Felicia Tan</div>
                <div className="text-[11px] text-[#8FAEC7]">Zoom75 EE Build</div>
              </div>
              <span className="clay-pill px-2.5 py-0.5 text-[10px] font-bold text-[#F4D35E]">Terverifikasi</span>
            </div>
          </div>

          {/* Build 3 */}
          <div className="clay-card p-6 flex flex-col justify-between">
            <div>
              <div className="w-full h-56 relative rounded-2xl overflow-hidden mb-4 shadow-inner">
                <Image
                  src="/images/landing/artisan_relief.jpg"
                  alt="Mode Sonnet dengan 3D Image Relief Keycap"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="flex items-center gap-1 text-amber-500 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs text-[#BACAD6] leading-relaxed italic mb-4">
                &ldquo;Pesan relief 3D dari logo komunitas kami. Hasil kontur timbulnya presisi mikro dan teksturnya terasa mewah saat disentuh.&rdquo;
              </p>
            </div>
            <div className="pt-3 border-t border-[#E8DEBC] flex items-center justify-between text-xs">
              <div>
                <div className="font-extrabold text-[#FAF0CA]">Rian Hidayat</div>
                <div className="text-[11px] text-[#8FAEC7]">Mode Sonnet Build</div>
              </div>
              <span className="clay-pill px-2.5 py-0.5 text-[10px] font-bold text-[#F4D35E]">Terverifikasi</span>
            </div>
          </div>
        </div>
      </section>

      {/* 8. INTERACTIVE FAQ ACCORDION */}
      <section className="w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
        <FaqAccordion />
      </section>

      {/* 9. FINAL SOFT CLAY CTA BANNER */}
      <section className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="clay-card p-8 sm:p-12 relative overflow-hidden bg-gradient-to-br from-[#FFFDF8] via-white to-[#FAF0CA] flex flex-col items-center text-center">
          <div className="clay-pill inline-flex items-center gap-2 px-4 py-1.5 text-xs font-mono font-bold text-[#F95738] mb-4">
            <Sparkles className="w-4 h-4" />
            <span>MULAI DESAIN MODULAR HARI INI</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#FAF0CA] tracking-tight max-w-2xl leading-tight">
            Siap Hadirkan Karya Seni Unik di Atas Keyboard Anda?
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#BACAD6] max-w-xl leading-relaxed">
            Mulai dari satu tombol artisan hingga cluster gaming WASD. Nikmati garansi 100% pas dan pembayaran instan via QRIS.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 w-full sm:w-auto">
            <Link
              href="/keyboards"
              className="clay-btn-primary w-full sm:w-auto px-8 py-4 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Mulai Buat Desain Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/estimator"
              className="clay-btn-secondary w-full sm:w-auto px-6 py-4 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Kalkulasi Biaya Cepat</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
