import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { nasaFetch, neoFeedSchema } from '@/lib/nasa/client';
import { extractNeoSummaries, normalizeNeo } from '@/lib/nasa/normalizers';
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
    const data = await nasaFetch('/neo/rest/v1/feed', neoFeedSchema, result.data);
    const summaries = extractNeoSummaries(data);
    return apiSuccess({ summaries, element_count: data.element_count, near_earth_objects: data.near_earth_objects }, { count: summaries.length, source: 'neo' }, `s-maxage=${REVALIDATE.neo}, stale-while-revalidate=86400`);
  } catch (err) { return handleError(err); }
}
