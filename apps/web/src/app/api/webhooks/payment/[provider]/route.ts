import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/server/services/order.service';

interface RouteContext {
  params: Promise<{
    provider: string;
  }>;
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { provider } = await context.params;
    const rawBody = await req.text();

    // Headers map
    const headers: Record<string, string> = {};
    req.headers.forEach((val, key) => {
      headers[key.toLowerCase()] = val;
    });

    const result = await OrderService.handleWebhook(provider, headers, rawBody);

    return NextResponse.json({
      received: true,
      ...result,
    });
  } catch (err: any) {
    console.error('Webhook processing error:', err.message);
    return NextResponse.json(
      { error: err.message || 'Webhook verification failed' },
      { status: 400 },
    );
  }
}
