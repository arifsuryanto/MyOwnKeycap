import { z } from 'zod';

export const PricingConfigSchema = z.object({
  version: z.number().int().min(1),
  filamentCostPerGram: z.number().int().min(1), // e.g. 350 IDR/g (PETG)
  machineRatePerHour: z.number().int().min(0),  // e.g. 8000 IDR/hour
  laborRatePerHour: z.number().int().min(0),    // e.g. 25000 IDR/hour
  postProcessMinutes: z.number().min(0),        // e.g. 3 min per key
  packagingPerKey: z.number().int().min(0),     // e.g. 500 IDR
  packagingBase: z.number().int().min(0),       // e.g. 5000 IDR box
  failureRate: z.number().min(0).max(1.0),      // e.g. 0.15 (15%)
  targetMargin: z.number().min(0).max(0.99),    // e.g. 0.40 (40%)
  roundTo: z.number().int().min(1).default(1000), // e.g. round up to 1000 IDR
});

export type PricingConfig = z.infer<typeof PricingConfigSchema>;

export const QuoteItemInputSchema = z.object({
  keyId: z.string(),
  qty: z.number().int().min(1),
  gramsWithSupport: z.number().min(0.1),
  printMinutes: z.number().min(1),
});

export type QuoteItemInput = z.infer<typeof QuoteItemInputSchema>;

export const BundleTypeSchema = z.enum(['SAMPLER', 'ACCENT', 'FULL_SET']);
export type BundleType = z.infer<typeof BundleTypeSchema>;

export const QuoteInputSchema = z.object({
  items: z.array(QuoteItemInputSchema).min(1),
  bundleType: BundleTypeSchema.optional(),
  shippingCost: z.number().int().min(0).optional(),
});

export type QuoteInput = z.infer<typeof QuoteInputSchema>;

export interface CalculatedItemQuote {
  keyId: string;
  qty: number;
  gramsWithSupport: number;
  printMinutes: number;
  materialCost: number;
  machineCost: number;
  laborCost: number;
  directCost: number;
  riskBuffer: number;
  costPerKey: number;
  listPrice: number;
  lineTotal: number;
}

export interface Quote {
  items: CalculatedItemQuote[];
  subtotal: number;
  bundleDiscount: number;
  shipping: number;
  total: number;
  estimatedPrintMinutes: number;
  estimatedReadyAt: string;
  pricingSnapshot: {
    configVersion: number;
    computedAt: string;
  };
}

/**
 * Rounds UP a value to the nearest integer multiple of `step`.
 * e.g., ceilTo(23400, 1000) => 24000
 */
export function ceilTo(value: number, step: number): number {
  if (step <= 1) return Math.ceil(value);
  return Math.ceil(value / step) * step;
}

/**
 * Computes bundle discount in IDR (integer)
 * - SAMPLER (e.g. 4 keys): 0% discount
 * - ACCENT (e.g. 10 keys): 10% discount
 * - FULL_SET (60+ keys): 20% discount
 */
export function computeBundleDiscount(
  subtotal: number,
  bundleType?: BundleType,
): number {
  if (!bundleType) return 0;

  let discountRate = 0;
  if (bundleType === 'ACCENT') {
    discountRate = 0.1; // 10%
  } else if (bundleType === 'FULL_SET') {
    discountRate = 0.2; // 20%
  }

  return Math.floor(subtotal * discountRate);
}

/**
 * Pure quoting function implementing the platform pricing formula.
 */
export function calculateQuote(
  input: QuoteInput,
  config: PricingConfig,
  now: Date = new Date(),
): Quote {
  let totalPrintMinutes = 0;

  const items: CalculatedItemQuote[] = input.items.map((item) => {
    totalPrintMinutes += item.printMinutes * item.qty;

    // Direct costs per individual key
    const materialCost = Math.round(item.gramsWithSupport * config.filamentCostPerGram);
    const machineCost = Math.round((item.printMinutes / 60) * config.machineRatePerHour);
    const laborCost = Math.round((config.postProcessMinutes / 60) * config.laborRatePerHour);
    const directCost = materialCost + machineCost + laborCost + config.packagingPerKey;

    // Buffer for failure risk
    const riskBuffer = Math.round(directCost * config.failureRate);
    const costPerKey = directCost + riskBuffer;

    // List price targeting desired margin, rounded up to the nearest roundTo multiple
    const rawPrice = costPerKey / (1 - config.targetMargin);
    const listPrice = ceilTo(rawPrice, config.roundTo);
    const lineTotal = listPrice * item.qty;

    return {
      keyId: item.keyId,
      qty: item.qty,
      gramsWithSupport: item.gramsWithSupport,
      printMinutes: item.printMinutes,
      materialCost,
      machineCost,
      laborCost,
      directCost,
      riskBuffer,
      costPerKey,
      listPrice,
      lineTotal,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const bundleDiscount = computeBundleDiscount(subtotal, input.bundleType);
  const shipping = input.shippingCost ?? 0;
  const total = Math.max(0, subtotal - bundleDiscount + shipping);

  // Estimate lead time based on printing duration + queue buffer (default 2 days)
  const leadTimeHours = 48 + Math.ceil(totalPrintMinutes / 60);
  const estimatedReadyDate = new Date(now.getTime() + leadTimeHours * 3600 * 1000);

  return {
    items,
    subtotal,
    bundleDiscount,
    shipping,
    total,
    estimatedPrintMinutes: totalPrintMinutes,
    estimatedReadyAt: estimatedReadyDate.toISOString(),
    pricingSnapshot: {
      configVersion: config.version,
      computedAt: now.toISOString(),
    },
  };
}
