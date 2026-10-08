const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

function w(filePath, content) {
  const fullPath = path.join(ROOT, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n');
  console.log('✓', filePath);
}

// ═══════════════════════════════════════════════════════════════
// NASA API ROUTES
// ═══════════════════════════════════════════════════════════════

w('app/api/nasa/apod/route.ts', `import { NextRequest } from 'next/server';
import { z } from 'zod';
import { nasaFetch, apodSchema } from '@/lib/nasa/client';
import { normalizeApod } from '@/lib/nasa/normalizers';
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
    const data = await nasaFetch('/planetary/apod', apodSchema, { date: result.data.date, thumbs: true });
    return apiSuccess(normalizeApod(data), { source: 'apod', cached: true }, \`s-maxage=\${REVALIDATE.apod}, stale-while-revalidate=86400\`);
  } catch (err) { return handleError(err); }
}

import { NextResponse } from 'next/server';
`);

w('app/api/nasa/apod/range/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { nasaFetch, apodSchema } from '@/lib/nasa/client';
import { normalizeApodArray } from '@/lib/nasa/normalizers';
import { apiSuccess, handleError, validateInput } from '@/lib/api/errors';
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/api/rate-limit';
import { REVALIDATE } from '@/lib/constants';

const schema = z.object({ start_date: z.string(), end_date: z.string().optional() });

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = await checkRateLimit(ip);
  if (!rl.success) return NextResponse.json({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } }, { status: 429, headers: rateLimitHeaders(rl) });

  const { searchParams } = new URL(request.url);
  const result = validateInput(schema, { start_date: searchParams.get('start_date') ?? '', end_date: searchParams.get('end_date') ?? undefined });
  if (!result.success) return result.response;

  try {
    const data = await nasaFetch('/planetary/apod', z.array(apodSchema), { start_date: result.data.start_date, end_date: result.data.end_date, thumbs: true });
    return apiSuccess(normalizeApodArray(data), { count: data.length, source: 'apod' }, \`s-maxage=\${REVALIDATE.apod}, stale-while-revalidate=86400\`);
  } catch (err) { return handleError(err); }
}
`);

w('app/api/nasa/mars/photos/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { nasaFetch, marsPhotosResponseSchema } from '@/lib/nasa/client';
import { normalizeMarsPhotos } from '@/lib/nasa/normalizers';
import { apiSuccess, handleError, validateInput } from '@/lib/api/errors';
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/api/rate-limit';
import { REVALIDATE } from '@/lib/constants';

const schema = z.object({
  rover: z.string().default('curiosity'),
  sol: z.coerce.number().optional(),
  earth_date: z.string().optional(),
  camera: z.string().optional(),
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
    const { rover, ...params } = result.data;
    const data = await nasaFetch(\`/mars-photos/api/v1/rovers/\${rover}/photos\`, marsPhotosResponseSchema, params);
    return apiSuccess(normalizeMarsPhotos(data), { count: data.length, rover, source: 'mars' }, \`s-maxage=\${REVALIDATE.mars}, stale-while-revalidate=86400\`);
  } catch (err) { return handleError(err); }
}
`);

w('app/api/nasa/mars/manifest/route.ts', `import { NextRequest, NextResponse } from 'next/server';
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
    const data = await nasaFetch(\`/mars-photos/api/v1/manifests/\${result.data.rover}\`, marsManifestSchema);
    return apiSuccess(data.photo_manifest, { rover: result.data.rover, source: 'mars' }, \`s-maxage=\${REVALIDATE.marsManifest}, stale-while-revalidate=86400\`);
  } catch (err) { return handleError(err); }
}
`);

w('app/api/nasa/neo/feed/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { nasaFetch, neoFeedSchema } from '@/lib/nasa/client';
import { extractNeoSummaries, normalizeNeo } from '@/lib/nasa/normalizers';
import { apiSuccess, handleError, validateInput } from '@/lib/api/errors';
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/api/rate-limit';
import { REVALIDATE } from '@/lib/constants';

const schema = z.object({ start_date: z.string(), end_date: z.string().optional() });

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = await checkRateLimit(ip);
  if (!rl.success) return NextResponse.json({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } }, { status: 429, headers: rateLimitHeaders(rl) });

  const { searchParams } = new URL(request.url);
  const result = validateInput(schema, { start_date: searchParams.get('start_date') ?? '', end_date: searchParams.get('end_date') ?? undefined });
  if (!result.success) return result.response;

  try {
    const data = await nasaFetch('/neo/rest/v1/feed', neoFeedSchema, result.data);
    const summaries = extractNeoSummaries(data);
    return apiSuccess({ summaries, element_count: data.element_count, near_earth_objects: data.near_earth_objects }, { count: summaries.length, source: 'neo' }, \`s-maxage=\${REVALIDATE.neo}, stale-while-revalidate=86400\`);
  } catch (err) { return handleError(err); }
}
`);

w('app/api/nasa/neo/[id]/route.ts', `import { NextRequest, NextResponse } from 'next/server';
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
    const data = await nasaFetch(\`/neo/rest/v1/neo/\${id}\`, neoLookupSchema);
    return apiSuccess(normalizeNeoLookup(data), { source: 'neo' }, \`s-maxage=\${REVALIDATE.neoLookup}, stale-while-revalidate=86400\`);
  } catch (err) { return handleError(err); }
}
`);

w('app/api/nasa/epic/route.ts', `import { NextRequest, NextResponse } from 'next/server';
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
    const path = datePath ? \`/EPIC/api/natural/date/\${datePath}\` : '/EPIC/api/natural';
    const data = await nasaFetch(path, z.array(epicImageSchema));
    return apiSuccess(normalizeEpicArray(data), { count: data.length, source: 'epic' }, \`s-maxage=\${REVALIDATE.epic}, stale-while-revalidate=86400\`);
  } catch (err) { return handleError(err); }
}
`);

w('app/api/nasa/epic/archive/route.ts', `import { NextRequest, NextResponse } from 'next/server';
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
    return apiSuccess(data, { count: data.length, source: 'epic' }, \`s-maxage=\${REVALIDATE.epicArchive}, stale-while-revalidate=86400\`);
  } catch (err) { return handleError(err); }
}
`);

w('app/api/nasa/earth/assets/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { nasaFetch, earthAssetsSchema } from '@/lib/nasa/client';
import { normalizeEarthAssets } from '@/lib/nasa/normalizers';
import { apiSuccess, handleError, validateInput } from '@/lib/api/errors';
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/api/rate-limit';
import { REVALIDATE } from '@/lib/constants';

const schema = z.object({ lon: z.coerce.number(), lat: z.coerce.number(), date: z.string().optional() });

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = await checkRateLimit(ip);
  if (!rl.success) return NextResponse.json({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } }, { status: 429, headers: rateLimitHeaders(rl) });

  const { searchParams } = new URL(request.url);
  const result = validateInput(schema, Object.fromEntries(searchParams));
  if (!result.success) return result.response;

  try {
    const data = await nasaFetch('/planetary/earth/assets', earthAssetsSchema, result.data);
    return apiSuccess(normalizeEarthAssets(data, result.data.lon, result.data.lat), { count: data.count, source: 'earth' }, \`s-maxage=\${REVALIDATE.earth}\`);
  } catch (err) { return handleError(err); }
}
`);

w('app/api/nasa/earth/imagery/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { nasaFetch } from '@/lib/nasa/client';
import { normalizeEarthImagery } from '@/lib/nasa/normalizers';
import { apiSuccess, handleError, validateInput } from '@/lib/api/errors';
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/api/rate-limit';
import { REVALIDATE } from '@/lib/constants';

const schema = z.object({ lon: z.coerce.number(), lat: z.coerce.number(), date: z.string().optional(), dim: z.coerce.number().optional() });

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = await checkRateLimit(ip);
  if (!rl.success) return NextResponse.json({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } }, { status: 429, headers: rateLimitHeaders(rl) });

  const { searchParams } = new URL(request.url);
  const result = validateInput(schema, Object.fromEntries(searchParams));
  if (!result.success) return result.response;

  try {
    // Earth imagery returns image bytes or JSON depending on params; fetch the image URL directly
    const env = await import('@/lib/env').then(m => m.getEnv());
    const url = new URL('https://api.nasa.gov/planetary/earth/imagery');
    url.searchParams.set('api_key', env.NASA_API_KEY);
    url.searchParams.set('lon', String(result.data.lon));
    url.searchParams.set('lat', String(result.data.lat));
    if (result.data.date) url.searchParams.set('date', result.data.date);
    if (result.data.dim) url.searchParams.set('dim', String(result.data.dim));

    const asset = normalizeEarthImagery({ date: result.data.date ?? new Date().toISOString().split('T')[0]!, url: url.toString() }, result.data.lon, result.data.lat, result.data.date ?? new Date().toISOString().split('T')[0]!);
    return apiSuccess(asset, { source: 'earth' }, \`s-maxage=\${REVALIDATE.earth}\`);
  } catch (err) { return handleError(err); }
}
`);

w('app/api/nasa/library/search/route.ts', `import { NextRequest, NextResponse } from 'next/server';
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
    const data = await nasaFetch('/search', librarySearchSchema, result.data, { useLibraryApi: true });
    const assets = normalizeLibrarySearch(data);
    return apiSuccess(assets, { count: assets.length, total: data.collection.metadata.total_hits, source: 'library' }, \`s-maxage=\${REVALIDATE.library}, stale-while-revalidate=600\`);
  } catch (err) { return handleError(err); }
}
`);

w('app/api/nasa/library/asset/[nasaId]/route.ts', `import { NextRequest, NextResponse } from 'next/server';
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
    const data = await nasaFetch(\`/asset/\${nasaId}\`, libraryAssetSchema, {}, { useLibraryApi: true });
    const urls = data.collection.items.map(i => i.href);
    return apiSuccess({ nasa_id: nasaId, urls }, { source: 'library' }, \`s-maxage=\${REVALIDATE.libraryAsset}\`);
  } catch (err) { return handleError(err); }
}
`);

w('app/api/nasa/techtransfer/route.ts', `import { NextRequest, NextResponse } from 'next/server';
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
    const data = await nasaFetch(\`/techtransfer/\${result.data.engine}/\`, techTransferSchema, { q: result.data.q });
    const assets = normalizeTechTransfer(data, result.data.engine);
    return apiSuccess(assets, { count: assets.length, source: 'techtransfer' }, \`s-maxage=\${REVALIDATE.techtransfer}\`);
  } catch (err) { return handleError(err); }
}
`);

// ═══════════════════════════════════════════════════════════════
// HEALTH
// ═══════════════════════════════════════════════════════════════
w('app/api/health/route.ts', `import { NextResponse } from 'next/server';
import { isSupabaseConfigured, isCloudinaryConfigured, isRateLimitConfigured } from '@/lib/env';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      supabase: isSupabaseConfigured(),
      cloudinary: isCloudinaryConfigured(),
      rateLimit: isRateLimitConfigured(),
    },
  });
}
`);

// ═══════════════════════════════════════════════════════════════
// CLOUDINARY
// ═══════════════════════════════════════════════════════════════
w('app/api/cloudinary/sign/route.ts', `import { NextRequest, NextResponse } from 'next/server';
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
`);

w('app/api/cloudinary/cache/route.ts', `import { NextRequest, NextResponse } from 'next/server';
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
`);

// ═══════════════════════════════════════════════════════════════
// AUTH CALLBACK
// ═══════════════════════════════════════════════════════════════
w('app/api/auth/callback/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/env';

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(new URL('/login?error=auth_not_configured', request.url));
  }
  const supabase = await createClient();
  if (!supabase) return NextResponse.redirect(new URL('/login', request.url));

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, origin));
  }
  return NextResponse.redirect(new URL('/login?error=auth_failed', origin));
}
`);

// ═══════════════════════════════════════════════════════════════
// EXPORT ROUTES
// ═══════════════════════════════════════════════════════════════
w('app/api/export/pdf/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { serverExportPdf } from '@/lib/export/server';
import { handleError, validateInput, apiError } from '@/lib/api/errors';
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/api/rate-limit';
import { buildFilename, slugify } from '@/lib/utils';
import type { MediaAsset } from '@/types';

const schema = z.object({ asset: z.custom<MediaAsset>() });

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = await checkRateLimit(ip, 5, '60 s');
  if (!rl.success) return NextResponse.json({ error: { code: 'RATE_LIMITED', message: 'Too many export requests' } }, { status: 429, headers: rateLimitHeaders(rl) });

  const body = await request.json().catch(() => null);
  if (!body) return apiError('BAD_REQUEST', 'Invalid JSON body');
  const result = validateInput(schema, body);
  if (!result.success) return result.response;

  try {
    const buffer = await serverExportPdf(result.data.asset);
    const filename = buildFilename(\`\${result.data.asset.source}-\${slugify(result.data.asset.title).slice(0, 30)}\`, 'pdf');
    return new NextResponse(buffer, {
      headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': \`attachment; filename="\${filename}"\` },
    });
  } catch (err) { return handleError(err); }
}
`);

w('app/api/export/xlsx/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { serverExportXlsx } from '@/lib/export/server';
import { handleError, validateInput, apiError } from '@/lib/api/errors';
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/api/rate-limit';
import { buildFilename } from '@/lib/utils';
import type { MediaAsset } from '@/types';

const schema = z.object({ assets: z.array(z.custom<MediaAsset>()), prefix: z.string().default('export') });

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = await checkRateLimit(ip, 5, '60 s');
  if (!rl.success) return NextResponse.json({ error: { code: 'RATE_LIMITED', message: 'Too many export requests' } }, { status: 429, headers: rateLimitHeaders(rl) });

  const body = await request.json().catch(() => null);
  if (!body) return apiError('BAD_REQUEST', 'Invalid JSON body');
  const result = validateInput(schema, body);
  if (!result.success) return result.response;

  try {
    const buffer = await serverExportXlsx(result.data.assets, result.data.prefix);
    return new NextResponse(buffer, {
      headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': \`attachment; filename="\${buildFilename(result.data.prefix, 'xlsx')}"\` },
    });
  } catch (err) { return handleError(err); }
}
`);

w('app/api/export/csv/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { serverExportCsv } from '@/lib/export/server';
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
    const buffer = await serverExportCsv(result.data.assets);
    return new NextResponse(buffer, {
      headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': \`attachment; filename="\${buildFilename('export', 'csv')}"\` },
    });
  } catch (err) { return handleError(err); }
}
`);

w('app/api/export/json/route.ts', `import { NextRequest, NextResponse } from 'next/server';
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
      headers: { 'Content-Type': 'application/json', 'Content-Disposition': \`attachment; filename="\${buildFilename('export', 'json')}"\` },
    });
  } catch (err) { return handleError(err); }
}
`);

w('app/api/export/zip/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { serverExportZip } from '@/lib/export/server';
import { handleError, validateInput, apiError } from '@/lib/api/errors';
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/api/rate-limit';
import { buildFilename } from '@/lib/utils';
import type { MediaAsset } from '@/types';

const schema = z.object({ assets: z.array(z.custom<MediaAsset>()), prefix: z.string().default('export') });

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = await checkRateLimit(ip, 5, '60 s');
  if (!rl.success) return NextResponse.json({ error: { code: 'RATE_LIMITED', message: 'Too many export requests' } }, { status: 429, headers: rateLimitHeaders(rl) });

  const body = await request.json().catch(() => null);
  if (!body) return apiError('BAD_REQUEST', 'Invalid JSON body');
  const result = validateInput(schema, body);
  if (!result.success) return result.response;

  try {
    const buffer = await serverExportZip(result.data.assets, result.data.prefix);
    return new NextResponse(buffer, {
      headers: { 'Content-Type': 'application/zip', 'Content-Disposition': \`attachment; filename="\${buildFilename(result.data.prefix, 'zip')}"\` },
    });
  } catch (err) { return handleError(err); }
}
`);

console.log('\n✅ All API routes generated');
