import { NextRequest, NextResponse } from 'next/server';
import { KeyboardService } from '@/server/services/keyboard.service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q') ?? undefined;
    const brand = searchParams.get('brand') ?? undefined;
    const switchType = searchParams.get('switch') ?? undefined;
    const verifiedOnly = searchParams.get('verified') === 'true';
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = parseInt(searchParams.get('limit') ?? '12', 10);

    const result = await KeyboardService.listKeyboards({
      search,
      brand,
      switchType,
      verifiedOnly,
      page,
      limit,
    });

    const brands = await KeyboardService.getDistinctBrands();

    return NextResponse.json({
      success: true,
      data: result.items,
      pagination: result.pagination,
      availableBrands: brands,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}
