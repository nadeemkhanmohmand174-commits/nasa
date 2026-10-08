import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { nasaFetch, apodSchema } from '@/lib/nasa/client';
import { normalizeApodArray } from '@/lib/nasa/normalizers';
import { apiSuccess, handleError, validateInput } from '@/lib/api/errors';
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/api/rate-limit';
import { REVALIDATE } from '@/lib/constants';

const schema = z.object({ start_date: z.string(), end_date: z.string().optional() });

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = await checkRateLimit(ip);
  if (!rl.success) return NextResponse.json({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } }, { status: 429, headers: rateLimitHeaders(rl) });

  const { searchParams } = new URL(request.url);
  const result = validateInput(schema, { start_date: searchParams.get('start_date') ?? '', end_date: searchParams.get('end_date') ?? undefined });
  if (!result.success) return result.response;

  try {
    const data = await nasaFetch('/planetary/apod', z.array(apodSchema), { start_date: result.data.start_date, end_date: result.data.end_date, thumbs: true });
    return apiSuccess(normalizeApodArray(data), { count: data.length, source: 'apod' }, `s-maxage=${REVALIDATE.apod}, stale-while-revalidate=86400`);
  } catch (err) { return handleError(err); }
}
