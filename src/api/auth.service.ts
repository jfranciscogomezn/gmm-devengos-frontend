import { apiClient } from './client';
import type { LoginResponse, UserProfile } from '../types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const { data } = await apiClient.post<{ success: boolean; data: LoginResponse }>('/auth/login', credentials);
    return data.data;
  },

  async me(): Promise<UserProfile> {
    const { data } = await apiClient.get<{ success: boolean; data: UserProfile }>('/auth/me');
    return data.data;
  },

  async changePassword(request: ChangePasswordRequest): Promise<void> {
    await apiClient.patch('/auth/change-password', request);
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },
};
