import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { nasaFetch, techTransferSchema } from '@/lib/nasa/client';
import { normalizeTechTransfer } from '@/lib/nasa/normalizers';
import { apiSuccess, handleError, validateInput } from '@/lib/api/errors';
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/api/rate-limit';
import { REVALIDATE } from '@/lib/constants';

const schema = z.object({ engine: z.string().default('patent'), q: z.string().optional() });

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = await checkRateLimit(ip);
  if (!rl.success) return NextResponse.json({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } }, { status: 429, headers: rateLimitHeaders(rl) });

  const { searchParams } = new URL(request.url);
  const result = validateInput(schema, Object.fromEntries(searchParams));
  if (!result.success) return result.response;

  try {
    const data = await nasaFetch(`/techtransfer/${result.data.engine}/`, techTransferSchema, { q: result.data.q });
    const assets = normalizeTechTransfer(data, result.data.engine);
    return apiSuccess(assets, { count: assets.length, source: 'techtransfer' }, `s-maxage=${REVALIDATE.techtransfer}`);
  } catch (err) { return handleError(err); }
}
