import { apiClient } from './client';
import type { Role, MenuOption, CreateRoleRequest, UpdateRoleRequest } from '../types';

interface ApiListResponse<T> {
  success: boolean;
  data: T[];
}

interface ApiSingleResponse<T> {
  success: boolean;
  data: T;
}

export const rolesService = {
  async findAll(): Promise<Role[]> {
    const { data } = await apiClient.get<ApiListResponse<Role>>('/roles');
    return data.data;
  },

  async findById(id: number): Promise<Role> {
    const { data } = await apiClient.get<ApiSingleResponse<Role>>(`/roles/${id}`);
    return data.data;
  },

  async create(request: CreateRoleRequest): Promise<Role> {
    const { data } = await apiClient.post<ApiSingleResponse<Role>>('/roles', request);
    return data.data;
  },

  async update(id: number, request: UpdateRoleRequest): Promise<Role> {
    const { data } = await apiClient.put<ApiSingleResponse<Role>>(`/roles/${id}`, request);
    return data.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/roles/${id}`);
  },

  async getMenuOptions(id: number): Promise<MenuOption[]> {
    const { data } = await apiClient.get<ApiListResponse<MenuOption>>(`/roles/${id}/menu-options`);
    return data.data;
  },

  async assignMenuOptions(id: number, menuOptionIds: number[]): Promise<Role> {
    const { data } = await apiClient.put<ApiSingleResponse<Role>>(`/roles/${id}/menu-options`, { menuOptionIds });
    return data.data;
  },

  async getAllMenuOptions(): Promise<MenuOption[]> {
    const { data } = await apiClient.get<ApiListResponse<MenuOption>>('/roles/menu-options/all');
    return data.data;
  },
};
