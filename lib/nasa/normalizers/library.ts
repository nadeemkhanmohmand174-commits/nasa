import type { MediaAsset, MediaKind } from '@/types';
import { type librarySearchSchema } from '@/lib/nasa/client';
import { z } from 'zod';

type LibrarySearchResponse = z.infer<typeof librarySearchSchema>;

/** Map library media_type strings to our MediaKind */
function mapKind(mediaType: string): MediaKind {
  if (mediaType === 'image') return 'image';
  if (mediaType === 'video') return 'video';
  if (mediaType === 'audio') return 'audio';
  return 'document';
}

/** Normalize a library search item into MediaAsset */
export function normalizeLibrarySearch(response: LibrarySearchResponse): MediaAsset[] {
  return response.collection.items.map((item, idx) => {
    const data = item.data[0];
    if (!data) {
      return {
        id: `library_${idx}`,
        nativeId: String(idx),
        source: 'library' as const,
        kind: 'document' as MediaKind,
        title: 'Untitled',
        description: '',
        thumbUrl: '',
        previewUrl: '',
        fullUrl: '',
        date: '',
        keywords: [],
        metadata: {} as Record<string, string | number | boolean | null>,
        citations: [],
      };
    }

    // Find the preview/image link
    const previewLink = item.links?.find((l) => l.render === 'image' || l.rel === 'preview');
    const canonicalLink = item.links?.find((l) => l.rel === 'canonical');

    return {
      id: `library_${data.nasa_id}`,
      nativeId: data.nasa_id,
      source: 'library',
      kind: mapKind(data.media_type),
      title: data.title,
      description: data.description,
      thumbUrl: previewLink?.href ?? '',
      previewUrl: previewLink?.href ?? '',
      fullUrl: canonicalLink?.href ?? item.href ?? previewLink?.href ?? '',
      originalUrl: canonicalLink?.href ?? item.href,
      downloadUrl: canonicalLink?.href ?? item.href,
      date: data.date_created.split('T')[0] ?? data.date_created,
      credit: data.secondary_creator?.join(', ') ?? 'NASA',
      center: data.center || undefined,
      keywords: data.keywords,
      metadata: {
        media_type: data.media_type ?? '',
        nasa_id: data.nasa_id,
        center: data.center ?? '',
        date_created: data.date_created ?? '',
      },
      citations: [
        { label: 'NASA Images', url: `https://images.nasa.gov/details-${data.nasa_id}` },
        { label: 'NASA Image Library', url: 'https://images.nasa.gov' },
      ],
    };
  });
}
