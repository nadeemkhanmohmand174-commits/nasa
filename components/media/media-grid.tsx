'use client';
import { MediaCard } from './media-card';
import type { MediaAsset } from '@/types';
import { cn } from '@/lib/utils';

interface MediaGridProps {
  assets: MediaAsset[];
  variant?: 'grid' | 'masonry' | 'list';
  onFavorite?: (asset: MediaAsset) => void;
  favorites?: Set<string>;
}

export function MediaGrid({ assets, variant = 'grid', onFavorite, favorites }: MediaGridProps) {
  if (variant === 'list') {
    return (
      <div className="flex flex-col gap-2">
        {assets.map((asset, i) => (
          <MediaCard key={asset.id} asset={asset} index={i} onFavorite={onFavorite} isFavorite={favorites?.has(asset.id)} />
        ))}
      </div>
    );
  }

  if (variant === 'masonry') {
    return (
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
        {assets.map((asset, i) => (
          <div key={asset.id} className="mb-4 break-inside-avoid">
            <MediaCard asset={asset} index={i} onFavorite={onFavorite} isFavorite={favorites?.has(asset.id)} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid gap-4', 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4')}>
      {assets.map((asset, i) => (
        <MediaCard key={asset.id} asset={asset} index={i} onFavorite={onFavorite} isFavorite={favorites?.has(asset.id)} />
      ))}
    </div>
  );
}
