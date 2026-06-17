import { businessClient } from './businessClient';
import type { Client } from '../types';

export interface CreateClientRequest {
  name: string;
  taxId?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  internalNotes?: string;
}

export interface UpdateClientRequest {
  name?: string;
  taxId?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  internalNotes?: string;
  status?: string;
}

export const clientsService = {
  findAll: async (activeOnly = false): Promise<Client[]> => {
    const { data } = await businessClient.get<Client[]>('/operations/clients', {
      params: { activeOnly },
    });
    return data;
  },

  create: async (request: CreateClientRequest): Promise<Client> => {
    const { data } = await businessClient.post<Client>('/operations/clients', request);
    return data;
  },

  findById: async (id: number): Promise<Client> => {
    const { data } = await businessClient.get<Client>(`/operations/clients/${id}`);
    return data;
  },

  update: async (id: number, request: UpdateClientRequest): Promise<Client> => {
    const { data } = await businessClient.patch<Client>(`/operations/clients/${id}`, request);
    return data;
  },
};
