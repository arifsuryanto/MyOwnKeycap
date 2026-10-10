import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { XenditAdapter } from '../xendit';
import { MidtransAdapter } from '../midtrans';

describe('Payment Provider - Xendit Webhook Verification', () => {
  const secretToken = 'xendit_webhook_token_secret_123456';
  const adapter = new XenditAdapter('xnd_test_api_key', secretToken);

  it('successfully verifies authentic Xendit payment.succeeded webhook', () => {
    const rawBody = JSON.stringify({
      id: 'evt_12345',
      event: 'payment.succeeded',
      data: {
        id: 'pr_9876',
        reference_id: 'order_abc123',
        status: 'SUCCEEDED',
        amount: 154000,
        created: '2026-10-10T04:00:00.000Z',
      },
    });

    const headers = {
      'x-callback-token': secretToken,
    };

    const result = adapter.verifyWebhook(headers, rawBody);
    expect(result.orderId).toBe('order_abc123');
    expect(result.status).toBe('PAID');
    expect(result.amountIdr).toBe(154000);
    expect(result.providerRef).toBe('pr_9876');
  });

  it('rejects webhook with invalid or tampered callback token', () => {
    const rawBody = JSON.stringify({
      id: 'evt_12345',
      event: 'payment.succeeded',
      data: { reference_id: 'order_abc123' },
    });

    const headers = {
      'x-callback-token': 'wrong_invalid_token_1234567890',
    };

    expect(() => adapter.verifyWebhook(headers, rawBody)).toThrow(
      'Invalid Xendit webhook signature / callback token',
    );
  });
});

describe('Payment Provider - Midtrans Webhook Verification', () => {
  const serverKey = 'midtrans_server_key_super_secret_456';
  const adapter = new MidtransAdapter(serverKey);

  it('successfully verifies authentic Midtrans settlement notification', () => {
    const orderId = 'order_xyz789';
    const statusCode = '200';
    const grossAmount = '245000.00';

    // Signature formula: SHA512(order_id + status_code + gross_amount + ServerKey)
    const rawSig = `${orderId}${statusCode}${grossAmount}${serverKey}`;
    const signatureKey = crypto.createHash('sha512').update(rawSig).digest('hex');

    const rawBody = JSON.stringify({
      order_id: orderId,
      status_code: statusCode,
      gross_amount: grossAmount,
      signature_key: signatureKey,
      transaction_status: 'settlement',
      transaction_id: 'mid_tx_554433',
    });

    const result = adapter.verifyWebhook({}, rawBody);
    expect(result.orderId).toBe(orderId);
    expect(result.status).toBe('PAID');
    expect(result.amountIdr).toBe(245000);
    expect(result.providerRef).toBe('mid_tx_554433');
  });

  it('rejects Midtrans webhook if gross_amount is tampered', () => {
    const orderId = 'order_xyz789';
    const statusCode = '200';
    const grossAmountOriginal = '245000.00';

    const rawSig = `${orderId}${statusCode}${grossAmountOriginal}${serverKey}`;
    const signatureKey = crypto.createHash('sha512').update(rawSig).digest('hex');

    // Attacker modifies gross_amount in body to 1.00
    const tamperedBody = JSON.stringify({
      order_id: orderId,
      status_code: statusCode,
      gross_amount: '1.00',
      signature_key: signatureKey,
      transaction_status: 'settlement',
      transaction_id: 'mid_tx_554433',
    });

    expect(() => adapter.verifyWebhook({}, tamperedBody)).toThrow(
      'Invalid Midtrans signature key',
    );
  });
});
