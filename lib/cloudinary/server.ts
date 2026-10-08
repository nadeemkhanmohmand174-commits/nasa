import { v2 as cloudinary } from 'cloudinary';
import { isCloudinaryConfigured, getEnv } from '@/lib/env';
import { logger } from '@/lib/logger';

/**
 * Server-side Cloudinary configuration.
 * All Cloudinary operations are wrapped in try/catch — Cloudinary being
 * down must NEVER break the site.
 */

let configured = false;

function ensureConfigured() {
  if (configured) return true;
  if (!isCloudinaryConfigured()) return false;
  const env = getEnv();
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
  return true;
}

/** Cloudinary transform presets */
export const TRANSFORMS = {
  thumb: { width: 200, quality: 'auto', fetch_format: 'auto', crop: 'fill' },
  grid: { width: 600, quality: 'auto', fetch_format: 'auto', crop: 'fill' },
  lightbox: { width: 1920, quality: 'auto', fetch_format: 'auto' },
} as const;

/** Build a Cloudinary URL with a transform from a remote URL */
export function buildCloudinaryUrl(
  remoteUrl: string,
  transform: keyof typeof TRANSFORMS = 'grid'
): string {
  if (!ensureConfigured() || !remoteUrl) {
    return remoteUrl;
  }
  try {
    return cloudinary.url(remoteUrl, {
      ...TRANSFORMS[transform],
      type: 'fetch',
    });
  } catch (err) {
    logger.warn('Cloudinary URL build failed, returning original', { error: (err as Error).message });
    return remoteUrl;
  }
}

/**
 * Cache a NASA image to Cloudinary and return the CDN URL.
 * Idempotent — returns existing cached URL if already cached.
 */
export async function cacheImageToCloudinary(
  assetId: string,
  source: string,
  imageUrl: string
): Promise<{ publicId: string; secureUrl: string } | null> {
  if (!ensureConfigured()) {
    return null;
  }

  try {
    const publicId = `cosmos-vault/${source}/${assetId}`;

    // Try to find existing
    try {
      const existing = await cloudinary.api.resource(publicId);
      return {
        publicId: existing.public_id,
        secureUrl: existing.secure_url,
      };
    } catch {
      // Doesn't exist yet — proceed to upload
    }

    // Upload via fetch (remote URL)
    const result = await cloudinary.uploader.upload(imageUrl, {
      public_id: publicId,
      overwrite: false,
      resource_type: 'image',
      tags: ['cosmos-vault', source],
    });

    return {
      publicId: result.public_id,
      secureUrl: result.secure_url,
    };
  } catch (err) {
    logger.warn('Cloudinary cache failed, returning null', {
      assetId,
      error: (err as Error).message,
    });
    return null;
  }
}

/**
 * Generate a signed upload signature for client-side uploads.
 * The API secret never reaches the client.
 */
export function generateUploadSignature(folder: string = 'user-uploads') {
  if (!ensureConfigured()) {
    return null;
  }

  try {
    const timestamp = Math.round(Date.now() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      getEnv().CLOUDINARY_API_SECRET
    );

    return {
      timestamp,
      signature,
      apiKey: getEnv().CLOUDINARY_API_KEY,
      cloudName: getEnv().CLOUDINARY_CLOUD_NAME,
      folder,
    };
  } catch (err) {
    logger.error('Cloudinary signature generation failed', { error: (err as Error).message });
    return null;
  }
}
