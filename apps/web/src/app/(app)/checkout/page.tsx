import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@keycap/db';
import CheckoutForm from '@/components/checkout/CheckoutForm';

interface CheckoutPageProps {
  searchParams: Promise<{
    designId?: string;
    model?: string;
    mode?: string;
    keys?: string;
  }>;
}

export const metadata = {
  title: 'Checkout & Konfirmasi Pesanan ── Keycap Platform',
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/checkout');
  }

  const { designId, model: modelSlug, mode, keys } = await searchParams;

  let design: any = null;
  if (designId) {
    design = await prisma.design.findUnique({
      where: { id: designId },
      include: { keyboardModel: true },
    });
  }

  let keyboardModel: any = null;
  if (modelSlug) {
    keyboardModel = await prisma.keyboardModel.findUnique({
      where: { slug: modelSlug },
    });
  } else if (design?.keyboardModel) {
    keyboardModel = design.keyboardModel;
  }

  // Parse keys if passed from query params or stored in design spec
  const selectedKeys = keys
    ? keys.split(',').filter(Boolean)
    : (design?.specJson?.selection?.selectedKeys ?? []);
  
  const selectedMode =
    mode ||
    design?.specJson?.selection?.mode ||
    (selectedKeys.length > 0 && selectedKeys.length < 50 ? 'CUSTOM' : 'FULL_SET');

  let keyCount = keyboardModel?.keyCount ?? 68;
  if (selectedKeys.length > 0) {
    keyCount = selectedKeys.length;
  }

  let modeLabel = '';
  if (selectedMode === 'WASD') modeLabel = ' (WASD Gamer Pack)';
  else if (selectedMode === 'ARROWS') modeLabel = ' (Arrow Cluster)';
  else if (selectedMode === 'ACCENT') modeLabel = ' (Accent Essentials)';
  else if (selectedKeys.length > 0 && selectedKeys.length < (keyboardModel?.keyCount ?? 68)) {
    modeLabel = ` (Custom Pack - ${keyCount} Keys)`;
  }

  const baseDesignName = design?.specJson?.theme?.name ?? 'Custom Keycap Set';
  const designName = `${baseDesignName}${modeLabel}`;
  const keyboardModelName = keyboardModel
    ? `${keyboardModel.brand} ${keyboardModel.name}`
    : 'Mechanical Keyboard';

  const initialEstimateIdr = keyCount * 15000;
  const initialBundle =
    keyCount > 50 ? 'FULL_SET' : keyCount >= 5 ? 'ACCENT' : 'SAMPLER';

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 border-b border-zinc-800 pb-6">
          <h1 className="text-3xl font-extrabold text-white">Checkout Pesanan</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Lengkapi data pengiriman untuk memulai pencetakan 3D keycap custom Anda.
          </p>
        </div>

        <CheckoutForm
          designId={design?.id ?? designId}
          designName={designName}
          keyboardModelName={keyboardModelName}
          keyCount={keyCount}
          initialEstimateIdr={initialEstimateIdr}
          initialBundle={initialBundle}
        />
      </div>
    </div>
  );
}
