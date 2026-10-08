import { NextRequest, NextResponse } from 'next/server';
import { generateUploadSignature } from '@/lib/cloudinary/server';
import { apiError, apiSuccess } from '@/lib/api/errors';
import { isCloudinaryConfigured } from '@/lib/env';

export async function POST(request: NextRequest) {
  if (!isCloudinaryConfigured()) {
    return apiError('BAD_REQUEST', 'Cloudinary is not configured');
  }
  const body = await request.json().catch(() => ({}));
  const folder = typeof body.folder === 'string' ? body.folder : 'user-uploads';
  const sig = generateUploadSignature(folder);
  if (!sig) return apiError('INTERNAL_ERROR', 'Failed to generate signature');
  return apiSuccess(sig);
}
