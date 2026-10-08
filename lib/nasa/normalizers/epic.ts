import type { MediaAsset } from '@/types';
import { type epicImageSchema } from '@/lib/nasa/client';
import { z } from 'zod';

type EpicImage = z.infer<typeof epicImageSchema>;

/** Build the EPIC image URL for a given date and image name */
function epicImageUrl(dateStr: string, image: string, ext: 'png' | 'jpg' = 'png'): string {
  const [year, month, day] = dateStr.split(' ')[0]!.split('-');
  return `https://epic.gsfc.nasa.gov/archive/natural/${year}/${month}/${day}/${ext}/${image}.${ext}`;
}

/** Normalize an EPIC image into MediaAsset */
export function normalizeEpic(item: EpicImage): MediaAsset {
  const dateOnly = item.date.split(' ')[0] ?? item.date;

  return {
    id: `epic_${item.identifier}`,
    nativeId: item.identifier,
    source: 'epic',
    kind: 'image',
    title: `EPIC — ${dateOnly}`,
    description: item.caption || `DSCOVR EPIC natural color image of Earth taken on ${item.date}.`,
    thumbUrl: epicImageUrl(item.date, item.image, 'jpg'),
    previewUrl: epicImageUrl(item.date, item.image, 'png'),
    fullUrl: epicImageUrl(item.date, item.image, 'png'),
    originalUrl: epicImageUrl(item.date, item.image, 'png'),
    downloadUrl: epicImageUrl(item.date, item.image, 'png'),
    date: dateOnly,
    credit: 'NASA EPIC Team',
    center: 'GSFC',
    keywords: ['epic', 'earth', 'dscovr', 'natural'],
    metadata: {
      identifier: item.identifier,
      caption: item.caption,
      centroid_lat: item.centroid_coordinates.lat,
      centroid_lon: item.centroid_coordinates.lon,
      dscovr_x: item.dscovr_j2000_position.x,
      dscovr_y: item.dscovr_j2000_position.y,
      dscovr_z: item.dscovr_j2000_position.z,
      sun_x: item.sun_j2000_position.x,
      sun_y: item.sun_j2000_position.y,
      sun_z: item.sun_j2000_position.z,
    },
    citations: [
      { label: 'NASA EPIC', url: 'https://epic.gsfc.nasa.gov/' },
      { label: 'DSCOVR Mission', url: 'https://www.nesdis.noaa.gov/current-satellite-missions/currently-flying/dscovr' },
    ],
  };
}

/** Normalize an array of EPIC images */
export function normalizeEpicArray(items: EpicImage[]): MediaAsset[] {
  return items.map(normalizeEpic);
}
