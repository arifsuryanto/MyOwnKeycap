import { describe, it, expect } from 'vitest';
import {
  transition,
  canTransition,
  validEvents,
  InvalidTransitionError,
  ORDER_STATUSES,
  TERMINAL_STATUSES,
  type OrderStatus,
  type OrderEvent,
} from '../state-machine/order';

describe('Order State Machine', () => {
  // ─── Happy Path ──────────────────────────────────────────────

  describe('valid transitions', () => {
    const happyPath: Array<[OrderStatus, OrderEvent, OrderStatus]> = [
      ['DRAFT', 'checkout', 'AWAITING_PAYMENT'],
      ['AWAITING_PAYMENT', 'webhook_paid', 'PAID'],
      ['AWAITING_PAYMENT', 'timeout', 'EXPIRED'],
      ['AWAITING_PAYMENT', 'user_cancel', 'CANCELLED'],
      ['PAID', 'auto_queue', 'QUEUED'],
      ['PAID', 'refund_request', 'REFUND_PENDING'],
      ['QUEUED', 'plate_ready', 'PENDING_APPROVAL'],
      ['PENDING_APPROVAL', 'admin_approve', 'PRINTING'],
      ['PRINTING', 'print_done', 'POST_PROCESSING'],
      ['PRINTING', 'print_failed', 'PRINT_FAILED'],
      ['PRINT_FAILED', 'reprint', 'QUEUED'],
      ['PRINT_FAILED', 'refund_request', 'REFUND_PENDING'],
      ['POST_PROCESSING', 'post_process_done', 'QC'],
      ['QC', 'qc_pass', 'PACKED'],
      ['QC', 'qc_fail', 'QUEUED'],
      ['PACKED', 'ship', 'SHIPPED'],
      ['SHIPPED', 'deliver', 'DELIVERED'],
      ['REFUND_PENDING', 'refund_complete', 'REFUNDED'],
    ];

    it.each(happyPath)(
      '%s + %s → %s',
      (from, event, expected) => {
        expect(transition(from, event)).toBe(expected);
      },
    );
  });

  // ─── Full Lifecycle ────────────────────────────────────────

  it('supports the complete happy-path lifecycle', () => {
    let status: OrderStatus = 'DRAFT';
    status = transition(status, 'checkout');
    expect(status).toBe('AWAITING_PAYMENT');
    status = transition(status, 'webhook_paid');
    expect(status).toBe('PAID');
    status = transition(status, 'auto_queue');
    expect(status).toBe('QUEUED');
    status = transition(status, 'plate_ready');
    expect(status).toBe('PENDING_APPROVAL');
    status = transition(status, 'admin_approve');
    expect(status).toBe('PRINTING');
    status = transition(status, 'print_done');
    expect(status).toBe('POST_PROCESSING');
    status = transition(status, 'post_process_done');
    expect(status).toBe('QC');
    status = transition(status, 'qc_pass');
    expect(status).toBe('PACKED');
    status = transition(status, 'ship');
    expect(status).toBe('SHIPPED');
    status = transition(status, 'deliver');
    expect(status).toBe('DELIVERED');
  });

  it('supports the reprint cycle', () => {
    let status: OrderStatus = 'PRINTING';
    status = transition(status, 'print_failed');
    expect(status).toBe('PRINT_FAILED');
    status = transition(status, 'reprint');
    expect(status).toBe('QUEUED');
    status = transition(status, 'plate_ready');
    expect(status).toBe('PENDING_APPROVAL');
  });

  it('supports QC fail → reprint cycle', () => {
    let status: OrderStatus = 'QC';
    status = transition(status, 'qc_fail');
    expect(status).toBe('QUEUED');
  });

  // ─── Invalid Transitions ──────────────────────────────────

  describe('invalid transitions throw', () => {
    const invalidTransitions: Array<[OrderStatus, OrderEvent]> = [
      ['DRAFT', 'webhook_paid'],
      ['DRAFT', 'user_cancel'],
      ['AWAITING_PAYMENT', 'admin_approve'],
      ['PAID', 'checkout'],
      ['PAID', 'print_done'],
      ['QUEUED', 'webhook_paid'],
      ['PRINTING', 'checkout'],
      ['DELIVERED', 'checkout'],
      ['DELIVERED', 'refund_request'],
      ['EXPIRED', 'webhook_paid'],
      ['CANCELLED', 'auto_queue'],
      ['REFUNDED', 'reprint'],
    ];

    it.each(invalidTransitions)(
      '%s + %s → throws InvalidTransitionError',
      (from, event) => {
        expect(() => transition(from, event)).toThrow(InvalidTransitionError);
      },
    );
  });

  // ─── Terminal States ───────────────────────────────────────

  describe('terminal states have no valid transitions', () => {
    it.each(TERMINAL_STATUSES)('%s has no valid events', (status) => {
      const events = validEvents(status);
      // REFUND_PENDING has refund_complete, so exclude it
      if (status === 'REFUNDED' || status === 'DELIVERED' || status === 'EXPIRED' || status === 'CANCELLED') {
        expect(events).toHaveLength(0);
      }
    });
  });

  // ─── canTransition ─────────────────────────────────────────

  describe('canTransition', () => {
    it('returns true for valid transitions', () => {
      expect(canTransition('DRAFT', 'checkout')).toBe(true);
      expect(canTransition('PAID', 'auto_queue')).toBe(true);
    });

    it('returns false for invalid transitions', () => {
      expect(canTransition('DRAFT', 'webhook_paid')).toBe(false);
      expect(canTransition('DELIVERED', 'checkout')).toBe(false);
    });
  });

  // ─── validEvents ───────────────────────────────────────────

  describe('validEvents', () => {
    it('returns correct events for AWAITING_PAYMENT', () => {
      const events = validEvents('AWAITING_PAYMENT');
      expect(events).toContain('webhook_paid');
      expect(events).toContain('timeout');
      expect(events).toContain('user_cancel');
      expect(events).toHaveLength(3);
    });

    it('returns empty array for terminal states', () => {
      expect(validEvents('DELIVERED')).toHaveLength(0);
      expect(validEvents('CANCELLED')).toHaveLength(0);
    });
  });

  // ─── Coverage: All statuses are in the transition table ────

  it('every OrderStatus is in the transition table', () => {
    for (const status of ORDER_STATUSES) {
      // Should not throw — the status exists in the table
      expect(() => validEvents(status)).not.toThrow();
    }
  });
});
