import type { MediaAsset } from '@/types';
import { type earthAssetsSchema, type earthImagerySchema } from '@/lib/nasa/client';
import { z } from 'zod';

type EarthAssetsResponse = z.infer<typeof earthAssetsSchema>;
type EarthImageryResponse = z.infer<typeof earthImagerySchema>;

/** Normalize Earth assets into MediaAsset[] */
export function normalizeEarthAssets(
  response: EarthAssetsResponse,
  lon: number,
  lat: number
): MediaAsset[] {
  return response.results.map((result) => ({
    id: `earth_${result.id}`,
    nativeId: result.id,
    source: 'earth',
    kind: 'image',
    title: `Earth Asset — ${result.date}`,
    description: `Landsat imagery asset at coordinates (${lat}, ${lon}) from the ${result.resource.dataset} dataset on planet ${result.resource.planet}.`,
    thumbUrl: '',
    previewUrl: '',
    fullUrl: '',
    originalUrl: undefined,
    downloadUrl: undefined,
    date: result.date,
    credit: 'NASA Earth Observatory',
    center: 'GSFC',
    keywords: ['earth', 'landsat', result.resource.dataset],
    metadata: {
      dataset: result.resource.dataset,
      planet: result.resource.planet,
      lon,
      lat,
    },
    citations: [
      { label: 'NASA Earth Observatory', url: 'https://earthobservatory.nasa.gov/' },
      { label: 'Landsat Mission', url: 'https://landsat.gsfc.nasa.gov/' },
    ],
  }));
}

/** Normalize Earth imagery response into MediaAsset */
export function normalizeEarthImagery(
  response: EarthImageryResponse,
  lon: number,
  lat: number,
  date: string
): MediaAsset {
  return {
    id: `earth_imagery_${date}_${lat}_${lon}`,
    nativeId: `${date}_${lat}_${lon}`,
    source: 'earth',
    kind: 'image',
    title: `Earth Imagery — ${date}`,
    description: `Satellite imagery of Earth at coordinates (${lat}, ${lon}) captured on ${date}.`,
    thumbUrl: response.url ?? '',
    previewUrl: response.url ?? '',
    fullUrl: response.url ?? '',
    originalUrl: response.url,
    downloadUrl: response.url,
    date: response.date || date,
    credit: 'NASA Earth Observatory',
    center: 'GSFC',
    keywords: ['earth', 'satellite', 'imagery'],
    metadata: {
      lon,
      lat,
      date: response.date || date,
      dataset: response.resource?.dataset ?? 'landsat',
      planet: response.resource?.planet ?? 'earth',
    },
    citations: [
      { label: 'NASA Earth Observatory', url: 'https://earthobservatory.nasa.gov/' },
      { label: 'NASA Earth API', url: 'https://api.nasa.gov/' },
    ],
  };
}
