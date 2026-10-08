import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { nasaFetch, libraryAssetSchema } from '@/lib/nasa/client';
import { apiSuccess, handleError } from '@/lib/api/errors';
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/api/rate-limit';
import { REVALIDATE } from '@/lib/constants';

export async function GET(request: NextRequest, { params }: { params: { nasaId: string } }) {
  const ip = getClientIp(request);
  const rl = await checkRateLimit(ip);
  if (!rl.success) return NextResponse.json({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } }, { status: 429, headers: rateLimitHeaders(rl) });

  try {
    const nasaId = z.string().min(1).parse(params.nasaId);
    const data = await nasaFetch(`/asset/${nasaId}`, libraryAssetSchema, {}, { useLibraryApi: true });
    const urls = data.collection.items.map(i => i.href);
    return apiSuccess({ nasa_id: nasaId, urls }, { source: 'library' }, `s-maxage=${REVALIDATE.libraryAsset}`);
  } catch (err) { return handleError(err); }
}
