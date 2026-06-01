import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { LoginResponse, MenuTreeNode, TenantSummary, UserProfile } from '../types';
import {
  clearSession,
  clearToken,
  getSession,
  getToken,
  setSession,
  setToken,
} from '../api/client';
import { isSessionTokenValid, markStaleSession } from '../utils/jwt';

const PLATFORM_ADMIN_ROLE = 'PLATFORM_ADMIN';

interface PersistedSession {
  currentUser: UserProfile;
  menu: MenuTreeNode[];
  permissions: string[];
  tenant: TenantSummary | null;
  mustChangePassword: boolean;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  token: string | null;
  currentUser: UserProfile | null;
  menu: MenuTreeNode[];
  permissions: string[];
  tenant: TenantSummary | null;
  isPlatformAdmin: boolean;
  mustChangePassword: boolean;
  login: (response: LoginResponse) => void;
  logout: () => void;
  hasPermission: (code: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function invalidateStoredSession(): void {
  clearToken();
  clearSession();
  markStaleSession();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const storedToken = getToken();
  const isValidToken = Boolean(storedToken) && isSessionTokenValid(storedToken as string);

  if (storedToken && !isValidToken) {
    invalidateStoredSession();
  }

  const restored = isValidToken ? getSession<PersistedSession>() : null;

  const [token, setTokenState] = useState<string | null>(isValidToken ? storedToken : null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(restored?.currentUser ?? null);
  const [menu, setMenu] = useState<MenuTreeNode[]>(restored?.menu ?? []);
  const [permissions, setPermissions] = useState<string[]>(restored?.permissions ?? []);
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
      menu: response.menu,
      permissions: response.permissions,
      tenant: tenantSummary,
      mustChangePassword: response.mustChangePassword,
    });

    setTokenState(response.token);
    setCurrentUser(user);
    setMenu(response.menu);
    setPermissions(response.permissions);
    setTenant(tenantSummary);
    setMustChangePassword(response.mustChangePassword);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    clearSession();
    setTokenState(null);
    setCurrentUser(null);
    setMenu([]);
    setPermissions([]);
    setTenant(null);
    setMustChangePassword(false);
  }, []);

  const hasPermission = useCallback(
    (code: string) => permissions.includes(code),
    [permissions],
  );

  const value = useMemo<AuthContextValue>(() => ({
    isAuthenticated: token !== null,
    token,
    currentUser,
    menu,
    permissions,
    tenant,
    isPlatformAdmin: currentUser?.roleName === PLATFORM_ADMIN_ROLE,
    mustChangePassword,
    login,
    logout,
    hasPermission,
  }), [token, currentUser, menu, permissions, tenant, mustChangePassword, login, logout, hasPermission]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
