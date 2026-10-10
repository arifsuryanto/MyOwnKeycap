import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { OrderService } from '@/server/services/order.service';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(_req: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 },
      );
    }

    const { id } = await context.params;
    const result = await OrderService.checkoutOrder(id, session.user.id);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Checkout failed' },
      { status: 400 },
    );
  }
}
