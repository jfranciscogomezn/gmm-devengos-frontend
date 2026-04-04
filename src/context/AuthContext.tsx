import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { LoginResponse, MenuOption, UserProfile } from '../types';
import { clearToken, getToken, setToken } from '../api/client';

interface AuthContextValue {
  isAuthenticated: boolean;
  token: string | null;
  currentUser: UserProfile | null;
  menuOptions: MenuOption[];
  mustChangePassword: boolean;
  login: (response: LoginResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function parseJwtPayload(token: string): { exp?: number } | null {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload)) as { exp?: number };
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = parseJwtPayload(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 < Date.now();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const storedToken = getToken();
  const isValidToken = storedToken && !isTokenExpired(storedToken);

  const [token, setTokenState] = useState<string | null>(isValidToken ? storedToken : null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [menuOptions, setMenuOptions] = useState<MenuOption[]>([]);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  useEffect(() => {
    if (!isValidToken && storedToken) {
      clearToken();
    }
  }, [isValidToken, storedToken]);

  const login = useCallback((response: LoginResponse) => {
    setToken(response.token);
    setTokenState(response.token);
    setCurrentUser({
      id: 0,
      firstName: response.fullName.split(' ')[0],
      lastName: response.fullName.split(' ').slice(1).join(' '),
      email: response.email,
      phone: null,
      roleName: response.roleName,
      enabled: true,
      mustChangePassword: response.mustChangePassword,
    });
    setMenuOptions(response.menuOptions);
    setMustChangePassword(response.mustChangePassword);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
    setCurrentUser(null);
    setMenuOptions([]);
    setMustChangePassword(false);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    isAuthenticated: token !== null,
    token,
    currentUser,
    menuOptions,
    mustChangePassword,
    login,
    logout,
  }), [token, currentUser, menuOptions, mustChangePassword, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
