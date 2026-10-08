import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { nasaFetch, epicImageSchema } from '@/lib/nasa/client';
import { normalizeEpicArray } from '@/lib/nasa/normalizers';
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
    const datePath = result.data.date ?? '';
    const path = datePath ? `/EPIC/api/natural/date/${datePath}` : '/EPIC/api/natural';
    const data = await nasaFetch(path, z.array(epicImageSchema));
    return apiSuccess(normalizeEpicArray(data), { count: data.length, source: 'epic' }, `s-maxage=${REVALIDATE.epic}, stale-while-revalidate=86400`);
  } catch (err) { return handleError(err); }
}
