import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { KeyboardService } from '@/server/services/keyboard.service';

const MAX_JSON_SIZE_BYTES = 200 * 1024; // 200 KB

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 },
      );
    }

    const rawText = await req.text();
    if (rawText.length > MAX_JSON_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: 'Payload too large (max 200 KB)' },
        { status: 413 },
      );
    }

    let body: any;
    try {
      body = JSON.parse(rawText);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Malformed JSON payload' },
        { status: 400 },
      );
    }

    const { name, brand, switchType, layoutJson, sourceNote } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Keyboard name is required' },
        { status: 400 },
      );
    }

    if (!layoutJson) {
      return NextResponse.json(
        { success: false, error: 'KLE layoutJson is required' },
        { status: 400 },
      );
    }

    const created = await KeyboardService.importKle(session.user.id, {
      name,
      brand,
      switchType,
      rawKleJson: layoutJson,
      sourceNote,
    });

    return NextResponse.json({
      success: true,
      data: created,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}
