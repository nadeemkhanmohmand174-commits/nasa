import type { MediaAsset } from '@/types';
import { type marsPhotoSchema } from '@/lib/nasa/client';
import { z } from 'zod';

type MarsPhoto = z.infer<typeof marsPhotoSchema>;

/** Normalize a Mars Rover photo into MediaAsset */
export function normalizeMarsPhoto(photo: MarsPhoto): MediaAsset {
  const imgSrc = photo.img_src;

  return {
    id: `mars_${photo.id}`,
    nativeId: String(photo.id),
    source: 'mars',
    kind: 'image',
    title: `${photo.rover.name} — ${photo.camera.full_name} — Sol ${photo.sol}`,
    description: `Photo taken by the ${photo.camera.full_name} camera aboard the ${photo.rover.name} rover on Mars during Sol ${photo.sol} (Earth date ${photo.earth_date}).`,
    thumbUrl: imgSrc,
    previewUrl: imgSrc,
    fullUrl: imgSrc,
    originalUrl: imgSrc,
    downloadUrl: imgSrc,
    date: photo.earth_date,
    credit: `NASA/JPL-Caltech/${photo.rover.name}`,
    center: 'JPL',
    keywords: ['mars', 'rover', photo.rover.name.toLowerCase(), photo.camera.name.toLowerCase()],
    metadata: {
      sol: photo.sol,
      earth_date: photo.earth_date,
      camera_id: photo.camera.id,
      camera_name: photo.camera.name,
      camera_full_name: photo.camera.full_name,
      rover_id: photo.rover.id,
      rover_name: photo.rover.name,
      rover_status: photo.rover.status,
      landing_date: photo.rover.landing_date,
      max_sol: photo.rover.max_sol,
      total_photos: photo.rover.total_photos,
    },
    citations: [
      {
        label: 'NASA Mars Photos',
        url: 'https://mars.nasa.gov/mars-photos/',
      },
      {
        label: `${photo.rover.name} Mission`,
        url: `https://mars.nasa.gov/${photo.rover.name.toLowerCase()}/`,
      },
    ],
  };
}

/** Normalize an array of Mars photos */
export function normalizeMarsPhotos(photos: MarsPhoto[]): MediaAsset[] {
  return photos.map(normalizeMarsPhoto);
}
