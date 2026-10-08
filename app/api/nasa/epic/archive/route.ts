import { NextRequest, NextResponse } from 'next/server';
import { nasaFetch, epicArchiveSchema } from '@/lib/nasa/client';
import { apiSuccess, handleError } from '@/lib/api/errors';
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/api/rate-limit';
import { REVALIDATE } from '@/lib/constants';

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = await checkRateLimit(ip);
  if (!rl.success) return NextResponse.json({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } }, { status: 429, headers: rateLimitHeaders(rl) });

  try {
    const data = await nasaFetch('/EPIC/api/natural/all', epicArchiveSchema);
    return apiSuccess(data, { count: data.length, source: 'epic' }, `s-maxage=${REVALIDATE.epicArchive}, stale-while-revalidate=86400`);
  } catch (err) { return handleError(err); }
}
