/** Unified media types used across all NASA sources */

export type MediaSource = 'apod' | 'mars' | 'neo' | 'epic' | 'library' | 'earth' | 'techtransfer';
export type MediaKind = 'image' | 'video' | 'audio' | 'dataset' | 'document';

export interface MediaAsset {
  id: string;
  nativeId: string;
  source: MediaSource;
  kind: MediaKind;
  title: string;
  description?: string;
  thumbUrl: string;
  previewUrl: string;
  fullUrl: string;
  originalUrl?: string;
  downloadUrl?: string;
  date: string;
  credit?: string;
  center?: string;
  keywords: string[];
  metadata: Record<string, string | number | boolean | null>;
  citations: { label: string; url: string }[];
}

/** API envelope types */
export interface ApiSuccess<T> {
  data: T;
  meta?: {
    count?: number;
    page?: number;
    total?: number;
    source?: string;
    cached?: boolean;
    [key: string]: unknown;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/** Mars Rover manifest summary */
export interface RoverManifest {
  name: string;
  landing_date: string;
  max_sol: number;
  max_date: string;
  status: string;
  total_photos: number;
  photos_per_sol: { sol: number; total_photos: number; cameras: string[] }[];
}

/** NEO (Near-Earth Object) summary */
export interface NeoSummary {
  id: string;
  name: string;
  absolute_magnitude_h: number;
  estimated_diameter_min_km: number;
  estimated_diameter_max_km: number;
  is_potentially_hazardous: boolean;
  close_approach_date: string;
  relative_velocity_kph: number;
  miss_distance_km: number;
  orbiting_body: string;
  nasa_jpl_url: string;
}

/** EPIC image metadata */
export interface EpicImage {
  identifier: string;
  caption: string;
  image: string;
  date: string;
  centroid_coordinates: { lat: number; lon: number };
  dscovr_j2000_position: { x: number; y: number; z: number };
  lunar_j2000_position: { x: number; y: number; z: number };
  sun_j2000_position: { x: number; y: number; z: number };
  attitude_quaternions: number[];
}

/** Library search result item */
export interface LibraryItem {
  nasa_id: string;
  title: string;
  description: string;
  media_type: string;
  keywords: string[];
  center: string;
  date_created: string;
  secondary_creator?: string;
  href?: string;
}

/** TechTransfer item */
export interface TechTransferItem {
  id: string;
  title: string;
  abstract: string;
  application: string;
  nasa_id?: string;
  contact?: string;
  url?: string;
}

/** Collection types */
export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  slug: string;
  is_public: boolean;
  cover_asset_id: string | null;
  item_count: number;
  created_at: string;
  updated_at: string;
}

export interface CollectionItem {
  id: string;
  collection_id: string;
  asset_id: string;
  asset_snapshot: MediaAsset;
  position: number;
  added_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  asset_id: string;
  asset_snapshot: MediaAsset;
  created_at: string;
}

export interface DownloadRecord {
  id: string;
  user_id: string | null;
  asset_id: string;
  format: 'image' | 'pdf' | 'xlsx' | 'csv' | 'json' | 'zip';
  item_count: number;
  byte_size: number;
  created_at: string;
}

export interface SearchHistoryEntry {
  id: string;
  user_id: string | null;
  query: string;
  filters: Record<string, unknown>;
  source: string;
  result_count: number;
  created_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  asset_id: string;
  body: string;
  created_at: string;
  updated_at: string;
}
