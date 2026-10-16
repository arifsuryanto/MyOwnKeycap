import { KeyboardService } from '@/server/services/keyboard.service';
import DesignStudio from '@/components/design-studio/DesignStudio';

interface DesignPageProps {
  searchParams: Promise<{
    model?: string;
  }>;
}

export const metadata = {
  title: 'AI Design Studio — Desain Custom Keycap Seketika',
  description:
    'Deskripsikan konsep keycap Anda dan saksikan AI mendesain skema warna, legend, dan geometri tombol secara instan.',
};

export default async function DesignPage({ searchParams }: DesignPageProps) {
  const params = await searchParams;
  const selectedModelSlug = params.model;

  const result = await KeyboardService.listKeyboards({
    limit: 50,
  });

  const models = result.items.map((m) => ({
    id: m.id,
    slug: m.slug,
    name: m.name,
    brand: m.brand,
    keyCount: m.keyCount,
    layoutJson: m.layoutJson,
  }));

  return (
    <div className="min-h-screen bg-[#071E33] text-[#FAF0CA] pb-24 font-sans selection:bg-[#F95738]/20 selection:text-[#0D3B66]">
      <DesignStudio
        initialModels={models}
        selectedModelSlug={selectedModelSlug}
      />
    </div>
  );
}
