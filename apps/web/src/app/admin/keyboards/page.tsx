import { prisma } from '@keycap/db';
import { KeyboardsAdminClient } from './keyboards-admin-client';

export const dynamic = 'force-dynamic';

export default async function AdminKeyboardsPage() {
  const keyboards = await prisma.keyboardModel.findMany({
    orderBy: [{ brand: 'asc' }, { name: 'asc' }],
    include: {
      _count: { select: { designs: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
          Keyboard Database & KLE Verifier
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Kelola model keyboard yang didukung, verifikasi layout matriks KLE, dan kompatibilitas switch.
        </p>
      </div>

      <KeyboardsAdminClient initialKeyboards={keyboards} />
    </div>
  );
}
