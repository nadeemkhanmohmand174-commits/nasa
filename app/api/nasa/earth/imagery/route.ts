import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { nasaFetch } from '@/lib/nasa/client';
import { normalizeEarthImagery } from '@/lib/nasa/normalizers';
import { apiSuccess, handleError, validateInput } from '@/lib/api/errors';
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/api/rate-limit';
import { REVALIDATE } from '@/lib/constants';

const schema = z.object({ lon: z.coerce.number(), lat: z.coerce.number(), date: z.string().optional(), dim: z.coerce.number().optional() });

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = await checkRateLimit(ip);
  if (!rl.success) return NextResponse.json({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } }, { status: 429, headers: rateLimitHeaders(rl) });

  const { searchParams } = new URL(request.url);
  const result = validateInput(schema, Object.fromEntries(searchParams));
  if (!result.success) return result.response;

  try {
    // Earth imagery returns image bytes or JSON depending on params; fetch the image URL directly
    const env = await import('@/lib/env').then(m => m.getEnv());
    const url = new URL('https://api.nasa.gov/planetary/earth/imagery');
    url.searchParams.set('api_key', env.NASA_API_KEY);
    url.searchParams.set('lon', String(result.data.lon));
    url.searchParams.set('lat', String(result.data.lat));
    if (result.data.date) url.searchParams.set('date', result.data.date);
    if (result.data.dim) url.searchParams.set('dim', String(result.data.dim));

    const asset = normalizeEarthImagery({ date: result.data.date ?? new Date().toISOString().split('T')[0]!, url: url.toString() }, result.data.lon, result.data.lat, result.data.date ?? new Date().toISOString().split('T')[0]!);
    return apiSuccess(asset, { source: 'earth' }, `s-maxage=${REVALIDATE.earth}`);
  } catch (err) { return handleError(err); }
}
