import { businessClient } from './businessClient';
import type { TimeRecord } from '../types';

export interface TimeRecordQueryParams {
  from?: string;
  to?: string;
}

export interface AdminTimeRecordQueryParams extends TimeRecordQueryParams {
  employeeId: number;
}

export const timeService = {
  clockIn: async (): Promise<TimeRecord> => {
    const { data } = await businessClient.post<TimeRecord>('/time-records/clock-in');
    return data;
  },

  clockOut: async (): Promise<TimeRecord> => {
    const { data } = await businessClient.post<TimeRecord>('/time-records/clock-out');
    return data;
  },

  getMine: async (params: TimeRecordQueryParams = {}): Promise<TimeRecord[]> => {
    const { data } = await businessClient.get<TimeRecord[]>('/time-records/mine', { params });
    return data;
  },

  getByEmployee: async (params: AdminTimeRecordQueryParams): Promise<TimeRecord[]> => {
    const { data } = await businessClient.get<TimeRecord[]>('/time-records', { params });
    return data;
  },
};
