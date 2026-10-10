'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CheckoutFormProps {
  designId?: string;
  designName?: string;
  keyboardModelName?: string;
  keyCount?: number;
  initialEstimateIdr?: number;
}

export default function CheckoutForm({
  designId,
  designName = 'Custom Keycap Set',
  keyboardModelName = 'Standard Keyboard',
  keyCount = 68,
  initialEstimateIdr = 280000,
}: CheckoutFormProps) {
  const router = useRouter();

  const [bundle, setBundle] = useState<'FULL_SET' | 'ACCENT' | 'SAMPLER'>('FULL_SET');
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Approximate bundle calculations
  const discountRate = bundle === 'FULL_SET' ? 0.2 : bundle === 'ACCENT' ? 0.1 : 0;
  const subtotal = initialEstimateIdr;
  const discount = Math.floor(subtotal * discountRate);
  const shipping = 18000;
  const total = subtotal - discount + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim() || !phone.trim() || !address.trim() || !city.trim()) {
      setError('Mohon lengkapi semua data alamat pengiriman.');
      return;
    }

    if (!designId) {
      setError('Design ID tidak ditemukan. Silakan rancang desain terlebih dahulu di AI Studio.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designId,
          bundleId: null, // Default calculation
          shippingCost: shipping,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal membuat pesanan');
      }

      const orderId = data.data.id;
      router.push(`/checkout/pay?orderId=${orderId}`);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Delivery Address & Bundle Type */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        {/* Bundle Selection */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-md">
          <h2 className="text-lg font-bold text-white mb-4">Pilihan Paket Keycap</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setBundle('FULL_SET')}
              className={`rounded-2xl border p-4 text-left transition ${
                bundle === 'FULL_SET'
                  ? 'border-violet-500 bg-violet-950/40 text-white shadow-lg shadow-violet-500/10'
                  : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">Full Set</span>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  Hemat 20%
                </span>
              </div>
              <p className="mt-2 text-xs text-zinc-400">Semua tombol ({keyCount} keys) lengkap untuk keyboard Anda.</p>
            </button>

            <button
              type="button"
              onClick={() => setBundle('ACCENT')}
              className={`rounded-2xl border p-4 text-left transition ${
                bundle === 'ACCENT'
                  ? 'border-violet-500 bg-violet-950/40 text-white shadow-lg shadow-violet-500/10'
                  : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">Accent Pack</span>
                <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-bold text-violet-300">
                  Hemat 10%
                </span>
              </div>
              <p className="mt-2 text-xs text-zinc-400">Tombol aksen utama (Esc, Enter, Space, Arrows, Modifiers).</p>
            </button>

            <button
              type="button"
              onClick={() => setBundle('SAMPLER')}
              className={`rounded-2xl border p-4 text-left transition ${
                bundle === 'SAMPLER'
                  ? 'border-violet-500 bg-violet-950/40 text-white shadow-lg shadow-violet-500/10'
                  : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <span className="text-sm font-bold text-white">Sampler (4 Keys)</span>
              <p className="mt-2 text-xs text-zinc-400">4 tombol tester untuk mencoba profil dan fit stem.</p>
            </button>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-md">
          <h2 className="text-lg font-bold text-white mb-4">Alamat Pengiriman (Indonesia)</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Nama Penerima</label>
              <input
                type="text"
                required
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Contoh: Arif Suryanto"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 shadow-inner focus:border-violet-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Nomor WhatsApp / HP</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0812xxxxxxxx"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 shadow-inner focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Alamat Lengkap</label>
            <textarea
              rows={3}
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan..."
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3.5 text-sm text-zinc-100 shadow-inner focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Kota / Kabupaten</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Contoh: Jakarta Selatan"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 shadow-inner focus:border-violet-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Kode Pos</label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="12345"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 shadow-inner focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Order Summary & Checkout Action */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-md sticky top-6 shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-4">Ringkasan Pesanan</h2>

          {/* Item Info */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 mb-6">
            <h3 className="text-sm font-bold text-white">{designName}</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Keyboard: {keyboardModelName} • {keyCount} Keys
            </p>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-emerald-400">
              <span>✓</span>
              <span>Fit-Guaranteed (Presisi stem &amp; profil dijamin)</span>
            </div>
          </div>

          {/* Cost breakdown */}
          <div className="space-y-3 text-sm text-zinc-300 border-b border-zinc-800 pb-4 mb-4">
            <div className="flex justify-between">
              <span>Subtotal Biaya Produksi</span>
              <span className="font-mono">Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Diskon Paket Bundle</span>
                <span className="font-mono">-Rp {discount.toLocaleString('id-ID')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Ongkos Kirim (Reguler)</span>
              <span className="font-mono">Rp {shipping.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between text-lg font-bold text-white mb-6">
            <span>Total Pembayaran</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">
              Rp {total.toLocaleString('id-ID')}
            </span>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/40 bg-red-950/30 p-3 text-xs text-red-300">
              ⚠️ {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-4 text-sm font-bold text-white shadow-xl shadow-violet-600/30 transition hover:shadow-violet-600/50 hover:brightness-110 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Memproses Pesanan...' : 'Lanjut ke Pembayaran QRIS →'}
          </button>

          <p className="mt-4 text-center text-[11px] text-zinc-500">
            Pembayaran menggunakan QRIS dinamis resmi. Langsung diverifikasi secara otomatis.
          </p>
        </div>
      </div>
    </form>
  );
}
