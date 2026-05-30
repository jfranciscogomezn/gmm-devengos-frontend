import { apiClient } from './client';
import type {
  CreateTenantRequest,
  ProvisionTenantResponse,
  Tenant,
  UpdateTenantRequest,
} from '../types';

interface ApiListResponse<T> {
  success: boolean;
  data: T[];
}

interface ApiSingleResponse<T> {
  success: boolean;
  data: T;
}

export const platformService = {
  async findAll(): Promise<Tenant[]> {
    const { data } = await apiClient.get<ApiListResponse<Tenant>>('/platform/tenants');
    return data.data;
  },

  async findById(id: number): Promise<Tenant> {
    const { data } = await apiClient.get<ApiSingleResponse<Tenant>>(`/platform/tenants/${id}`);
    return data.data;
  },

  async create(request: CreateTenantRequest): Promise<ProvisionTenantResponse> {
    const { data } = await apiClient.post<ApiSingleResponse<ProvisionTenantResponse>>(
      '/platform/tenants',
      request,
    );
    return data.data;
  },

  async update(id: number, request: UpdateTenantRequest): Promise<Tenant> {
    const { data } = await apiClient.patch<ApiSingleResponse<Tenant>>(
      `/platform/tenants/${id}`,
      request,
    );
    return data.data;
  },
};
