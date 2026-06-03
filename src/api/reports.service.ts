import { businessClient } from './businessClient';

export type HighlightLevel = 'NONE' | 'WARNING' | 'ALERT';

export interface ClassifiedMinutes {
  normal: number;
  daytimeOt: number;
  nightSurcharge: number;
  nocturnalOt: number;
}

export interface TimeReportRecord {
  timeRecordId: number;
  workDate: string;
  clockIn: string;
  clockOut: string;
  status: string;
  corrected: boolean;
  correctionReason: string | null;
  classifiedMinutes: ClassifiedMinutes;
  cappedMinutes: ClassifiedMinutes;
  uncappedEarnings: number;
  cappedEarnings: number;
  highlightLevel: HighlightLevel;
}

export interface TimeReportResponse {
  employeeId: number;
  employeeName: string;
  capped: boolean;
  records: TimeReportRecord[];
  totalUncappedEarnings: number;
  totalCappedEarnings: number;
}

export interface TimeReportQueryParams {
  employeeId?: number;
  date?: string;
  month?: string;
  week?: string;
  startDate?: string;
  endDate?: string;
}

export interface IncompleteReportError {
  message: string;
  incompleteDates?: string[];
}

export const reportsService = {
  getCappedReport: async (params: TimeReportQueryParams): Promise<TimeReportResponse> => {
    const { data } = await businessClient.get<TimeReportResponse>('/reports/time', { params });
    return data;
  },

  getUncappedReport: async (params: TimeReportQueryParams & { employeeId: number }): Promise<TimeReportResponse> => {
    const { data } = await businessClient.get<TimeReportResponse>('/reports/time/uncapped', { params });
    return data;
  },

  exportReport: async (params: TimeReportQueryParams & { cap?: boolean }): Promise<Blob> => {
    const { data } = await businessClient.get<Blob>('/reports/time/export', {
      params,
      responseType: 'blob',
    });
    return data;
  },
};
