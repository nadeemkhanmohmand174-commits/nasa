import { z } from 'zod';

/**
 * Centralised, Zod-validated environment variable access.
 * Missing optional vars degrade gracefully; missing required vars throw
 * a clear error naming the variable.
 */

const envSchema = z.object({
  NASA_API_KEY: z.string().min(1, 'NASA_API_KEY is required'),

  NEXT_PUBLIC_SUPABASE_URL: z.string().optional().default(''),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional().default(''),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(''),

  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),

  UPSTASH_REDIS_REST_URL: z.string().optional().default(''),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional().default(''),

  NEXT_PUBLIC_SITE_URL: z.string().optional().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_NAME: z.string().optional().default('Cosmos Vault'),

  NODE_ENV: z.enum(['development', 'test', 'production']).optional().default('development'),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const missing = parsed.error.issues
      .filter((i) => i.code === 'too_small' || i.message.includes('required'))
      .map((i) => i.path.join('.'))
      .join(', ');
    throw new Error(
      `Environment validation failed. Missing or invalid: ${missing || 'see issues'}`
    );
  }
  return parsed.data;
}

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (!cachedEnv) {
    cachedEnv = loadEnv();
  }
  return cachedEnv;
}

/** True when Supabase URL + anon key are both present */
export function isSupabaseConfigured(): boolean {
  const env = getEnv();
  return env.NEXT_PUBLIC_SUPABASE_URL.length > 0 && env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0;
}

/** True when Cloudinary cloud name + API key + secret are all present */
export function isCloudinaryConfigured(): boolean {
  const env = getEnv();
  return (
    env.CLOUDINARY_CLOUD_NAME.length > 0 &&
    env.CLOUDINARY_API_KEY.length > 0 &&
    env.CLOUDINARY_API_SECRET.length > 0
  );
}

/** True when Upstash Redis URL + token are both present */
export function isRateLimitConfigured(): boolean {
  const env = getEnv();
  return env.UPSTASH_REDIS_REST_URL.length > 0 && env.UPSTASH_REDIS_REST_TOKEN.length > 0;
}

/** Whether the CLOUDINARY_CLOUD_NAME matches the public variant */
export function validateCloudinaryConsistency(): boolean {
  const env = getEnv();
  if (!env.CLOUDINARY_CLOUD_NAME && !env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) return true;
  return env.CLOUDINARY_CLOUD_NAME === env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
}
