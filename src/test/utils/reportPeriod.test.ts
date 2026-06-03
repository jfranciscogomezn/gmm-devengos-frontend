import { describe, expect, it } from 'vitest';
import { buildReportQueryParams, defaultReportPeriodState } from '../../utils/reportPeriod';
import { startOfWeek, toIsoDateString } from '../../utils/timeFormat';

describe('reportPeriod', () => {
  it('builds month query params', () => {
    const state = defaultReportPeriodState('2026-05-30');
    expect(buildReportQueryParams(state)).toEqual({ month: '2026-05' });
  });

  it('builds day query params', () => {
    const state = { ...defaultReportPeriodState('2026-05-30'), mode: 'day' as const, day: '2026-05-15' };
    expect(buildReportQueryParams(state)).toEqual({ date: '2026-05-15' });
  });

  it('builds week query params from week start date', () => {
    const weekStart = toIsoDateString(startOfWeek(new Date(2026, 4, 30)));
    const state = { ...defaultReportPeriodState('2026-05-30'), mode: 'week' as const, week: weekStart };
    expect(buildReportQueryParams(state)).toEqual({ week: weekStart });
  });

  it('builds custom range query params', () => {
    const state = {
      ...defaultReportPeriodState('2026-05-30'),
      mode: 'range' as const,
      startDate: '2026-05-01',
      endDate: '2026-05-15',
    };
    expect(buildReportQueryParams(state)).toEqual({
      startDate: '2026-05-01',
      endDate: '2026-05-15',
    });
  });
});
