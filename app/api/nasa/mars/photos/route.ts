import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { nasaFetch, marsPhotosResponseSchema } from '@/lib/nasa/client';
import { normalizeMarsPhotos } from '@/lib/nasa/normalizers';
import { apiSuccess, handleError, validateInput } from '@/lib/api/errors';
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/api/rate-limit';
import { REVALIDATE } from '@/lib/constants';

const schema = z.object({
  rover: z.string().default('curiosity'),
  sol: z.coerce.number().optional(),
  earth_date: z.string().optional(),
  camera: z.string().optional(),
  page: z.coerce.number().optional(),
});

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = await checkRateLimit(ip);
  if (!rl.success) return NextResponse.json({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } }, { status: 429, headers: rateLimitHeaders(rl) });

  const { searchParams } = new URL(request.url);
  const result = validateInput(schema, Object.fromEntries(searchParams));
  if (!result.success) return result.response;

  try {
    const { rover, ...params } = result.data;
    const data = await nasaFetch(`/mars-photos/api/v1/rovers/${rover}/photos`, marsPhotosResponseSchema, params);
    return apiSuccess(normalizeMarsPhotos(data), { count: data.length, rover, source: 'mars' }, `s-maxage=${REVALIDATE.mars}, stale-while-revalidate=86400`);
  } catch (err) { return handleError(err); }
}
