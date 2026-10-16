import { prisma } from '@keycap/db';
import { GeminiProvider, validateAndSanitizeDesignSpec } from '@keycap/llm';
import { redis } from '@/lib/redis';
import { env } from '@/lib/env';

export interface CreateDesignInput {
  userId?: string | null;
  prompt: string;
  keyboardModelId: string;
  options?: {
    profile?: 'CHERRY' | 'OEM';
    material?: 'PETG' | 'PLA' | 'ASA';
    finish?: 'RAW' | 'SANDED' | 'PAINTED';
    baseColor?: string;
    legendColor?: string;
    selection?: { mode: 'FULL_SET' | 'WASD' | 'ARROWS' | 'ACCENT' | 'CUSTOM'; selectedKeys?: string[] };
    relief?: any;
  };
}

export class DesignService {
  /**
   * Check and consume daily AI generation quota
   */
  static async checkAndConsumeQuota(userId: string | null, ip: string): Promise<boolean> {
    const today = new Date().toISOString().slice(0, 10);
    const quotaKey = userId ? `quota:user:${userId}:${today}` : `quota:ip:${ip}:${today}`;

    const currentCount = await redis.incr(quotaKey);
    if (currentCount === 1) {
      // Expire at midnight / 24h
      await redis.expire(quotaKey, 24 * 60 * 60);
    }

    const freeDailyLimit = env.AI_FREE_DAILY ?? 5;
    if (currentCount > freeDailyLimit) {
      if (userId) {
        // Check if user has available paid credit balance
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { creditBalance: true },
        });

        if (user && user.creditBalance > 0) {
          // Deduct 1 credit
          await prisma.$transaction([
            prisma.user.update({
              where: { id: userId },
              data: { creditBalance: { decrement: 1 } },
            }),
            prisma.creditLedger.create({
              data: {
                userId,
                delta: -1,
                reason: 'AI_DESIGN_GENERATION',
              },
            }),
          ]);
          return true;
        }
      }
      return false;
    }

    return true;
  }

  /**
   * Generate a design specification using Gemini LLM with guardrails
   */
  static async generateDesign(input: CreateDesignInput, ip: string) {
    const keyboard = await prisma.keyboardModel.findUnique({
      where: { id: input.keyboardModelId },
    });

    if (!keyboard) {
      throw new Error('Selected keyboard model not found');
    }

    // Check quota
    const quotaAllowed = await this.checkAndConsumeQuota(input.userId ?? null, ip);
    if (!quotaAllowed) {
      throw new Error(
        'Batas harian generasi AI gratis telah tercapai (5x/hari). Silakan top up credit atau coba lagi besok.',
      );
    }

    // Extract layout summary
    const layout = keyboard.layoutJson as any;
    const keys: any[] = Array.isArray(layout?.keys) ? layout.keys : [];
    const keyGroups = Array.from(new Set(keys.map((k) => k.group || 'ALPHAS'))).filter(Boolean);

    // Call Gemini Provider
    const gemini = new GeminiProvider(env.LLM_API_KEY, env.LLM_MODEL);
    const rawSpec = await gemini.generateDesignSpec({
      prompt: input.prompt,
      layout: {
        modelName: `${keyboard.brand} ${keyboard.name}`,
        switchType: keyboard.switchType,
        keyCount: keyboard.keyCount,
        keyGroups,
      },
      options: input.options,
    });

    // Validate and hash
    const { spec, hash } = validateAndSanitizeDesignSpec(rawSpec);
    if (input.options?.selection) { spec.selection = input.options.selection as any; }
    if (input.options?.relief) { spec.relief = input.options.relief as any; }

    // Persist design
    // If not logged in, we associate with a placeholder/anonymous or create when saving
    let designId: string | null = null;
    if (input.userId) {
      const saved = await prisma.design.create({
        data: {
          userId: input.userId,
          keyboardModelId: keyboard.id,
          prompt: input.prompt,
          status: 'READY',
          specJson: spec as any,
          specHash: hash,
        },
      });
      designId = saved.id;
    }

    return {
      designId,
      spec,
      specHash: hash,
      keyboard: {
        id: keyboard.id,
        name: keyboard.name,
        brand: keyboard.brand,
        slug: keyboard.slug,
        keyCount: keyboard.keyCount,
      },
    };
  }

  /**
   * Get design by ID
   */
  static async getDesign(id: string) {
    return prisma.design.findUnique({
      where: { id },
      include: {
        keyboardModel: true,
      },
    });
  }
}

