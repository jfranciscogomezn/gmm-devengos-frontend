export interface JwtPayload {
  exp?: number;
  tenant_id?: string;
  roles?: string[];
  permissions?: string[];
}

export const STALE_SESSION_KEY = 'stepcore_stale_session';

export function parseJwtPayload(token: string): JwtPayload | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    return JSON.parse(atob(payload)) as JwtPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = parseJwtPayload(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 < Date.now();
}

export function isSessionTokenValid(token: string): boolean {
  const payload = parseJwtPayload(token);
  if (!payload?.exp || payload.exp * 1000 < Date.now()) return false;
  if (!payload.tenant_id) return false;
  if (!payload.roles?.length) return false;

  const isPlatformAdmin = payload.roles.includes('PLATFORM_ADMIN');
  if (!isPlatformAdmin && !payload.permissions?.length) return false;

  return true;
}

export function markStaleSession(): void {
  sessionStorage.setItem(STALE_SESSION_KEY, 'true');
}

export function consumeStaleSessionFlag(): boolean {
  const stale = sessionStorage.getItem(STALE_SESSION_KEY) === 'true';
  if (stale) {
    sessionStorage.removeItem(STALE_SESSION_KEY);
  }
  return stale;
}
