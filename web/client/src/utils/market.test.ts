import { describe, it, expect } from 'vitest';
import { isMarketOpen } from './market';

describe('isMarketOpen', () => {
  it('should return true when market is open (Monday 12:00 ART)', () => {
    // ART is UTC-3, so 12:00 ART is 15:00 UTC
    // 2024-04-15 is a Monday
    const date = new Date('2024-04-15T15:00:00Z');
    expect(isMarketOpen(date)).toBe(true);
  });

  it('should return true when market just opens (Monday 10:00 ART)', () => {
    // 10:00 ART is 13:00 UTC
    const date = new Date('2024-04-15T13:00:00Z');
    expect(isMarketOpen(date)).toBe(true);
  });

  it('should return true when market is about to close (Monday 14:59 ART)', () => {
    // 14:59 ART is 17:59 UTC
    const date = new Date('2024-04-15T17:59:00Z');
    expect(isMarketOpen(date)).toBe(true);
  });

  it('should return false when market is closed (Monday 09:59 ART)', () => {
    // 09:59 ART is 12:59 UTC
    const date = new Date('2024-04-15T12:59:00Z');
    expect(isMarketOpen(date)).toBe(false);
  });

  it('should return false when market is closed (Monday 15:00 ART)', () => {
    // 15:00 ART is 18:00 UTC
    const date = new Date('2024-04-15T18:00:00Z');
    expect(isMarketOpen(date)).toBe(false);
  });

  it('should return false when market is closed (Monday 18:00 ART)', () => {
    // 18:00 ART is 21:00 UTC
    const date = new Date('2024-04-15T21:00:00Z');
    expect(isMarketOpen(date)).toBe(false);
  });

  it('should return false on Saturday at 12:00 ART', () => {
    // 2024-04-20 is a Saturday
    // 12:00 ART is 15:00 UTC
    const date = new Date('2024-04-20T15:00:00Z');
    expect(isMarketOpen(date)).toBe(false);
  });

  it('should return false on Sunday at 12:00 ART', () => {
    // 2024-04-21 is a Sunday
    // 12:00 ART is 15:00 UTC
    const date = new Date('2024-04-21T15:00:00Z');
    expect(isMarketOpen(date)).toBe(false);
  });

  it('should handle UTC boundary properly (e.g. late night UTC, early morning ART)', () => {
    // Let's test Tuesday 01:00 UTC -> Monday 22:00 ART
    // 2024-04-16T01:00:00Z is Tuesday in UTC, Monday in ART.
    // However, the function checks the UTC day, so we need to be careful with day boundaries.
    // Oh, wait, the original logic checks `const day = now.getUTCDay()`.
    // Let's test what happens at 01:00 UTC on Tuesday (Monday 22:00 ART).
    // utcHour = 1, argHour = (1 - 3 + 24) % 24 = 22.
    // UTC day is 2 (Tuesday), which is between 1 and 5.
    // Return value depends on argHour (22 < 15 is false).
    // Let's test an edge case where it's 01:00 UTC on Monday (Sunday 22:00 ART).
    const date = new Date('2024-04-15T01:00:00Z');
    expect(isMarketOpen(date)).toBe(false);
  });
});
