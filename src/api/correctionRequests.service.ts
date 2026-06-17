import { businessClient } from './businessClient';

export interface CorrectionRequest {
  id: number;
  timeRecordId: number;
  employeeId: number;
  employeeName: string;
  recordDate: string | null;
  note: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  resolutionNote: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

export const correctionRequestsService = {
  create: async (timeRecordId: number, note: string): Promise<CorrectionRequest> => {
    const { data } = await businessClient.post<CorrectionRequest>(
      `/time-records/${timeRecordId}/correction-request`,
      { note },
    );
    return data;
  },

  listMine: async (): Promise<CorrectionRequest[]> => {
    const { data } = await businessClient.get<CorrectionRequest[]>(
      '/time-correction-requests/mine',
    );
    return data;
  },

  getPending: async (): Promise<CorrectionRequest[]> => {
    const { data } = await businessClient.get<CorrectionRequest[]>(
      '/time-correction-requests',
      { params: { status: 'PENDING' } },
    );
    return data;
  },

  dismiss: async (requestId: number, dismissalReason: string): Promise<CorrectionRequest> => {
    const { data } = await businessClient.patch<CorrectionRequest>(
      `/time-correction-requests/${requestId}/dismiss`,
      { dismissalReason },
    );
    return data;
  },
};
