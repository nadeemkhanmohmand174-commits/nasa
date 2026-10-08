import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { nasaFetch, marsManifestSchema } from '@/lib/nasa/client';
import { apiSuccess, handleError, validateInput } from '@/lib/api/errors';
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/api/rate-limit';
import { REVALIDATE } from '@/lib/constants';

const schema = z.object({ rover: z.string().default('curiosity') });

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = await checkRateLimit(ip);
  if (!rl.success) return NextResponse.json({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } }, { status: 429, headers: rateLimitHeaders(rl) });

  const { searchParams } = new URL(request.url);
  const result = validateInput(schema, { rover: searchParams.get('rover') ?? 'curiosity' });
  if (!result.success) return result.response;

  try {
    const data = await nasaFetch(`/mars-photos/api/v1/manifests/${result.data.rover}`, marsManifestSchema);
    return apiSuccess(data.photo_manifest, { rover: result.data.rover, source: 'mars' }, `s-maxage=${REVALIDATE.marsManifest}, stale-while-revalidate=86400`);
  } catch (err) { return handleError(err); }
}
