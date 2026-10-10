export interface CreateQrisInput {
  orderId: string;
  amountIdr: number;
  expiresAt: Date;
  idempotencyKey: string;
}

export interface QrisResult {
  providerRef: string;
  qrString: string;
  expiresAt: Date;
}

export type WebhookStatus = 'PAID' | 'EXPIRED' | 'FAILED';

export interface VerifiedWebhookResult {
  eventId: string;
  orderId: string;
  providerRef: string;
  status: WebhookStatus;
  amountIdr: number;
  paidAt?: Date | undefined;
  rawPayload: any;
}

export interface PaymentProvider {
  name: 'xendit' | 'midtrans';
  createQris(input: CreateQrisInput): Promise<QrisResult>;
  verifyWebhook(
    headers: Record<string, string | string[] | undefined>,
    rawBody: string,
  ): VerifiedWebhookResult;
  getStatus(providerRef: string): Promise<'PENDING' | 'PAID' | 'EXPIRED' | 'FAILED'>;
  refund?(providerRef: string, amountIdr: number): Promise<void>;
}
