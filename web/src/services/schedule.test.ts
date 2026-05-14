import { describe, expect, it } from 'vitest';
import {
  formatDateTime,
  fromDatetimeLocalValue,
  isPastDatetime,
  toDatetimeLocalValue,
} from './schedule';

describe('schedule date helpers', () => {
  it('returns null for empty or invalid datetime-local values', () => {
    expect(fromDatetimeLocalValue('')).toBeNull();
    expect(fromDatetimeLocalValue('not-a-date')).toBeNull();
  });

  it('formats a date for datetime-local inputs', () => {
    expect(toDatetimeLocalValue(new Date('2026-05-13T10:30:00'))).toMatch(/2026-05-13T\d{2}:30/);
  });

  it('detects dates older than now', () => {
    expect(isPastDatetime(new Date('2026-05-13T10:29:59Z'), new Date('2026-05-13T10:30:00Z'))).toBe(
      true,
    );
    expect(isPastDatetime(new Date('2026-05-13T10:30:01Z'), new Date('2026-05-13T10:30:00Z'))).toBe(
      false,
    );
  });

  it('formats date and time for message cards', () => {
    expect(formatDateTime(new Date('2026-05-13T10:30:00'))).toContain('10:30');
  });
});
