import { z } from 'zod';

// ─── Agent → Server Messages ─────────────────────────────────

const PrinterInfo = z
  .object({
    id: z.string(),
    name: z.string(),
    adapter: z.string(),
    bedX: z.number().int(),
    bedY: z.number().int(),
    bedZ: z.number().int(),
  })
  .strict();

const TempsSchema = z
  .object({
    nozzle: z.number(),
    bed: z.number(),
    nozzleTarget: z.number().optional(),
    bedTarget: z.number().optional(),
  })
  .strict();

const PrintMetrics = z
  .object({
    durationMinutes: z.number(),
    filamentUsedMm: z.number().optional(),
    layers: z.number().int().optional(),
  })
  .strict();

export const AgentHello = z
  .object({
    type: z.literal('hello'),
    agentId: z.string(),
    version: z.string(),
    printers: z.array(PrinterInfo),
    capabilities: z.array(z.string()),
  })
  .strict();

export const AgentJobClaim = z
  .object({
    type: z.literal('job.claim'),
    jobId: z.string(),
  })
  .strict();

export const AgentJobProgress = z
  .object({
    type: z.literal('job.progress'),
    jobId: z.string(),
    state: z.enum(['slicing', 'awaiting_operator', 'printing', 'cooling']),
    percent: z.number().min(0).max(100),
    temps: TempsSchema,
    layer: z.number().int().optional(),
    snapshotUrl: z.string().url().optional(),
  })
  .strict();

export const AgentJobDone = z
  .object({
    type: z.literal('job.done'),
    jobId: z.string(),
    metrics: PrintMetrics,
  })
  .strict();

export const AgentJobFailed = z
  .object({
    type: z.literal('job.failed'),
    jobId: z.string(),
    reason: z.string().max(500),
  })
  .strict();

export const AgentHeartbeat = z
  .object({
    type: z.literal('heartbeat'),
    timestamp: z.number().optional(),
  })
  .strict();

/** All messages sent from Agent → Server */
export const AgentMessage = z.discriminatedUnion('type', [
  AgentHello,
  AgentJobClaim,
  AgentJobProgress,
  AgentJobDone,
  AgentJobFailed,
  AgentHeartbeat,
]);
export type AgentMessage = z.infer<typeof AgentMessage>;

// ─── Server → Agent Messages ─────────────────────────────────

const PlateItem = z
  .object({
    threeMfUrl: z.string().url(),
    sha256: z.string().length(64),
  })
  .strict();

export const ServerJobOffer = z
  .object({
    type: z.literal('job.offer'),
    jobId: z.string(),
    plate: z.object({
      items: z.array(PlateItem).min(1),
    }),
    printProfileId: z.string(),
    material: z.string(),
    estMinutes: z.number().int(),
  })
  .strict();

export const ServerCtrl = z
  .object({
    type: z.literal('ctrl'),
    action: z.enum(['pause', 'cancel', 'estop']),
    jobId: z.string(),
  })
  .strict();

export const ServerHeartbeat = z
  .object({
    type: z.literal('heartbeat'),
    timestamp: z.number().optional(),
  })
  .strict();

/** All messages sent from Server → Agent */
export const ServerMessage = z.discriminatedUnion('type', [
  ServerJobOffer,
  ServerCtrl,
  ServerHeartbeat,
]);
export type ServerMessage = z.infer<typeof ServerMessage>;
