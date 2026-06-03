import { businessClient } from './businessClient';

export interface TimeRecordAuditEntry {
  id: number;
  action: string;
  entityId: string;
  actorUserId: number | null;
  actorEmail: string | null;
  oldValue: string | null;
  newValue: string | null;
  correctionReason: string | null;
  details: string | null;
  createdAt: string;
}

export interface TimeRecordAuditQueryParams {
  from?: string;
  to?: string;
  employeeId?: number;
  userId?: number;
  limit?: number;
}

export const auditService = {
  listTimeRecords: async (params: TimeRecordAuditQueryParams = {}): Promise<TimeRecordAuditEntry[]> => {
    const { data } = await businessClient.get<TimeRecordAuditEntry[]>('/audit/time-records', { params });
    return data;
  },
};
