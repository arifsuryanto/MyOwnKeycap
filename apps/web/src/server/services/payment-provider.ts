import { PaymentProvider, XenditAdapter, MidtransAdapter } from '@keycap/payments';
import { env } from '@/lib/env';

export function getPaymentProvider(): PaymentProvider {
  if (env.PAYMENT_PROVIDER === 'midtrans') {
    return new MidtransAdapter(env.PAYMENT_API_KEY, process.env.NODE_ENV === 'production');
  }

  return new XenditAdapter(env.PAYMENT_API_KEY, env.PAYMENT_WEBHOOK_TOKEN);
}
