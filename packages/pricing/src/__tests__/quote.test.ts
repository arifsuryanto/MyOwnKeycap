import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { calculateQuote, ceilTo, type PricingConfig, type QuoteInput } from '../quote';

const baseConfig: PricingConfig = {
  version: 1,
  filamentCostPerGram: 350, // 350 IDR/g
  machineRatePerHour: 8000,
  laborRatePerHour: 25000,
  postProcessMinutes: 3,
  packagingPerKey: 500,
  packagingBase: 5000,
  failureRate: 0.15,
  targetMargin: 0.4,
  roundTo: 1000,
};

describe('Pricing Engine - Unit Calculations', () => {
  it('correctly rounds up to the nearest roundTo step', () => {
    expect(ceilTo(23001, 1000)).toBe(24000);
    expect(ceilTo(23000, 1000)).toBe(23000);
    expect(ceilTo(23999, 1000)).toBe(24000);
    expect(ceilTo(0, 1000)).toBe(0);
  });

  it('calculates expected quote for a single keycap', () => {
    const input: QuoteInput = {
      items: [
        {
          keyId: 'esc-1',
          qty: 1,
          gramsWithSupport: 4.0, // ~4g PETG
          printMinutes: 25,
        },
      ],
      shippingCost: 15000,
    };

    const quote = calculateQuote(input, baseConfig, new Date('2026-10-10T00:00:00Z'));
    expect(quote.items).toHaveLength(1);
    const item = quote.items[0]!;
    expect(item.materialCost).toBe(1400); // 4 * 350
    expect(item.directCost).toBeGreaterThan(item.materialCost);
    expect(item.listPrice % 1000).toBe(0);
    expect(quote.shipping).toBe(15000);
    expect(quote.total).toBe(quote.subtotal + 15000);
    expect(Number.isInteger(quote.total)).toBe(true);
  });

  it('applies bundle discount properly', () => {
    const input: QuoteInput = {
      items: [
        {
          keyId: 'space-1',
          qty: 1,
          gramsWithSupport: 12.0,
          printMinutes: 60,
        },
      ],
      bundleType: 'ACCENT',
    };

    const quote = calculateQuote(input, baseConfig);
    expect(quote.bundleDiscount).toBe(Math.floor(quote.subtotal * 0.1));
    expect(quote.total).toBe(quote.subtotal - quote.bundleDiscount);
  });
});

describe('Pricing Engine - Property-based Tests', () => {
  it('guarantees all IDR values are strictly integers', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        fc.float({ min: 1.0, max: 50.0, noNaN: true }),
        fc.float({ min: 5.0, max: 180.0, noNaN: true }),
        (qty, grams, printMinutes) => {
          const input: QuoteInput = {
            items: [{ keyId: 'k', qty, gramsWithSupport: grams, printMinutes }],
          };
          const quote = calculateQuote(input, baseConfig);

          expect(Number.isInteger(quote.subtotal)).toBe(true);
          expect(Number.isInteger(quote.bundleDiscount)).toBe(true);
          expect(Number.isInteger(quote.shipping)).toBe(true);
          expect(Number.isInteger(quote.total)).toBe(true);
          expect(Number.isInteger(quote.items[0]!.listPrice)).toBe(true);
          expect(Number.isInteger(quote.items[0]!.costPerKey)).toBe(true);
        },
      ),
    );
  });

  it('guarantees listPrice always satisfies roundTo multiple', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0.5, max: 30.0, noNaN: true }),
        fc.float({ min: 5.0, max: 120.0, noNaN: true }),
        (grams, printMinutes) => {
          const input: QuoteInput = {
            items: [{ keyId: 'k', qty: 1, gramsWithSupport: grams, printMinutes }],
          };
          const quote = calculateQuote(input, baseConfig);
          expect(quote.items[0]!.listPrice % baseConfig.roundTo).toBe(0);
        },
      ),
    );
  });

  it('guarantees listPrice is always greater than or equal to costPerKey', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 1.0, max: 50.0, noNaN: true }),
        fc.float({ min: 5.0, max: 180.0, noNaN: true }),
        (grams, printMinutes) => {
          const input: QuoteInput = {
            items: [{ keyId: 'k', qty: 1, gramsWithSupport: grams, printMinutes }],
          };
          const quote = calculateQuote(input, baseConfig);
          expect(quote.items[0]!.listPrice).toBeGreaterThanOrEqual(quote.items[0]!.costPerKey);
        },
      ),
    );
  });

  it('guarantees total monotonically increases with quantity', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        fc.integer({ min: 1, max: 20 }),
        (qtyA, qtyB) => {
          const lower = Math.min(qtyA, qtyB);
          const higher = Math.max(qtyA, qtyB);

          const quoteLow = calculateQuote(
            { items: [{ keyId: 'k', qty: lower, gramsWithSupport: 5.0, printMinutes: 30 }] },
            baseConfig,
          );
          const quoteHigh = calculateQuote(
            { items: [{ keyId: 'k', qty: higher, gramsWithSupport: 5.0, printMinutes: 30 }] },
            baseConfig,
          );

          expect(quoteHigh.subtotal).toBeGreaterThanOrEqual(quoteLow.subtotal);
        },
      ),
    );
  });
});
