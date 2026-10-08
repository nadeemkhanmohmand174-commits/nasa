import type { MediaSource, MediaKind } from '@/types';

export const APP_NAME = 'Cosmos Vault';
export const APP_TAGLINE = 'NASA Research Media & Data Exploration Platform';

/** NASA API base URL */
export const NASA_API_BASE = 'https://api.nasa.gov';
export const NASA_LIBRARY_BASE = 'https://images-api.nasa.gov';

/** Revalidation windows in seconds */
export const REVALIDATE = {
  apod: 3600, // 1 hour
  mars: 21600, // 6 hours
  marsManifest: 86400, // 24 hours
  neo: 21600, // 6 hours
  neoLookup: 86400, // 24 hours
  epic: 21600, // 6 hours
  epicArchive: 86400, // 24 hours
  earth: 86400, // 24 hours
  library: 600, // 10 minutes
  libraryAsset: 86400, // 24 hours
  techtransfer: 86400, // 24 hours
} as const;

/** Rate limit defaults */
export const RATE_LIMIT = {
  default: { requests: 30, window: '60 s' },
  export: { requests: 5, window: '60 s' },
} as const;

/** Available Mars rovers */
export const ROVERS = ['curiosity', 'opportunity', 'spirit', 'perseverance'] as const;
export type Rover = (typeof ROVERS)[number];

/** Available Mars cameras */
export const CAMERAS = [
  'FHAZ',
  'RHAZ',
  'MAST',
  'CHEMCAM',
  'MAHLI',
  'MARDI',
  'NAVCAM',
  'PANCAM',
  'MINITES',
] as const;
export type Camera = (typeof CAMERAS)[number];

/** Per-source accent colors */
export const SOURCE_COLORS: Record<MediaSource, string> = {
  apod: '#7C3AED',
  mars: '#F97316',
  neo: '#EF4444',
  epic: '#22D3EE',
  library: '#34D399',
  earth: '#3B82F6',
  techtransfer: '#F59E0B',
};

export const SOURCE_LABELS: Record<MediaSource, string> = {
  apod: 'APOD',
  mars: 'Mars Rover',
  neo: 'NEO',
  epic: 'EPIC Earth',
  library: 'NASA Library',
  earth: 'Earth',
  techtransfer: 'Tech Transfer',
};

export const KIND_LABELS: Record<MediaKind, string> = {
  image: 'Image',
  video: 'Video',
  audio: 'Audio',
  dataset: 'Dataset',
  document: 'Document',
};

/** Max number of images in a ZIP export */
export const ZIP_IMAGE_CAP = 50;

/** Threshold for client vs server export */
export const CLIENT_EXPORT_THRESHOLD = 25;

/** Navigation items */
export const NAV_ITEMS = [
  { href: '/explore', label: 'Explore', icon: 'Compass' },
  { href: '/apod', label: 'APOD', icon: 'Star' },
  { href: '/mars', label: 'Mars', icon: 'Orbit' },
  { href: '/neo', label: 'NEO', icon: 'Asteroid' },
  { href: '/earth', label: 'Earth', icon: 'Globe' },
  { href: '/collections', label: 'Collections', icon: 'FolderOpen' },
  { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/about', label: 'About', icon: 'Info' },
] as const;

/** Social links */
export const SOCIAL_LINKS = {
  nasa: 'https://www.nasa.gov',
  nasaApi: 'https://api.nasa.gov',
  nasaImages: 'https://images.nasa.gov',
  github: 'https://github.com',
} as const;
