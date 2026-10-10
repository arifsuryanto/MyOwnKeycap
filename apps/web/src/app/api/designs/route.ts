import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { DesignService } from '@/server/services/design.service';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';

    const body = await req.json();
    const { prompt, keyboardModelId, options } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Prompt desain wajib diisi' },
        { status: 400 },
      );
    }

    if (prompt.length > 600) {
      return NextResponse.json(
        { success: false, error: 'Prompt maksimal 600 karakter' },
        { status: 400 },
      );
    }

    if (!keyboardModelId) {
      return NextResponse.json(
        { success: false, error: 'Model keyboard wajib dipilih' },
        { status: 400 },
      );
    }

    const result = await DesignService.generateDesign(
      {
        userId: session?.user?.id ?? null,
        prompt,
        keyboardModelId,
        options,
      },
      ip,
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memproses desain' },
      { status: 400 },
    );
  }
}
