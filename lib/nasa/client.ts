import { z } from 'zod';
import { getEnv } from '@/lib/env';
import { NASA_API_BASE, NASA_LIBRARY_BASE } from '@/lib/constants';
import { logger } from '@/lib/logger';

/**
 * Typed NASA API client with:
 * - Zod validation on every response
 * - AbortSignal.timeout
 * - Exponential-backoff retry (3 attempts) on 429/5xx
 * - Server-only access
 */

const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 500;
const TIMEOUT_MS = 15_000;

/** Retryable status codes */
function isRetryable(status: number): boolean {
  return status === 429 || status >= 500;
}

/** Sleep helper */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch with retry and exponential backoff.
 * Retries on 429 and 5xx responses, up to MAX_RETRIES times.
 */
async function fetchWithRetry(url: string, opts?: RequestInit): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        ...opts,
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });

      if (response.ok || !isRetryable(response.status)) {
        return response;
      }

      // Retryable error
      const backoff = INITIAL_DELAY_MS * Math.pow(2, attempt);
      logger.warn(`NASA API retry ${attempt + 1}/${MAX_RETRIES}`, {
        status: response.status,
        url,
        backoffMs: backoff,
      });
      await delay(backoff);
      lastError = new Error(`HTTP ${response.status}`);
    } catch (err) {
      // Network error or timeout
      if (err instanceof Error && err.name === 'AbortError') {
        // Timeout — retry
        const backoff = INITIAL_DELAY_MS * Math.pow(2, attempt);
        logger.warn(`NASA API timeout, retry ${attempt + 1}/${MAX_RETRIES}`, { url, backoffMs: backoff });
        await delay(backoff);
        lastError = err;
      } else if (err instanceof Error) {
        // Network error — retry
        const backoff = INITIAL_DELAY_MS * Math.pow(2, attempt);
        logger.warn(`NASA API network error, retry ${attempt + 1}/${MAX_RETRIES}`, {
          url,
          error: err.message,
          backoffMs: backoff,
        });
        await delay(backoff);
        lastError = err;
      } else {
        throw err;
      }
    }
  }

  throw lastError ?? new Error('Max retries exceeded');
}

/**
 * Fetch JSON from a NASA endpoint with Zod validation.
 * The API key is appended automatically for api.nasa.gov endpoints.
 */
export async function nasaFetch<T>(
  path: string,
  schema: z.ZodSchema<T>,
  params?: Record<string, string | number | boolean | undefined>,
  options?: { useLibraryApi?: boolean }
): Promise<T> {
  const env = getEnv();
  const base = options?.useLibraryApi ? NASA_LIBRARY_BASE : NASA_API_BASE;
  const url = new URL(path, base + '/');

  // Append API key for api.nasa.gov endpoints (not for library API)
  if (!options?.useLibraryApi) {
    url.searchParams.set('api_key', env.NASA_API_KEY);
  }

  // Append additional params
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  logger.debug(`NASA fetch: ${url.toString().replace(env.NASA_API_KEY, '***')}`);

  const response = await fetchWithRetry(url.toString());

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`NASA API error ${response.status}: ${body.slice(0, 200)}`);
  }

  const json = await response.json();
  const parsed = schema.safeParse(json);

  if (!parsed.success) {
    logger.error('NASA API response validation failed', {
      path,
      issues: parsed.error.issues,
    });
    throw new Error(`NASA API response validation failed for ${path}`);
  }

  return parsed.data;
}

/** Fetch raw image bytes (for export/proxy) */
export async function nasaFetchBuffer(url: string): Promise<Buffer> {
  const response = await fetchWithRetry(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// ─── Zod Schemas ──────────────────────────────────────────────

export const apodSchema = z.object({
  date: z.string(),
  title: z.string(),
  explanation: z.string(),
  url: z.string(),
  hdurl: z.string().optional().nullable(),
  media_type: z.enum(['image', 'video']),
  thumbnail_url: z.string().optional().nullable(),
  copyright: z.string().optional().nullable(),
  service_version: z.string().optional(),
});

export const marsPhotoSchema = z.object({
  id: z.number(),
  sol: z.number(),
  camera: z.object({
    id: z.number(),
    name: z.string(),
    rover_id: z.number(),
    full_name: z.string(),
  }),
  img_src: z.string(),
  earth_date: z.string(),
  rover: z.object({
    id: z.number(),
    name: z.string(),
    landing_date: z.string(),
    launch_date: z.string(),
    status: z.string(),
    max_sol: z.number(),
    max_date: z.string(),
    total_photos: z.number(),
    cameras: z.array(z.string()),
  }),
});

export const marsPhotosResponseSchema = z.array(marsPhotoSchema);

export const marsManifestSchema = z.object({
  photo_manifest: z.object({
    name: z.string(),
    landing_date: z.string(),
    launch_date: z.string(),
    status: z.string(),
    max_sol: z.number(),
    max_date: z.string(),
    total_photos: z.number(),
    photos: z.array(
      z.object({
        sol: z.number(),
        total_photos: z.number(),
        cameras: z.array(z.string()),
      })
    ),
  }),
});

export const neoFeedSchema = z.object({
  element_count: z.number(),
  near_earth_objects: z.record(
    z.string(),
    z.array(
      z.object({
        id: z.string(),
        neo_reference_id: z.string(),
        name: z.string(),
        absolute_magnitude_h: z.number(),
        estimated_diameter: z.object({
          kilometers: z.object({
            estimated_diameter_min: z.number(),
            estimated_diameter_max: z.number(),
          }),
        }),
        is_potentially_hazardous_asteroid: z.boolean(),
        close_approach_data: z.array(
          z.object({
            close_approach_date: z.string(),
            close_approach_date_full: z.string(),
            epoch_date_close_approach: z.number(),
            relative_velocity: z.object({
              kilometers_per_hour: z.string(),
              kilometers_per_second: z.string(),
            }),
            miss_distance: z.object({
              kilometers: z.string(),
              lunar: z.string(),
              astronomical: z.string(),
            }),
            orbiting_body: z.string(),
          })
        ),
        nasa_jpl_url: z.string(),
        is_sentry_object: z.boolean(),
      })
    )
  ),
});

export const neoLookupSchema = z.object({
  id: z.string(),
  name: z.string(),
  designation: z.string(),
  absolute_magnitude_h: z.number(),
  estimated_diameter: z.object({
    kilometers: z.object({
      estimated_diameter_min: z.number(),
      estimated_diameter_max: z.number(),
    }),
  }),
  is_potentially_hazardous_asteroid: z.boolean(),
  close_approach_data: z.array(
    z.object({
      close_approach_date: z.string(),
      relative_velocity: z.object({
        kilometers_per_hour: z.string(),
      }),
      miss_distance: z.object({
        kilometers: z.string(),
      }),
      orbiting_body: z.string(),
    })
  ),
  orbital_data: z
    .object({
      orbit_id: z.string(),
      orbit_determination_date: z.string(),
      first_observation_date: z.string(),
      last_observation_date: z.string(),
      semi_major_axis: z.string(),
      eccentricity: z.string(),
      inclination: z.string(),
      orbital_period: z.string(),
    })
    .optional(),
  nasa_jpl_url: z.string(),
});

export const epicImageSchema = z.object({
  identifier: z.string(),
  caption: z.string(),
  image: z.string(),
  date: z.string(),
  centroid_coordinates: z.object({
    lat: z.number(),
    lon: z.number(),
  }),
  dscovr_j2000_position: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  lunar_j2000_position: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  sun_j2000_position: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  attitude_quaternions: z.array(z.number()),
});

export const epicArchiveSchema = z.array(z.string());

export const earthAssetsSchema = z.object({
  count: z.number(),
  results: z.array(
    z.object({
      date: z.string(),
      id: z.string(),
      resource: z.object({
        dataset: z.string(),
        planet: z.string(),
      }),
    })
  ),
});

export const earthImagerySchema = z.object({
  date: z.string(),
  id: z.string().optional(),
  url: z.string().optional(),
  resource: z
    .object({
      dataset: z.string(),
      planet: z.string(),
    })
    .optional(),
});

export const librarySearchSchema = z.object({
  collection: z.object({
    items: z.array(
      z.object({
        href: z.string(),
        data: z.array(
          z.object({
            nasa_id: z.string(),
            title: z.string(),
            description: z.string().catch(''),
            media_type: z.string().catch(''),
            keywords: z.array(z.string()).catch([]),
            center: z.string().catch(''),
            date_created: z.string().catch(''),
            secondary_creator: z.array(z.string()).optional(),
          })
        ),
        links: z
          .array(z.object({ href: z.string(), rel: z.string(), render: z.string().optional() }))
          .catch([]),
      })
    ),
    metadata: z.object({
      total_hits: z.number().default(0),
    }),
  }),
});

export const libraryAssetSchema = z.object({
  collection: z.object({
    items: z.array(
      z.object({
        href: z.string(),
      })
    ),
  }),
});

export const techTransferSchema = z.array(
  z.tuple([
    z.string(),
    z.string(),
    z.string(),
    z.string(),
    z.string(),
    z.string(),
    z.string(),
    z.string(),
    z.string(),
  ])
);
