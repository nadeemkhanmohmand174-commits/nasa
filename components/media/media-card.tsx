'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ExternalLink } from 'lucide-react';
import { SourceBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn, formatDatePretty, truncate } from '@/lib/utils';
import type { MediaAsset } from '@/types';

interface MediaCardProps {
  asset: MediaAsset;
  index?: number;
  onFavorite?: (asset: MediaAsset) => void;
  isFavorite?: boolean;
}

export function MediaCard({ asset, index = 0, onFavorite, isFavorite }: MediaCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.4) }}
      className="group glass-card relative overflow-hidden"
    >
      <Link href={`/asset/${asset.id}`} className="block">
        <div className="relative aspect-video overflow-hidden rounded-t-xl">
          {asset.thumbUrl ? (
            <img src={asset.thumbUrl} alt={asset.title} loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className={cn('flex h-full items-center justify-center bg-gradient-to-br', `from-source-${asset.source}/20 to-source-${asset.source}/5`)}>
              <span className="text-4xl opacity-30">{asset.kind === 'video' ? '🎬' : asset.kind === 'dataset' ? '📊' : '📄'}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="absolute left-2 top-2"><SourceBadge source={asset.source} /></div>
          {asset.kind === 'video' && (
            <div className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">VIDEO</div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <Link href={`/asset/${asset.id}`}>
          <h3 className="mb-1 line-clamp-2 font-heading text-sm font-semibold leading-tight hover:text-primary">{truncate(asset.title, 60)}</h3>
        </Link>
        <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">{truncate(asset.description ?? '', 100)}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatDatePretty(asset.date)}</span>
          {asset.credit && <span className="truncate">{truncate(asset.credit, 20)}</span>}
        </div>
        {onFavorite && (
          <Button variant="ghost" size="icon" className="absolute right-2 top-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={(e) => { e.preventDefault(); onFavorite(asset); }} aria-label="Toggle favorite">
            <Heart className={cn('h-4 w-4', isFavorite && 'fill-red-500 text-red-500')} />
          </Button>
        )}
      </div>
    </motion.div>
  );
}
