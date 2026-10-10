import { prisma } from '@keycap/db';
import { KleLayout } from '@keycap/shared';

export interface ListKeyboardsQuery {
  search?: string | undefined;
  brand?: string | undefined;
  switchType?: string | undefined;
  verifiedOnly?: boolean | undefined;
  page?: number | undefined;
  limit?: number | undefined;
}

export interface ImportKleInput {
  name: string;
  brand?: string;
  switchType?: string;
  rawKleJson: unknown;
  sourceNote?: string;
}

export class KeyboardService {
  /**
   * List keyboard models with filtering and pagination
   */
  static async listKeyboards(query: ListKeyboardsQuery = {}) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 12));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.verifiedOnly) {
      where.verified = true;
    }

    if (query.brand) {
      where.brand = { equals: query.brand, mode: 'insensitive' };
    }

    if (query.switchType) {
      where.switchType = query.switchType;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { brand: { contains: query.search, mode: 'insensitive' } },
        { slug: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.keyboardModel.count({ where }),
      prisma.keyboardModel.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ verified: 'desc' }, { brand: 'asc' }, { name: 'asc' }],
      }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single keyboard model by slug
   */
  static async getKeyboardBySlug(slug: string) {
    return prisma.keyboardModel.findUnique({
      where: { slug },
    });
  }

  /**
   * Get single keyboard model by ID
   */
  static async getKeyboardById(id: string) {
    return prisma.keyboardModel.findUnique({
      where: { id },
    });
  }

  /**
   * Get list of unique brands for filters
   */
  static async getDistinctBrands(): Promise<string[]> {
    const brands = await prisma.keyboardModel.findMany({
      select: { brand: true },
      distinct: ['brand'],
      orderBy: { brand: 'asc' },
    });
    return brands.map((b) => b.brand);
  }

  /**
   * Import raw KLE or custom JSON layout
   */
  static async importKle(userId: string, input: ImportKleInput) {
    // Basic slug generation
    const baseSlug = `${input.brand ?? 'custom'}-${input.name}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const slug = `${baseSlug}-${randomSuffix}`;

    // Normalize or validate layoutJson
    let layoutData: any;
    if (typeof input.rawKleJson === 'string') {
      try {
        layoutData = JSON.parse(input.rawKleJson);
      } catch {
        throw new Error('Invalid JSON string for layout');
      }
    } else {
      layoutData = input.rawKleJson;
    }

    // Determine key count
    let keyCount = 68;
    if (Array.isArray(layoutData)) {
      // Raw KLE matrix array
      let count = 0;
      for (const row of layoutData) {
        if (Array.isArray(row)) {
          for (const item of row) {
            if (typeof item === 'string') count++;
          }
        }
      }
      keyCount = count > 0 ? count : 68;
    } else if (layoutData?.keys && Array.isArray(layoutData.keys)) {
      keyCount = layoutData.keys.length;
    }

    const created = await prisma.keyboardModel.create({
      data: {
        slug,
        brand: input.brand?.trim() || 'Custom',
        name: input.name.trim(),
        switchType: input.switchType || 'MX',
        keyCount,
        layoutJson: layoutData,
        verified: false,
        sourceNote: input.sourceNote ?? `Imported by user ${userId}`,
      },
    });

    return created;
  }
}
