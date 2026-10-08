import type { MediaAsset } from '@/types';
import { type apodSchema } from '@/lib/nasa/client';
import { z } from 'zod';

type ApodResponse = z.infer<typeof apodSchema>;

/** Normalize APOD response into MediaAsset */
export function normalizeApod(item: ApodResponse): MediaAsset {
  const isVideo = item.media_type === 'video';
  const thumbUrl = item.thumbnail_url ?? item.url;
  const fullUrl = isVideo ? item.url : (item.hdurl ?? item.url);

  return {
    id: `apod_${item.date}`,
    nativeId: item.date,
    source: 'apod',
    kind: isVideo ? 'video' : 'image',
    title: item.title,
    description: item.explanation,
    thumbUrl,
    previewUrl: isVideo ? thumbUrl : fullUrl,
    fullUrl,
    originalUrl: item.hdurl ?? undefined,
    downloadUrl: item.hdurl ?? item.url,
    date: item.date,
    credit: item.copyright ?? 'NASA',
    center: undefined,
    keywords: ['apod', 'astronomy', isVideo ? 'video' : 'image'],
    metadata: {
      media_type: item.media_type,
      service_version: item.service_version ?? 'v1',
      has_hd: Boolean(item.hdurl),
    },
    citations: [
      {
        label: 'NASA APOD',
        url: `https://apod.nasa.gov/apod/ap${item.date.replace(/-/g, '').slice(2)}.html`,
      },
      { label: 'APOD Archive', url: 'https://apod.nasa.gov/apod/archivepix.html' },
    ],
  };
}

/** Normalize an array of APOD items */
export function normalizeApodArray(items: ApodResponse[]): MediaAsset[] {
  return items.map(normalizeApod);
}
