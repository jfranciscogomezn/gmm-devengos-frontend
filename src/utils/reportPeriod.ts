import i18n from '../i18n';
import type { TimeReportQueryParams } from '../api/reports.service';
import { startOfWeek, toIsoDateString } from './timeFormat';

export type ReportFilterMode = 'month' | 'day' | 'week' | 'range';

export interface ReportPeriodState {
  mode: ReportFilterMode;
  month: string;
  day: string;
  week: string;
  startDate: string;
  endDate: string;
}

export function defaultReportPeriodState(today: string): ReportPeriodState {
  return {
    mode: 'month',
    month: today.slice(0, 7),
    day: today,
    week: toIsoDateString(startOfWeek(new Date(`${today}T12:00:00`))),
    startDate: `${today.slice(0, 7)}-01`,
    endDate: today,
  };
}

export function buildReportQueryParams(state: ReportPeriodState): TimeReportQueryParams {
  switch (state.mode) {
    case 'month':
      return { month: state.month };
    case 'day':
      return { date: state.day };
    case 'week':
      return { week: state.week };
    case 'range':
      return { startDate: state.startDate, endDate: state.endDate };
    default: {
      const exhaustive: never = state.mode;
      throw new Error(`Unsupported report filter mode: ${exhaustive}`);
    }
  }
}

export function reportPeriodLabel(state: ReportPeriodState): string {
  switch (state.mode) {
    case 'month':
      return state.month;
    case 'day':
      return state.day;
    case 'week':
      return i18n.t('reports:period.weekOf', { date: state.week });
    case 'range':
      return `${state.startDate} – ${state.endDate}`;
    default:
      return '';
  }
}
