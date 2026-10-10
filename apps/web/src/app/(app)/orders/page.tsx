import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { OrderService } from '@/server/services/order.service';

export const metadata = {
  title: 'Riwayat Pesanan — Keycap Platform',
};

const STATUS_BADGES: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Draft', color: 'bg-zinc-800 text-zinc-400 border-zinc-700' },
  AWAITING_PAYMENT: { label: 'Menunggu Pembayaran', color: 'bg-amber-950/40 text-amber-300 border-amber-500/40' },
  PAID: { label: 'Dibayar', color: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40' },
  QUEUED: { label: 'Antrean Cetak 3D', color: 'bg-blue-950/40 text-blue-300 border-blue-500/40' },
  PRINTING: { label: 'Sedang Dicetak 3D', color: 'bg-purple-950/40 text-purple-300 border-purple-500/40' },
  POST_PROCESSING: { label: 'Finishing & Pembersihan', color: 'bg-indigo-950/40 text-indigo-300 border-indigo-500/40' },
  QC: { label: 'Quality Control', color: 'bg-cyan-950/40 text-cyan-300 border-cyan-500/40' },
  PACKED: { label: 'Siap Dikirim', color: 'bg-teal-950/40 text-teal-300 border-teal-500/40' },
  SHIPPED: { label: 'Dalam Pengiriman', color: 'bg-sky-950/40 text-sky-300 border-sky-500/40' },
  DELIVERED: { label: 'Terkirim', color: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40' },
  CANCELLED: { label: 'Dibatalkan', color: 'bg-zinc-800 text-zinc-500 border-zinc-700' },
  EXPIRED: { label: 'Kadaluarsa', color: 'bg-red-950/40 text-red-400 border-red-500/40' },
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/orders');
  }

  const orders = await OrderService.getUserOrders(session.user.id);

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Pesanan Saya</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Pantau status produksi 3D print dan pengiriman keycap custom Anda.
            </p>
          </div>

          <Link
            href="/design"
            className="inline-flex items-center justify-center rounded-2xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-600/30 hover:bg-violet-500 transition"
          >
            + Buat Desain Baru
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-12 text-center backdrop-blur-sm">
            <div className="text-4xl mb-3">📦</div>
            <h3 className="text-lg font-bold text-white">Belum Ada Pesanan</h3>
            <p className="mt-2 text-sm text-zinc-400 max-w-sm mx-auto">
              Anda belum memiliki pesanan aktif. Mulai rancang keycap custom Anda di AI Design Studio!
            </p>
            <div className="mt-6">
              <Link
                href="/design"
                className="rounded-xl bg-violet-600 px-6 py-3 text-xs font-bold text-white shadow-lg hover:bg-violet-500 transition"
              >
                Buka AI Studio →
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const badge = STATUS_BADGES[order.status] ?? {
                label: order.status,
                color: 'bg-zinc-800 text-zinc-300 border-zinc-700',
              };

              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md transition hover:border-zinc-700 hover:bg-zinc-900/70"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-zinc-300">
                          #{order.id.slice(-8).toUpperCase()}
                        </span>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-zinc-400">
                        Dipesan pada {new Date(order.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })} • {order.items.length} jenis tombol
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[11px] text-zinc-500 block">Total</span>
                        <span className="text-base font-bold text-emerald-400 font-mono">
                          Rp {order.totalIdr.toLocaleString('id-ID')}
                        </span>
                      </div>

                      {order.status === 'AWAITING_PAYMENT' ? (
                        <Link
                          href={`/checkout/pay?orderId=${order.id}`}
                          className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-500 shadow-md transition"
                        >
                          Bayar QRIS →
                        </Link>
                      ) : (
                        <Link
                          href={`/orders/${order.id}`}
                          className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition"
                        >
                          Lihat Detail →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
