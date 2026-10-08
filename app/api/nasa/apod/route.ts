import { NextRequest } from 'next/server';
import { z } from 'zod';
import { nasaFetch, apodSchema } from '@/lib/nasa/client';
import { normalizeApod } from '@/lib/nasa/normalizers';
import { apiSuccess, handleError, validateInput } from '@/lib/api/errors';
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/api/rate-limit';
import { REVALIDATE } from '@/lib/constants';

const schema = z.object({ date: z.string().optional() });

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = await checkRateLimit(ip);
  if (!rl.success) return NextResponse.json({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } }, { status: 429, headers: rateLimitHeaders(rl) });

  const { searchParams } = new URL(request.url);
  const result = validateInput(schema, { date: searchParams.get('date') ?? undefined });
  if (!result.success) return result.response;

  try {
    const data = await nasaFetch('/planetary/apod', apodSchema, { date: result.data.date, thumbs: true });
    return apiSuccess(normalizeApod(data), { source: 'apod', cached: true }, `s-maxage=${REVALIDATE.apod}, stale-while-revalidate=86400`);
  } catch (err) { return handleError(err); }
}

import { NextResponse } from 'next/server';
