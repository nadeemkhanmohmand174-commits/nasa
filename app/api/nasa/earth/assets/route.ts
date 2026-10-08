import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { nasaFetch, earthAssetsSchema } from '@/lib/nasa/client';
import { normalizeEarthAssets } from '@/lib/nasa/normalizers';
import { apiSuccess, handleError, validateInput } from '@/lib/api/errors';
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/api/rate-limit';
import { REVALIDATE } from '@/lib/constants';

const schema = z.object({ lon: z.coerce.number(), lat: z.coerce.number(), date: z.string().optional() });

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = await checkRateLimit(ip);
  if (!rl.success) return NextResponse.json({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } }, { status: 429, headers: rateLimitHeaders(rl) });

  const { searchParams } = new URL(request.url);
  const result = validateInput(schema, Object.fromEntries(searchParams));
  if (!result.success) return result.response;

  try {
    const data = await nasaFetch('/planetary/earth/assets', earthAssetsSchema, result.data);
    return apiSuccess(normalizeEarthAssets(data, result.data.lon, result.data.lat), { count: data.count, source: 'earth' }, `s-maxage=${REVALIDATE.earth}`);
  } catch (err) { return handleError(err); }
}
