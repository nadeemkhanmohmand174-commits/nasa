import { describe, it, expect } from 'vitest';
import { cn, slugify, formatDate, formatBytes, formatNumber, clamp, truncate, getInitials, buildFilename, randomHex, isValidUrl, safeJsonParse } from '@/lib/utils';

describe('utils', () => {
  describe('cn', () => {
    it('merges class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });
    it('handles conditional classes', () => {
      expect(cn('base', false && 'no', true && 'yes')).toBe('base yes');
    });
    it('deduplicates tailwind conflicts', () => {
      expect(cn('px-2', 'px-4')).toBe('px-4');
    });
  });

  describe('slugify', () => {
    it('converts text to slug', () => {
      expect(slugify('Hello World!')).toBe('hello-world');
    });
    it('handles special characters', () => {
      expect(slugify('Mars @ #2024!')).toBe('mars-2024');
    });
    it('handles empty string', () => {
      expect(slugify('')).toBe('');
    });
  });

  describe('formatDate', () => {
    it('formats date string', () => {
      expect(formatDate('2026-10-03T10:00:00Z')).toBe('2026-10-03');
    });
    it('handles invalid dates', () => {
      expect(formatDate('invalid')).toBe('—');
    });
  });

  describe('formatBytes', () => {
    it('formats bytes', () => { expect(formatBytes(0)).toBe('0 B'); });
    it('formats kilobytes', () => { expect(formatBytes(1024)).toBe('1 KB'); });
    it('formats megabytes', () => { expect(formatBytes(1048576)).toBe('1 MB'); });
  });

  describe('formatNumber', () => {
    it('adds commas to large numbers', () => { expect(formatNumber(1000000)).toBe('1,000,000'); });
  });

  describe('clamp', () => {
    it('clamps below min', () => { expect(clamp(5, 10, 20)).toBe(10); });
    it('clamps above max', () => { expect(clamp(25, 10, 20)).toBe(20); });
    it('returns value when in range', () => { expect(clamp(15, 10, 20)).toBe(15); });
  });

  describe('truncate', () => {
    it('truncates long text', () => { expect(truncate('Hello World', 5)).toBe('Hell…'); });
    it('returns short text unchanged', () => { expect(truncate('Hi', 5)).toBe('Hi'); });
  });

  describe('getInitials', () => {
    it('gets initials from name', () => { expect(getInitials('John Doe')).toBe('JD'); });
    it('handles single name', () => { expect(getInitials('John')).toBe('J'); });
  });

  describe('isValidUrl', () => {
    it('validates good URL', () => { expect(isValidUrl('https://example.com')).toBe(true); });
    it('rejects bad URL', () => { expect(isValidUrl('not a url')).toBe(false); });
  });

  describe('safeJsonParse', () => {
    it('parses valid JSON', () => { expect(safeJsonParse('{"a":1}', null)).toEqual({ a: 1 }); });
    it('returns fallback for invalid JSON', () => { expect(safeJsonParse('invalid', 'fallback')).toBe('fallback'); });
  });

  describe('randomHex', () => {
    it('generates correct length', () => { expect(randomHex(6)).toHaveLength(6); });
    it('generates only hex chars', () => { expect(randomHex(10)).toMatch(/^[0-9a-f]+$/); });
  });

  describe('buildFilename', () => {
    it('builds filename with prefix and extension', () => {
      const name = buildFilename('mars', 'xlsx');
      expect(name).toMatch(/^cosmos-vault_mars_\d{4}-\d{2}-\d{2}_[0-9a-f]{6}\.xlsx$/);
    });
  });
});
