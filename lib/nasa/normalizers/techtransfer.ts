import type { MediaAsset } from '@/types';
import { type techTransferSchema } from '@/lib/nasa/client';
import { z } from 'zod';

type TechTransferResponse = z.infer<typeof techTransferSchema>;

/**
 * Normalize TechTransfer response into MediaAsset[].
 * The API returns arrays of strings: [id, title, abstract, application, ...]
 */
export function normalizeTechTransfer(
  items: TechTransferResponse,
  engine: string = 'patent'
): MediaAsset[] {
  return items.map((item) => {
    const [id, title, abstract, application, , , , , url] = item;
    return {
      id: `techtransfer_${id}`,
      nativeId: id,
      source: 'techtransfer',
      kind: 'document',
      title: title || 'Untitled Patent',
      description: abstract || '',
      thumbUrl: '',
      previewUrl: '',
      fullUrl: url ?? '',
      originalUrl: url,
      downloadUrl: url,
      date: new Date().toISOString().split('T')[0]!,
      credit: 'NASA Technology Transfer Program',
      center: 'HQ',
      keywords: ['techtransfer', engine, 'patent'],
      metadata: {
        id,
        application: application || '',
        engine,
        url: url ?? '',
      },
      citations: [
        { label: 'NASA Technology Transfer', url: 'https://technology.nasa.gov/' },
        { label: 'NASA Patent Portfolio', url: 'https://technology.nasa.gov/patent' },
      ],
    };
  });
}
