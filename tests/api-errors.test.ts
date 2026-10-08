import { describe, it, expect } from 'vitest';
import { errorEnvelope } from '@/lib/api/errors';

describe('API errors', () => {
  it('creates error envelope with code and message', () => {
    const result = errorEnvelope('BAD_REQUEST', 'Invalid input');
    expect(result.error.code).toBe('BAD_REQUEST');
    expect(result.error.message).toBe('Invalid input');
  });

  it('includes details when provided', () => {
    const result = errorEnvelope('VALIDATION_ERROR', 'Failed', [{ field: 'date', issue: 'required' }]);
    expect(result.error.details).toEqual([{ field: 'date', issue: 'required' }]);
  });

  it('omits details when not provided', () => {
    const result = errorEnvelope('NOT_FOUND', 'Not found');
    expect(result.error).not.toHaveProperty('details');
  });
});
