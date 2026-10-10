import crypto from 'crypto';
import type {
  PaymentProvider,
  CreateQrisInput,
  QrisResult,
  VerifiedWebhookResult,
} from './provider';

export class MidtransAdapter implements PaymentProvider {
  readonly name = 'midtrans' as const;

  constructor(
    private serverKey: string,
    private isProduction: boolean = false,
  ) {}

  private get baseUrl(): string {
    return this.isProduction
      ? 'https://api.midtrans.com'
      : 'https://api.sandbox.midtrans.com';
  }

  async createQris(input: CreateQrisInput): Promise<QrisResult> {
    if (this.serverKey.includes('test') || this.serverKey.startsWith('mid_')) {
      const mockRef = `mid_${input.orderId}_${Date.now()}`;
      const mockQr = `00020101021226610014ID.LINKAJA.WWW01189360091100200113250215${input.orderId}520458125303360540${input.amountIdr}5802ID5914KEYCAP PLATFORM6007JAKARTA6304`;
      return {
        providerRef: mockRef,
        qrString: mockQr,
        expiresAt: input.expiresAt,
      };
    }

    const res = await fetch(`${this.baseUrl}/v2/charge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${this.serverKey}:`).toString('base64')}`,
      },
      body: JSON.stringify({
        payment_type: 'qris',
        transaction_details: {
          order_id: input.orderId,
          gross_amount: input.amountIdr,
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Midtrans charge failed (${res.status}): ${text}`);
    }

    const data: any = await res.json();
    const qrString =
      data.qr_string ||
      data.actions?.find((a: any) => a.name === 'generate-qr-code')?.url ||
      '';

    return {
      providerRef: data.transaction_id,
      qrString,
      expiresAt: input.expiresAt,
    };
  }

  verifyWebhook(
    _headers: Record<string, string | string[] | undefined>,
    rawBody: string,
  ): VerifiedWebhookResult {
    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      throw new Error('Malformed webhook body');
    }

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      transaction_id,
    } = payload;

    if (!order_id || !status_code || !gross_amount || !signature_key) {
      throw new Error('Missing required Midtrans webhook parameters');
    }

    // Compute expected signature: SHA512(order_id + status_code + gross_amount + ServerKey)
    const rawSig = `${order_id}${status_code}${gross_amount}${this.serverKey}`;
    const expectedSig = crypto.createHash('sha512').update(rawSig).digest('hex');

    const expectedBuf = Buffer.from(expectedSig);
    const actualBuf = Buffer.from(signature_key);

    if (
      expectedBuf.length !== actualBuf.length ||
      !crypto.timingSafeEqual(expectedBuf, actualBuf)
    ) {
      throw new Error('Invalid Midtrans signature key');
    }

    let status: 'PAID' | 'EXPIRED' | 'FAILED' = 'FAILED';
    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      status = 'PAID';
    } else if (transaction_status === 'expire') {
      status = 'EXPIRED';
    }

    const amountIdr = Math.round(parseFloat(gross_amount));

    return {
      eventId: payload.id || `mid_evt_${transaction_id || Date.now()}`,
      orderId: order_id,
      providerRef: transaction_id || order_id,
      status,
      amountIdr,
      paidAt: payload.settlement_time ? new Date(payload.settlement_time) : new Date(),
      rawPayload: payload,
    };
  }

  async getStatus(providerRef: string): Promise<'PENDING' | 'PAID' | 'EXPIRED' | 'FAILED'> {
    if (this.serverKey.includes('test')) {
      return 'PENDING';
    }

    const res = await fetch(`${this.baseUrl}/v2/${providerRef}/status`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${this.serverKey}:`).toString('base64')}`,
      },
    });

    if (!res.ok) throw new Error(`Midtrans status check error: ${res.statusText}`);
    const data: any = await res.json();
    const st = data.transaction_status;

    if (st === 'settlement' || st === 'capture') return 'PAID';
    if (st === 'expire') return 'EXPIRED';
    if (st === 'cancel' || st === 'deny') return 'FAILED';
    return 'PENDING';
  }
}
