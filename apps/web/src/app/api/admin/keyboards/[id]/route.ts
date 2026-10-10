import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@keycap/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { verified } = body;

    const updated = await prisma.keyboardModel.update({
      where: { id },
      data: {
        verified: typeof verified === 'boolean' ? verified : true,
      },
    });

    return NextResponse.json({ success: true, keyboard: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
