import { NextRequest, NextResponse } from 'next/server';
import { ShippingService } from '@/server/services/shipping.service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { courier = 'jne', service = 'REG' } = body;

    const result = await ShippingService.dispatchOrder(id, courier, service);
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
