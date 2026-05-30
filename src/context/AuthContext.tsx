import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { LoginResponse, MenuOption, TenantSummary, UserProfile } from '../types';
import {
  clearSession,
  clearToken,
  getSession,
  getToken,
  setSession,
  setToken,
} from '../api/client';

const PLATFORM_ADMIN_ROLE = 'PLATFORM_ADMIN';

interface PersistedSession {
  currentUser: UserProfile;
  menuOptions: MenuOption[];
  tenant: TenantSummary | null;
  mustChangePassword: boolean;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  token: string | null;
  currentUser: UserProfile | null;
  menuOptions: MenuOption[];
  tenant: TenantSummary | null;
  isPlatformAdmin: boolean;
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
  const isValidToken = Boolean(storedToken) && !isTokenExpired(storedToken as string);

  if (!isValidToken && storedToken) {
    clearToken();
    clearSession();
  }

  const restored = isValidToken ? getSession<PersistedSession>() : null;

  const [token, setTokenState] = useState<string | null>(isValidToken ? storedToken : null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(restored?.currentUser ?? null);
  const [menuOptions, setMenuOptions] = useState<MenuOption[]>(restored?.menuOptions ?? []);
  const [tenant, setTenant] = useState<TenantSummary | null>(restored?.tenant ?? null);
  const [mustChangePassword, setMustChangePassword] = useState(restored?.mustChangePassword ?? false);

  const login = useCallback((response: LoginResponse) => {
    const user: UserProfile = {
      id: 0,
      firstName: response.fullName.split(' ')[0],
      lastName: response.fullName.split(' ').slice(1).join(' '),
      email: response.email,
      phone: null,
      roleName: response.roleName,
      enabled: true,
      mustChangePassword: response.mustChangePassword,
    };
    const tenantSummary: TenantSummary = {
      slug: response.tenantSlug,
      name: response.tenantName,
      plan: response.tenantPlan,
    };

    setToken(response.token);
    setSession<PersistedSession>({
      currentUser: user,
      menuOptions: response.menuOptions,
      tenant: tenantSummary,
      mustChangePassword: response.mustChangePassword,
    });

    setTokenState(response.token);
    setCurrentUser(user);
    setMenuOptions(response.menuOptions);
    setTenant(tenantSummary);
    setMustChangePassword(response.mustChangePassword);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    clearSession();
    setTokenState(null);
    setCurrentUser(null);
    setMenuOptions([]);
    setTenant(null);
    setMustChangePassword(false);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    isAuthenticated: token !== null,
    token,
    currentUser,
    menuOptions,
    tenant,
    isPlatformAdmin: currentUser?.roleName === PLATFORM_ADMIN_ROLE,
    mustChangePassword,
    login,
    logout,
  }), [token, currentUser, menuOptions, tenant, mustChangePassword, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
