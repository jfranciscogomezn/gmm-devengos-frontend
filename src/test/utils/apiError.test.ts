import { describe, expect, it } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { getApiErrorDetails, getApiErrorMessage } from '../../utils/apiError';

function axiosError(status: number, data?: unknown): AxiosError {
  const error = new AxiosError('Request failed');
  error.response = {
    status,
    data,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  };
  return error;
}

describe('getApiErrorMessage', () => {
  it('returns forbidden message with backend detail', () => {
    const error = axiosError(403, {
      message: 'Access denied: insufficient permissions for this operation',
    });

    expect(getApiErrorMessage(error, 'employees')).toBe(
      'Access denied: insufficient permissions for this operation',
    );
  });

  it('returns network message when there is no response', () => {
    const error = new AxiosError('Network Error');

    const details = getApiErrorDetails(error, 'employees');
    expect(details.isNetworkError).toBe(true);
    expect(details.message).toContain('No se pudo conectar');
  });
});
