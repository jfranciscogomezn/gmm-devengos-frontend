import { apiClient } from './client';
import type { CreateRoleRequest, MenuNode, MenuTreeNode, Role, UpdateRoleRequest } from '../types';

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

  async getMenuCatalogue(): Promise<MenuTreeNode[]> {
    const { data } = await apiClient.get<ApiListResponse<MenuTreeNode>>('/menu/catalogue');
    return data.data;
  },

  async getAssignedMenuNodes(id: number): Promise<MenuNode[]> {
    const { data } = await apiClient.get<ApiListResponse<MenuNode>>(`/roles/${id}/menu-nodes`);
    return data.data;
  },

  async assignMenuNodes(id: number, menuNodeIds: number[]): Promise<Role> {
    const { data } = await apiClient.put<ApiSingleResponse<Role>>(`/roles/${id}/menu-nodes`, { menuNodeIds });
    return data.data;
  },
};
