import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

/** Standard error codes */
export type ErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'UPSTREAM_ERROR'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR'
  | 'TIMEOUT';

/** HTTP status code mapping */
const STATUS_CODES: Record<ErrorCode, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  UPSTREAM_ERROR: 502,
  VALIDATION_ERROR: 422,
  INTERNAL_ERROR: 500,
  TIMEOUT: 504,
};

/** Build a consistent error envelope */
export function errorEnvelope(code: ErrorCode, message: string, details?: unknown) {
  return {
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  };
}

/** Send a JSON error response with the correct status code */
export function apiError(
  code: ErrorCode,
  message: string,
  details?: unknown
): NextResponse {
  const status = STATUS_CODES[code];
  logger.warn(`API error [${code}] ${status}: ${message}`);
  return NextResponse.json(errorEnvelope(code, message, details), { status });
}

/** Send a JSON success response with optional meta and cache headers */
export function apiSuccess<T>(
  data: T,
  meta?: Record<string, unknown>,
  cacheControl?: string
): NextResponse {
  const body = { data, ...(meta ? { meta } : {}) };
  const headers: Record<string, string> = {};
  if (cacheControl) {
    headers['Cache-Control'] = cacheControl;
  }
  return NextResponse.json(body, { headers });
}

/** Central error mapper — handles Zod errors, upstream fetch errors, and generic errors */
export function handleError(err: unknown): NextResponse {
  // Zod validation error
  if (err && typeof err === 'object' && 'issues' in err && Array.isArray(err.issues)) {
    const zodErr = err as { issues: { path: (string | number)[]; message: string }[] };
    const details = zodErr.issues.map((i) => ({
      path: i.path.join('.'),
      message: i.message,
    }));
    return apiError('VALIDATION_ERROR', 'Input validation failed', details);
  }

  // Timeout
  if (err instanceof Error && err.name === 'AbortError') {
    return apiError('TIMEOUT', 'Request timed out');
  }

  // Generic Error
  if (err instanceof Error) {
    logger.error('Unhandled API error', { message: err.message, stack: err.stack });
    return apiError('INTERNAL_ERROR', err.message);
  }

  // Unknown
  logger.error('Unknown API error', { err });
  return apiError('INTERNAL_ERROR', 'An unexpected error occurred');
}

/** Validate input against a Zod schema, returning either parsed data or an error response */
export function validateInput<T>(
  schema: { safeParse: (d: unknown) => { success: true; data: T } | { success: false; error: unknown } },
  input: unknown
): { success: true; data: T } | { success: false; response: NextResponse } {
  const result = schema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    response: handleError(result.error),
  };
}
