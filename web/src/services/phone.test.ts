import { describe, expect, it } from 'vitest';
import { formatPhoneBr, keepPhoneDigits } from './phone';

describe('keepPhoneDigits', () => {
  it('keeps only numeric characters', () => {
    expect(keepPhoneDigits('(11) 98765-4321')).toBe('11987654321');
  });

  it('limits the phone to 11 digits', () => {
    expect(keepPhoneDigits('11987654321999')).toBe('11987654321');
  });
});

describe('formatPhoneBr', () => {
  it('formats 11-digit mobile', () => {
    expect(formatPhoneBr('11987654321')).toBe('(11) 98765-4321');
  });

  it('formats 10-digit pattern', () => {
    expect(formatPhoneBr('1133334444')).toBe('(11) 3333-4444');
  });

  it('handles partial input progressively', () => {
    expect(formatPhoneBr('11')).toBe('(11');
    expect(formatPhoneBr('1198')).toBe('(11) 98');
  });
});
