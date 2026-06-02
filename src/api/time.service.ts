import { businessClient } from './businessClient';
import type { TimeRecord } from '../types';

export interface TimeRecordQueryParams {
  from?: string;
  to?: string;
}

export interface AdminTimeRecordQueryParams extends TimeRecordQueryParams {
  employeeId: number;
}

export interface ResolveIncompleteRequest {
  clockOut: string;
  note: string;
}

export interface CorrectTimeRecordRequest {
  clockIn?: string;
  clockOut?: string;
  correctionReason: string;
}

export interface CreateTimeRecordRequest {
  employeeId: number;
  workDate: string;
  clockIn: string;
  clockOut: string;
  correctionReason: string;
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

  getIncomplete: async (employeeId?: number): Promise<TimeRecord[]> => {
    const { data } = await businessClient.get<TimeRecord[]>('/time-records/incomplete', {
      params: employeeId !== undefined ? { employeeId } : undefined,
    });
    return data;
  },

  reopen: async (recordId: number): Promise<TimeRecord> => {
    const { data } = await businessClient.patch<TimeRecord>(`/time-records/${recordId}/reopen`);
    return data;
  },

  resolveIncomplete: async (recordId: number, request: ResolveIncompleteRequest): Promise<TimeRecord> => {
    const { data } = await businessClient.patch<TimeRecord>(
      `/time-records/${recordId}/resolve-incomplete`,
      request
    );
    return data;
  },

  correct: async (recordId: number, request: CorrectTimeRecordRequest): Promise<TimeRecord> => {
    const { data } = await businessClient.put<TimeRecord>(`/time-records/${recordId}/correct`, request);
    return data;
  },

  createRecord: async (request: CreateTimeRecordRequest): Promise<TimeRecord> => {
    const { data } = await businessClient.post<TimeRecord>('/time-records/correct', request);
    return data;
  },
};
