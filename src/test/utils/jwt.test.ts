import { describe, expect, it } from 'vitest';
import { isSessionTokenValid, parseJwtPayload } from '../../utils/jwt';

function buildToken(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

describe('isSessionTokenValid', () => {
  const futureExp = Math.floor(Date.now() / 1000) + 3600;

  it('accepts tenant tokens with roles and permissions', () => {
    const token = buildToken({
      exp: futureExp,
      tenant_id: '2',
      roles: ['ADMIN'],
      permissions: ['EMPLOYEE_CONFIG'],
    });

    expect(isSessionTokenValid(token)).toBe(true);
  });

  it('accepts platform admin tokens without permissions', () => {
    const token = buildToken({
      exp: futureExp,
      tenant_id: '1',
      roles: ['PLATFORM_ADMIN'],
    });

    expect(isSessionTokenValid(token)).toBe(true);
  });

  it('rejects tokens missing permissions for tenant users', () => {
    const token = buildToken({
      exp: futureExp,
      tenant_id: '2',
      roles: ['ADMIN'],
    });

    expect(isSessionTokenValid(token)).toBe(false);
  });

  it('rejects tokens missing roles claim', () => {
    const token = buildToken({
      exp: futureExp,
      tenant_id: '2',
      permissions: ['EMPLOYEE_CONFIG'],
    });

    expect(isSessionTokenValid(token)).toBe(false);
    expect(parseJwtPayload(token)?.roles).toBeUndefined();
  });
});
