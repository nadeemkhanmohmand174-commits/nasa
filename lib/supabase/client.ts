import { createBrowserClient } from '@supabase/ssr';
import { isSupabaseConfigured, getEnv } from '@/lib/env';
import type { Database } from '@/types/database';

/**
 * Browser-side Supabase client.
 * Returns null when Supabase is not configured so the app degrades gracefully.
 */
export function createClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  const env = getEnv();
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
