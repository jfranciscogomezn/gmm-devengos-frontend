import axios from 'axios';

const TOKEN_KEY = 'stepcore_token';
const SESSION_KEY = 'stepcore_session';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = (): void => localStorage.removeItem(TOKEN_KEY);

export function getSession<T>(): T | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export const setSession = <T>(session: T): void =>
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));

export const clearSession = (): void => localStorage.removeItem(SESSION_KEY);

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
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
