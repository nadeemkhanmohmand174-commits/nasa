'use client';
import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MediaGrid } from '@/components/media/media-grid';
import { MediaSkeleton } from '@/components/media/media-skeleton';
import { DownloadMenu } from '@/components/export/download-menu';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, FolderOpen, Lock } from 'lucide-react';

const demoCollections: Record<string, { name: string; description: string; assets: any[] }> = {
  'best-of-apod': { name: 'Best of APOD', description: 'Curated astronomy pictures', assets: [] },
  'mars-highlights': { name: 'Mars Highlights', description: 'Top rover photos', assets: [] },
  'hazardous-neos': { name: 'Hazardous NEOs', description: 'Potentially hazardous asteroids', assets: [] },
};

export default function PublicCollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const collection = demoCollections[slug];

  const { data: apodAssets, isLoading } = useQuery({
    queryKey: ['collection-apod', slug],
    queryFn: async () => {
      const end = new Date();
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      const fmt = (d: Date) => d.toISOString().split('T')[0];
      const res = await fetch(`/api/nasa/apod/range?start_date=${fmt(start)}&end_date=${fmt(end)}`);
      if (!res.ok) throw new Error('Failed');
      return (await res.json()).data;
    },
  });

  const assets = apodAssets ?? [];

  if (!collection) {
    return <EmptyState title="Collection not found" description="This collection may be private or deleted." action={<Button asChild><Link href="/collections">Browse Collections</Link></Button>} />;
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild><Link href="/collections"><ArrowLeft className="h-4 w-4" /> Back to Collections</Link></Button>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FolderOpen className="h-6 w-6 text-nebula-violet" />
            <h1 className="font-heading text-3xl font-bold">{collection.name}</h1>
          </div>
          <p className="mt-1 text-muted-foreground">{collection.description}</p>
          <p className="mt-2 text-xs text-muted-foreground">{assets.length} items</p>
        </div>
        {assets.length > 0 && <DownloadMenu assets={assets} prefix={`collection-${slug}`} />}
      </div>
      {isLoading ? <MediaSkeleton /> : assets.length === 0 ? <EmptyState title="No items" description="This collection is empty" /> : <MediaGrid assets={assets} />}
    </div>
  );
}
