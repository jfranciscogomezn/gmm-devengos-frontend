import { apiClient } from './client';
import type { UserProfile, CreateUserRequest, UpdateUserRequest } from '../types';

interface ApiListResponse<T> {
  success: boolean;
  data: T[];
}

interface ApiSingleResponse<T> {
  success: boolean;
  data: T;
}

export const usersService = {
  async findAll(): Promise<UserProfile[]> {
    const { data } = await apiClient.get<ApiListResponse<UserProfile>>('/users');
    return data.data;
  },

  async findById(id: number): Promise<UserProfile> {
    const { data } = await apiClient.get<ApiSingleResponse<UserProfile>>(`/users/${id}`);
    return data.data;
  },

  async create(request: CreateUserRequest): Promise<UserProfile> {
    const { data } = await apiClient.post<ApiSingleResponse<UserProfile>>('/users', request);
    return data.data;
  },

  async update(id: number, request: UpdateUserRequest): Promise<UserProfile> {
    const { data } = await apiClient.put<ApiSingleResponse<UserProfile>>(`/users/${id}`, request);
    return data.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },

  async setStatus(id: number, enabled: boolean): Promise<UserProfile> {
    const { data } = await apiClient.patch<ApiSingleResponse<UserProfile>>(`/users/${id}/status`, { enabled });
    return data.data;
  },

  async resetPassword(id: number): Promise<void> {
    await apiClient.post(`/users/${id}/reset-password`);
  },
};
