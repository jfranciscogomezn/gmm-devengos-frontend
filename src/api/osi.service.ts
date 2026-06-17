import { businessClient } from './businessClient';
import type { Osi, OsiSummary } from '../types';

export interface CreateOsiRequest {
  clientId: number;
  origin: string;
  destination: string;
  loadWindowStart?: string;
  loadWindowEnd?: string;
  deliveryWindowStart?: string;
  deliveryWindowEnd?: string;
  commercialReference?: string;
  internalNotes?: string;
}

export interface UpdateOsiRequest {
  clientId?: number;
  origin?: string;
  destination?: string;
  loadWindowStart?: string;
  loadWindowEnd?: string;
  deliveryWindowStart?: string;
  deliveryWindowEnd?: string;
  commercialReference?: string;
  internalNotes?: string;
  status?: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const osiService = {
  list: async (params?: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    size?: number;
  }): Promise<PagedResponse<OsiSummary>> => {
    const { data } = await businessClient.get<PagedResponse<OsiSummary>>(
      '/operations/osi',
      { params },
    );
    return data;
  },

  create: async (request: CreateOsiRequest): Promise<Osi> => {
    const { data } = await businessClient.post<Osi>('/operations/osi', request);
    return data;
  },

  findById: async (id: number): Promise<Osi> => {
    const { data } = await businessClient.get<Osi>(`/operations/osi/${id}`);
    return data;
  },

  update: async (id: number, request: UpdateOsiRequest): Promise<Osi> => {
    const { data } = await businessClient.patch<Osi>(`/operations/osi/${id}`, request);
    return data;
  },

  changeOwner: async (id: number, coordinatorUserId: number): Promise<Osi> => {
    const { data } = await businessClient.patch<Osi>(`/operations/osi/${id}/owner`, {
      coordinatorUserId,
    });
    return data;
  },
};
