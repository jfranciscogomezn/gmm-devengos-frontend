import { apiClient } from './client';
import type { CreateMenuNodeRequest, MenuNodeAdminResponse, MenuTreeNode, UpdateMenuNodeRequest } from '../types';

interface ApiListResponse<T> {
  success: boolean;
  data: T[];
}

interface ApiSingleResponse<T> {
  success: boolean;
  data: T;
}

export const menuService = {
  async getCatalogue(): Promise<MenuTreeNode[]> {
    const { data } = await apiClient.get<ApiListResponse<MenuTreeNode>>('/menu/catalogue');
    return data.data;
  },

  async create(request: CreateMenuNodeRequest): Promise<MenuNodeAdminResponse> {
    const { data } = await apiClient.post<ApiSingleResponse<MenuNodeAdminResponse>>('/menu/nodes', request);
    return data.data;
  },

  async update(id: number, request: UpdateMenuNodeRequest): Promise<MenuNodeAdminResponse> {
    const { data } = await apiClient.put<ApiSingleResponse<MenuNodeAdminResponse>>(`/menu/nodes/${id}`, request);
    return data.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/menu/nodes/${id}`);
  },
};
