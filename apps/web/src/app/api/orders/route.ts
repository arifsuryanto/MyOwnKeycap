import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { OrderService } from '@/server/services/order.service';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { designId, bundleId, addressId, shippingCost } = body;

    if (!designId) {
      return NextResponse.json(
        { success: false, error: 'designId is required' },
        { status: 400 },
      );
    }

    const order = await OrderService.createDraftOrder({
      userId: session.user.id,
      designId,
      bundleId,
      addressId,
      shippingCost,
    });

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create order' },
      { status: 400 },
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 },
      );
    }

    const orders = await OrderService.getUserOrders(session.user.id);
    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to retrieve orders' },
      { status: 500 },
    );
  }
}
