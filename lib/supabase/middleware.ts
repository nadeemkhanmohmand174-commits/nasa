import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured, getEnv } from '@/lib/env';

/**
 * Refresh the Supabase session on every request.
 * When Supabase is not configured, passes the request through unchanged.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  if (!isSupabaseConfigured()) {
    return response;
  }

  const env = getEnv();

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response = NextResponse.next({ request });
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh the session (important for RLS)
  await supabase.auth.getUser();

  return response;
}
