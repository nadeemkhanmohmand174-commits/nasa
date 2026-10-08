import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { nasaFetch, neoLookupSchema } from '@/lib/nasa/client';
import { normalizeNeoLookup } from '@/lib/nasa/normalizers';
import { apiSuccess, handleError } from '@/lib/api/errors';
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/api/rate-limit';
import { REVALIDATE } from '@/lib/constants';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const ip = getClientIp(request);
  const rl = await checkRateLimit(ip);
  if (!rl.success) return NextResponse.json({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } }, { status: 429, headers: rateLimitHeaders(rl) });

  try {
    const id = z.string().min(1).parse(params.id);
    const data = await nasaFetch(`/neo/rest/v1/neo/${id}`, neoLookupSchema);
    return apiSuccess(normalizeNeoLookup(data), { source: 'neo' }, `s-maxage=${REVALIDATE.neoLookup}, stale-while-revalidate=86400`);
  } catch (err) { return handleError(err); }
}
