/**
 * Tests for the apiClient 401 response interceptor.
 *
 * Ensures that:
 *  - A 401 from /auth/login does NOT trigger window.location redirect (AUTH-002, AUTH-003).
 *  - A 401 from any other endpoint DOES clear storage and redirect to /login.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios, { AxiosError } from 'axios';

// ── helpers ─────────────────────────────────────────────────────────────────

function makeAxiosError(status: number, url: string): AxiosError {
  const request = { url };
  const config = { url } as never;
  const response = { status, data: {}, headers: {}, config } as never;
  return new AxiosError('error', String(status), config, request, response);
}

// ── mocks ────────────────────────────────────────────────────────────────────

vi.mock('../../i18n', () => ({
  default: { language: 'es-CO' },
}));

vi.mock('../../i18n/locale', () => ({
  localeToAcceptLanguage: (l: string) => l,
}));

// We test the interceptor logic directly by re-importing after mocking localStorage.
// The interceptor reads clearToken / clearSession from the same module.

let locationHref = '';

describe('apiClient — 401 interceptor', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    // Mock window.location so tests don't actually navigate
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' },
    });
    locationHref = '';
    window.location.href = '';

    localStorage.setItem('stepcore_token', 'test-token');
    localStorage.setItem('stepcore_session', '{}');
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    });
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('does NOT redirect when /auth/login returns 401 (AUTH-002, AUTH-003)', async () => {
    const { apiClient } = await import('../../api/client');

    // Simulate a 401 from the login endpoint
    const error = makeAxiosError(401, '/auth/login');

    // The interceptor should reject the error WITHOUT setting window.location.href
    await expect(
      // @ts-expect-error — access private interceptors for testing
      apiClient.interceptors.response.handlers[0].rejected(error)
    ).rejects.toBeDefined();

    expect(window.location.href).toBe('');
    expect(localStorage.getItem('stepcore_token')).toBe('test-token');
  });

  it('redirects to /login when a protected endpoint returns 401', async () => {
    const { apiClient } = await import('../../api/client');

    const error = makeAxiosError(401, '/api/v1/admin/employees');

    await expect(
      // @ts-expect-error — access private interceptors for testing
      apiClient.interceptors.response.handlers[0].rejected(error)
    ).rejects.toBeDefined();

    expect(window.location.href).toBe('/login');
    expect(localStorage.getItem('stepcore_token')).toBeNull();
  });

  it('does not affect non-401 errors', async () => {
    const { apiClient } = await import('../../api/client');

    const error = makeAxiosError(500, '/api/v1/reports');

    await expect(
      // @ts-expect-error — access private interceptors for testing
      apiClient.interceptors.response.handlers[0].rejected(error)
    ).rejects.toBeDefined();

    expect(window.location.href).toBe('');
    expect(localStorage.getItem('stepcore_token')).toBe('test-token');
  });
});
