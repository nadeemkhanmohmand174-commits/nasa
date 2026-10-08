import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { nasaFetch, librarySearchSchema } from '@/lib/nasa/client';
import { normalizeLibrarySearch } from '@/lib/nasa/normalizers';
import { apiSuccess, handleError, validateInput } from '@/lib/api/errors';
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/api/rate-limit';
import { REVALIDATE } from '@/lib/constants';

const schema = z.object({
  q: z.string().default(''),
  media_type: z.string().optional(),
  year_start: z.string().optional(),
  year_end: z.string().optional(),
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
    const data = await nasaFetch('/search', librarySearchSchema, result.data, { useLibraryApi: true }) as z.infer<typeof librarySearchSchema>;
    const assets = normalizeLibrarySearch(data);
    return apiSuccess(assets, { count: assets.length, total: data.collection.metadata.total_hits, source: 'library' }, `s-maxage=${REVALIDATE.library}, stale-while-revalidate=600`);
  } catch (err) { return handleError(err); }
}
