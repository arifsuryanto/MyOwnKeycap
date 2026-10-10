import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { OrderService } from '@/server/services/order.service';
import QrisPaymentView from '@/components/checkout/QrisPaymentView';

interface PayPageProps {
  searchParams: Promise<{
    orderId?: string;
  }>;
}

export const metadata = {
  title: 'Pembayaran QRIS — Keycap Platform',
};

export default async function PayPage({ searchParams }: PayPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/checkout/pay');
  }

  const { orderId } = await searchParams;
  if (!orderId) {
    redirect('/orders');
  }

  const order = await OrderService.getOrder(orderId, session.user.id);
  if (!order) {
    notFound();
  }

  // Get or trigger checkout to ensure Payment record with QR exists
  let payment = order.payments[0];
  if (!payment || !payment.qrString) {
    const result = await OrderService.checkoutOrder(order.id, session.user.id);
    payment = result.payment;
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-12 sm:px-6 lg:px-8">
      <QrisPaymentView
        orderId={order.id}
        amountIdr={order.totalIdr}
        qrString={payment.qrString ?? ''}
        expiresAt={payment.expiresAt ? payment.expiresAt.toISOString() : new Date(Date.now() + 1800000).toISOString()}
      />
    </div>
  );
}
