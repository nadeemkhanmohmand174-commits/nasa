import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { cacheImageToCloudinary } from '@/lib/cloudinary/server';
import { apiSuccess, handleError, validateInput, apiError } from '@/lib/api/errors';
import { isCloudinaryConfigured } from '@/lib/env';

const schema = z.object({ assetId: z.string(), source: z.string(), imageUrl: z.string().url() });

export async function POST(request: NextRequest) {
  if (!isCloudinaryConfigured()) {
    return apiError('BAD_REQUEST', 'Cloudinary is not configured');
  }
  const body = await request.json().catch(() => null);
  if (!body) return apiError('BAD_REQUEST', 'Invalid JSON body');
  const result = validateInput(schema, body);
  if (!result.success) return result.response;

  try {
    const cached = await cacheImageToCloudinary(result.data.assetId, result.data.source, result.data.imageUrl);
    if (!cached) return apiSuccess({ cached: false, url: result.data.imageUrl });
    return apiSuccess({ cached: true, ...cached });
  } catch (err) { return handleError(err); }
}
