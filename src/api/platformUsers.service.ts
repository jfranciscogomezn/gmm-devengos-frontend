import { apiClient } from './client';
import type { PlatformUser } from '../types/index';

interface ApiListResponse<T> {
  success: boolean;
  data: T[];
}

interface ApiSingleResponse<T> {
  success: boolean;
  data: T;
}

export const platformUsersService = {
  async listByTenant(tenantId: number): Promise<PlatformUser[]> {
    const { data } = await apiClient.get<ApiListResponse<PlatformUser>>(
      `/platform/tenants/${tenantId}/users`,
    );
    return data.data;
  },

  async setUserStatus(tenantId: number, userId: number, enabled: boolean): Promise<PlatformUser> {
    const { data } = await apiClient.patch<ApiSingleResponse<PlatformUser>>(
      `/platform/tenants/${tenantId}/users/${userId}/status`,
      { enabled },
    );
    return data.data;
  },
};
