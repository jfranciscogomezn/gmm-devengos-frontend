import axios from 'axios';
import { clearSession, clearToken, getToken } from './client';
export const businessClient = axios.create({
  baseURL: import.meta.env.VITE_BUSINESS_API_URL ?? 'http://localhost:8081/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

businessClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

businessClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      clearSession();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
