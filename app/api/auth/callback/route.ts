import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/env';

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(new URL('/login?error=auth_not_configured', request.url));
  }
  const supabase = await createClient();
  if (!supabase) return NextResponse.redirect(new URL('/login', request.url));

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, origin));
  }
  return NextResponse.redirect(new URL('/login?error=auth_failed', origin));
}
