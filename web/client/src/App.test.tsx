import { describe, it, expect } from 'vitest';
import { formatNumber } from './App';

describe('formatNumber utility', () => {
  it('handles null, undefined, and empty string', () => {
    expect(formatNumber(null)).toBe('');
    expect(formatNumber(undefined)).toBe('');
    expect(formatNumber('')).toBe('');
  });

  it('handles regular numbers', () => {
    // 1000.5 becomes 1.000,50 in de-DE
    expect(formatNumber(1000.5)).toBe('1.000,50');
    expect(formatNumber(42)).toBe('42,00');
    expect(formatNumber(0)).toBe('0,00');
  });

  it('handles string numbers', () => {
    expect(formatNumber('1234.56')).toBe('1.234,56');
    expect(formatNumber('0')).toBe('0,00');
  });

  it('handles non-numeric strings (NaN cases)', () => {
    expect(formatNumber('not a number')).toBe('not a number');
    expect(formatNumber('abc')).toBe('abc');
  });

  it('handles edge case formatting rounding', () => {
    expect(formatNumber(10.123)).toBe('10,12');
    expect(formatNumber(10.128)).toBe('10,13');
  });
});
