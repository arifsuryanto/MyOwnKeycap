import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { OrderService } from '@/server/services/order.service';

interface OrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata = {
  title: 'Detail Pesanan & Tracking — Keycap Platform',
};

const STAGES = [
  { key: 'PAID', label: 'Pembayaran Diterima' },
  { key: 'QUEUED', label: 'Antrean Cetak' },
  { key: 'PRINTING', label: 'Proses 3D Print' },
  { key: 'QC', label: 'Finishing & QC' },
  { key: 'SHIPPED', label: 'Pengiriman Kurir' },
  { key: 'DELIVERED', label: 'Selesai / Terkirim' },
];

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const { id } = await params;
  const order = await OrderService.getOrder(id, session.user.id);

  if (!order) {
    notFound();
  }

  // Determine current active stage index
  const stageStatusOrder = ['PAID', 'QUEUED', 'PRINTING', 'QC', 'SHIPPED', 'DELIVERED'];
  let currentStageIndex = 0;
  if (order.status === 'POST_PROCESSING' || order.status === 'QC') {
    currentStageIndex = 3;
  } else if (order.status === 'PACKED' || order.status === 'SHIPPED') {
    currentStageIndex = 4;
  } else if (order.status === 'DELIVERED') {
    currentStageIndex = 5;
  } else {
    currentStageIndex = Math.max(0, stageStatusOrder.indexOf(order.status));
  }

  const latestPayment = order.payments[0];

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs text-zinc-400">
          <Link href="/orders" className="hover:text-zinc-200 transition">
            ← Kembali ke Daftar Pesanan
          </Link>
        </div>

        {/* Header */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 backdrop-blur-md mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">
                Detail Pesanan
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
                #{order.id.slice(-8).toUpperCase()}
              </h1>
              <p className="mt-1 text-xs text-zinc-400">
                Tanggal: {new Date(order.createdAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-zinc-500 block">Total Transaksi</span>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                Rp {order.totalIdr.toLocaleString('id-ID')}
              </div>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="mt-10 border-t border-zinc-800/80 pt-8">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-6">
              Status Produksi &amp; Logistik
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
              {STAGES.map((stg, idx) => {
                const isPassed = idx < currentStageIndex;
                const isCurrent = idx === currentStageIndex;

                return (
                  <div key={stg.key} className="flex flex-col items-center text-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-xs font-bold transition ${
                        isPassed
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                          : isCurrent
                            ? 'border-violet-500 bg-violet-500/20 text-violet-300 ring-4 ring-violet-500/20 animate-pulse'
                            : 'border-zinc-800 bg-zinc-900 text-zinc-600'
                      }`}
                    >
                      {isPassed ? '✓' : idx + 1}
                    </div>
                    <span
                      className={`mt-2 text-[11px] font-medium ${
                        isCurrent
                          ? 'text-white font-bold'
                          : isPassed
                            ? 'text-zinc-300'
                            : 'text-zinc-600'
                      }`}
                    >
                      {stg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Item List & Payment Info */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-8">
          {/* Items (7 cols) */}
          <div className="sm:col-span-7 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-md">
            <h2 className="text-base font-bold text-white mb-4">
              Item Keycap ({order.items.length} jenis)
            </h2>

            <div className="divide-y divide-zinc-800/60">
              {order.items.map((item, idx) => (
                <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-zinc-200 block">
                      Tombol #{idx + 1}
                    </span>
                    <span className="text-zinc-500 text-[11px]">
                      Est. berat: {item.asset.estGrams}g • Est. waktu: {item.asset.printMinutes} min
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-zinc-300 font-semibold">
                      Rp {(item.unitPriceIdr * item.qty).toLocaleString('id-ID')}
                    </span>
                    <span className="text-zinc-500 text-[10px] block">
                      {item.qty} pcs
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-zinc-800 mt-4 pt-4 space-y-1.5 text-xs text-zinc-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono text-zinc-200">Rp {order.subtotalIdr.toLocaleString('id-ID')}</span>
              </div>
              {order.discountIdr > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Diskon Bundle</span>
                  <span className="font-mono">-Rp {order.discountIdr.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Ongkos Kirim</span>
                <span className="font-mono text-zinc-200">Rp {order.shippingIdr.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* Payment & Logistics details (5 cols) */}
          <div className="sm:col-span-5 flex flex-col gap-6">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-md">
              <h2 className="text-base font-bold text-white mb-4">Detail Pembayaran</h2>
              {latestPayment ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Metode</span>
                    <span className="font-bold text-white">QRIS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Provider</span>
                    <span className="text-zinc-200 uppercase">{latestPayment.provider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Status</span>
                    <span className="text-emerald-400 font-bold">{latestPayment.status}</span>
                  </div>
                  {latestPayment.paidAt && (
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Waktu Bayar</span>
                      <span className="text-zinc-300">
                        {new Date(latestPayment.paidAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-zinc-500">Belum ada catatan pembayaran.</p>
              )}
            </div>

            {/* Estimated Completion Card */}
            {order.estimatedReadyAt && (
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-md">
                <div className="text-2xl mb-2">⏱️</div>
                <h3 className="text-sm font-bold text-white">Estimasi Selesai Produksi</h3>
                <p className="mt-1 text-xs text-zinc-400">
                  {new Date(order.estimatedReadyAt).toLocaleDateString('id-ID', { dateStyle: 'full' })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
