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
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <DesignStudio
        initialModels={models}
        selectedModelSlug={selectedModelSlug}
      />
    </div>
  );
}
