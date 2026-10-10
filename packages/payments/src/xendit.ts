import crypto from 'crypto';
import type {
  PaymentProvider,
  CreateQrisInput,
  QrisResult,
  VerifiedWebhookResult,
} from './provider';

export class XenditAdapter implements PaymentProvider {
  readonly name = 'xendit' as const;

  constructor(
    private apiKey: string,
    private webhookToken: string,
  ) {}

  async createQris(input: CreateQrisInput): Promise<QrisResult> {
    // In live integration, this calls Xendit PaymentRequest API:
    // POST https://api.xendit.co/payment_requests
    // For local dev/sandbox when API key starts with dummy prefix or during offline testing:
    if (this.apiKey.startsWith('xnd_development_your_key') || this.apiKey.includes('test') || this.apiKey.includes('mock')) {
      const mockRef = `xnd_req_${input.orderId}_${Date.now()}`;
      // Standard EMVCo QRIS compliant mock test string
      const mockQr = `00020101021226610014ID.LINKAJA.WWW01189360091100200113250215${input.orderId}520458125303360540${input.amountIdr}5802ID5914KEYCAP PLATFORM6007JAKARTA6304`;
      return {
        providerRef: mockRef,
        qrString: mockQr,
        expiresAt: input.expiresAt,
      };
    }

    const res = await fetch('https://api.xendit.co/payment_requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${this.apiKey}:`).toString('base64')}`,
        'api-version': '2022-09-05',
      },
      body: JSON.stringify({
        reference_id: input.orderId,
        currency: 'IDR',
        amount: input.amountIdr,
        payment_method: {
          type: 'QR_CODE',
          reusability: 'ONE_TIME_USE',
          qr_code: {
            channel_code: 'DYNAMIC',
          },
        },
        metadata: {
          orderId: input.orderId,
        },
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Xendit create QRIS failed (${res.status}): ${errBody}`);
    }

    const data: any = await res.json();
    const qrString =
      data.payment_method?.qr_code?.channel_properties?.qr_string ||
      data.actions?.find((a: any) => a.action === 'QR_STRING')?.url ||
      '';

    return {
      providerRef: data.id,
      qrString,
      expiresAt: input.expiresAt,
    };
  }

  verifyWebhook(
    headers: Record<string, string | string[] | undefined>,
    rawBody: string,
  ): VerifiedWebhookResult {
    // 1. Verify callback token header using timingSafeEqual
    const incomingToken =
      (headers['x-callback-token'] as string) ||
      (headers['X-CALLBACK-TOKEN'] as string) ||
      '';

    const expected = Buffer.from(this.webhookToken);
    const actual = Buffer.from(incomingToken);

    if (
      expected.length !== actual.length ||
      !crypto.timingSafeEqual(expected, actual)
    ) {
      throw new Error('Invalid Xendit webhook signature / callback token');
    }

    // 2. Parse body
    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      throw new Error('Malformed webhook body');
    }

    const event = payload.event;
    const data = payload.data || payload;

    const eventId = payload.id || `xnd_evt_${data.id || Date.now()}`;
    const orderId = data.reference_id || data.metadata?.orderId;
    if (!orderId) {
      throw new Error('Missing reference_id in Xendit webhook payload');
    }

    const statusStr = (data.status || '').toUpperCase();
    let status: 'PAID' | 'EXPIRED' | 'FAILED' = 'FAILED';

    if (statusStr === 'SUCCEEDED' || statusStr === 'COMPLETED' || event === 'payment.succeeded') {
      status = 'PAID';
    } else if (statusStr === 'EXPIRED' || event === 'payment.expired') {
      status = 'EXPIRED';
    }

    const amountIdr = Math.round(Number(data.amount || data.capture_amount || 0));

    return {
      eventId,
      orderId,
      providerRef: data.id || eventId,
      status,
      amountIdr,
      paidAt: data.created ? new Date(data.created) : new Date(),
      rawPayload: payload,
    };
  }

  async getStatus(providerRef: string): Promise<'PENDING' | 'PAID' | 'EXPIRED' | 'FAILED'> {
    if (this.apiKey.startsWith('xnd_development_your_key') || this.apiKey.includes('test')) {
      return 'PENDING';
    }

    const res = await fetch(`https://api.xendit.co/payment_requests/${providerRef}`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${this.apiKey}:`).toString('base64')}`,
      },
    });

    if (!res.ok) throw new Error(`Xendit check status error: ${res.statusText}`);
    const data: any = await res.json();
    const s = (data.status || '').toUpperCase();

    if (s === 'SUCCEEDED' || s === 'COMPLETED') return 'PAID';
    if (s === 'EXPIRED') return 'EXPIRED';
    if (s === 'FAILED') return 'FAILED';
    return 'PENDING';
  }
}
