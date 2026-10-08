import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { isSupabaseConfigured, getEnv } from '@/lib/env';
import type { Database } from '@/types/database';

/**
 * Server-side Supabase client for Server Components and Route Handlers.
 * Uses cookie-based session management.
 * Returns null when Supabase is not configured.
 */
export async function createClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const env = getEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}

/**
 * Admin Supabase client using the service role key.
 * Server-only — bypasses RLS. Use only for trusted server operations.
 */
export function createAdminClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  const env = getEnv();
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  const { createClient: createSupabaseClient } = require('@supabase/supabase-js') as typeof import('@supabase/supabase-js');
  return createSupabaseClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
