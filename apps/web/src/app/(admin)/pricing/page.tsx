import { prisma } from '@keycap/db';
import { PricingAdminClient } from './pricing-admin-client';

export const dynamic = 'force-dynamic';

export default async function AdminPricingPage() {
  const configs = await prisma.pricingConfig.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
          Dynamic Pricing Engine & Cost Formula
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Parameter biaya COGS, tarif mesin per jam, markup kegagalan 3D printing (15%), dan margin kustomisasi.
        </p>
      </div>

      <PricingAdminClient configs={configs} />
    </div>
  );
}
