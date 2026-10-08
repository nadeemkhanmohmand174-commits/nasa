import { NextResponse } from 'next/server';
import { isSupabaseConfigured, isCloudinaryConfigured, isRateLimitConfigured } from '@/lib/env';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      supabase: isSupabaseConfigured(),
      cloudinary: isCloudinaryConfigured(),
      rateLimit: isRateLimitConfigured(),
    },
  });
}
