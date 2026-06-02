import { describe, expect, it } from 'vitest';
import {
  computeDurationMinutes,
  formatDuration,
  toIsoDateString,
} from '../../utils/timeFormat';

describe('timeFormat', () => {
  it('formats local dates as ISO date strings', () => {
    expect(toIsoDateString(new Date(2026, 4, 30))).toBe('2026-05-30');
  });

  it('computes duration in minutes between clock in and out', () => {
    const minutes = computeDurationMinutes(
      '2026-05-30T08:00:00.000Z',
      '2026-05-30T17:00:00.000Z'
    );
    expect(minutes).toBe(540);
  });

  it('formats duration as hours and minutes', () => {
    expect(formatDuration(540)).toBe('9h 0m');
    expect(formatDuration(95)).toBe('1h 35m');
  });
});
