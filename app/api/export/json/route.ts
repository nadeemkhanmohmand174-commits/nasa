import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { serverExportJson } from '@/lib/export/server';
import { handleError, validateInput, apiError } from '@/lib/api/errors';
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/api/rate-limit';
import { buildFilename } from '@/lib/utils';
import type { MediaAsset } from '@/types';

const schema = z.object({ assets: z.array(z.custom<MediaAsset>()) });

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = await checkRateLimit(ip, 5, '60 s');
  if (!rl.success) return NextResponse.json({ error: { code: 'RATE_LIMITED', message: 'Too many export requests' } }, { status: 429, headers: rateLimitHeaders(rl) });

  const body = await request.json().catch(() => null);
  if (!body) return apiError('BAD_REQUEST', 'Invalid JSON body');
  const result = validateInput(schema, body);
  if (!result.success) return result.response;

  try {
    const buffer = await serverExportJson(result.data.assets);
    return new NextResponse(buffer, {
      headers: { 'Content-Type': 'application/json', 'Content-Disposition': `attachment; filename="${buildFilename('export', 'json')}"` },
    });
  } catch (err) { return handleError(err); }
}
