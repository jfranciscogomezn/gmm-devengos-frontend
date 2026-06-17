import { businessClient } from './businessClient';
import type { Vehicle } from '../types';

export interface CreateVehicleRequest {
  plate: string;
  type?: string;
  brand?: string;
  model?: string;
  year?: number;
  internalNotes?: string;
}

export interface UpdateVehicleRequest {
  type?: string;
  brand?: string;
  model?: string;
  year?: number;
  status?: string;
  internalNotes?: string;
}

export const vehiclesService = {
  findAll: async (status?: string): Promise<Vehicle[]> => {
    const { data } = await businessClient.get<Vehicle[]>('/operations/vehicles', {
      params: status ? { status } : undefined,
    });
    return data;
  },

  create: async (request: CreateVehicleRequest): Promise<Vehicle> => {
    const { data } = await businessClient.post<Vehicle>('/operations/vehicles', request);
    return data;
  },

  findById: async (id: number): Promise<Vehicle> => {
    const { data } = await businessClient.get<Vehicle>(`/operations/vehicles/${id}`);
    return data;
  },

  update: async (id: number, request: UpdateVehicleRequest): Promise<Vehicle> => {
    const { data } = await businessClient.patch<Vehicle>(`/operations/vehicles/${id}`, request);
    return data;
  },
};
