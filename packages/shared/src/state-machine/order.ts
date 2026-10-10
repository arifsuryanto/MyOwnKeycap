/**
 * Order Lifecycle State Machine
 *
 * Enforces valid state transitions as defined in Spec Section 5.7.
 * All order status changes MUST go through this function.
 * Every transition is tested (both legal and illegal).
 */

// Re-declare locally to avoid circular dependency with @keycap/db
export type OrderStatus =
  | 'DRAFT'
  | 'AWAITING_PAYMENT'
  | 'PAID'
  | 'QUEUED'
  | 'PENDING_APPROVAL'
  | 'PRINTING'
  | 'PRINT_FAILED'
  | 'POST_PROCESSING'
  | 'QC'
  | 'PACKED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'REFUND_PENDING'
  | 'REFUNDED';

export type OrderEvent =
  | 'checkout'
  | 'webhook_paid'
  | 'timeout'
  | 'user_cancel'
  | 'auto_queue'
  | 'plate_ready'
  | 'admin_approve'
  | 'print_done'
  | 'print_failed'
  | 'reprint'
  | 'post_process_done'
  | 'qc_pass'
  | 'qc_fail'
  | 'ship'
  | 'deliver'
  | 'refund_request'
  | 'refund_complete';

/**
 * Transition table — maps current status + event → next status.
 * Only listed transitions are valid; everything else throws.
 */
const TRANSITIONS: Record<OrderStatus, Partial<Record<OrderEvent, OrderStatus>>> = {
  DRAFT: {
    checkout: 'AWAITING_PAYMENT',
  },
  AWAITING_PAYMENT: {
    webhook_paid: 'PAID',
    timeout: 'EXPIRED',
    user_cancel: 'CANCELLED',
  },
  PAID: {
    auto_queue: 'QUEUED',
    refund_request: 'REFUND_PENDING',
  },
  QUEUED: {
    plate_ready: 'PENDING_APPROVAL',
  },
  PENDING_APPROVAL: {
    admin_approve: 'PRINTING',
  },
  PRINTING: {
    print_done: 'POST_PROCESSING',
    print_failed: 'PRINT_FAILED',
  },
  PRINT_FAILED: {
    reprint: 'QUEUED',
    refund_request: 'REFUND_PENDING',
  },
  POST_PROCESSING: {
    post_process_done: 'QC',
  },
  QC: {
    qc_pass: 'PACKED',
    qc_fail: 'QUEUED',
  },
  PACKED: {
    ship: 'SHIPPED',
  },
  SHIPPED: {
    deliver: 'DELIVERED',
  },
  // Terminal states — no transitions out
  DELIVERED: {},
  EXPIRED: {},
  CANCELLED: {},
  REFUND_PENDING: {
    refund_complete: 'REFUNDED',
  },
  REFUNDED: {},
};

/** All valid order statuses */
export const ORDER_STATUSES: readonly OrderStatus[] = Object.keys(TRANSITIONS) as OrderStatus[];

/** Statuses that are considered terminal (no further transitions) */
export const TERMINAL_STATUSES: readonly OrderStatus[] = [
  'DELIVERED',
  'EXPIRED',
  'CANCELLED',
  'REFUNDED',
];

/** Statuses where the order can be cancelled by the user */
export const USER_CANCELLABLE: readonly OrderStatus[] = ['AWAITING_PAYMENT'];

/** Statuses where the order is considered "active" (in progress) */
export const ACTIVE_STATUSES: readonly OrderStatus[] = [
  'PAID',
  'QUEUED',
  'PENDING_APPROVAL',
  'PRINTING',
  'PRINT_FAILED',
  'POST_PROCESSING',
  'QC',
  'PACKED',
  'SHIPPED',
];

export class InvalidTransitionError extends Error {
  constructor(
    public readonly currentStatus: OrderStatus,
    public readonly event: OrderEvent,
  ) {
    super(`Invalid order transition: ${currentStatus} + ${event}`);
    this.name = 'InvalidTransitionError';
  }
}

/**
 * Compute the next order status given the current status and an event.
 * Throws `InvalidTransitionError` if the transition is not allowed.
 * This is idempotent: calling with an event that would result in the same status is safe.
 */
export function transition(currentStatus: OrderStatus, event: OrderEvent): OrderStatus {
  const allowed = TRANSITIONS[currentStatus];
  if (!allowed) {
    throw new InvalidTransitionError(currentStatus, event);
  }
  const next = allowed[event];
  if (!next) {
    throw new InvalidTransitionError(currentStatus, event);
  }
  return next;
}

/**
 * Check if a transition is valid without throwing.
 */
export function canTransition(currentStatus: OrderStatus, event: OrderEvent): boolean {
  return TRANSITIONS[currentStatus]?.[event] !== undefined;
}

/**
 * Get all valid events for a given status.
 */
export function validEvents(currentStatus: OrderStatus): OrderEvent[] {
  const allowed = TRANSITIONS[currentStatus];
  if (!allowed) return [];
  return Object.keys(allowed) as OrderEvent[];
}
