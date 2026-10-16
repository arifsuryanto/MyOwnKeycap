import { prisma } from '@keycap/db';
import { OrdersAdminClient } from './orders-admin-client';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
      design: {
        include: { keyboardModel: true },
      },
      address: true,
      printJobs: {
        orderBy: { attempt: 'desc' },
        take: 1,
      },
      events: {
        orderBy: { createdAt: 'desc' },
        take: 3,
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
          Order Operations & QC Pipeline
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Kelola inspeksi QC, packaging, cetak label resi (Biteship), dan konfirmasi pengiriman pesanan.
        </p>
      </div>

      <OrdersAdminClient initialOrders={orders} />
    </div>
  );
}
