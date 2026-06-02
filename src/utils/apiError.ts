import axios from 'axios';

export interface ApiErrorBody {
  message?: string;
  status?: number;
  error?: string;
}

export interface ApiErrorDetails {
  status?: number;
  message: string;
  isNetworkError: boolean;
  isForbidden: boolean;
  isUnauthorized: boolean;
}

function readApiMessage(data: unknown): string | undefined {
  if (typeof data === 'object' && data !== null && 'message' in data) {
    const message = (data as ApiErrorBody).message;
    return typeof message === 'string' && message.length > 0 ? message : undefined;
  }
  return undefined;
}

export function getApiErrorDetails(error: unknown, resourceLabel = 'data'): ApiErrorDetails {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const apiMessage = readApiMessage(error.response?.data);

    if (status === 403) {
      return {
        status,
        message: apiMessage
          ?? 'You do not have permission to perform this action. Contact your administrator or sign in again.',
        isNetworkError: false,
        isForbidden: true,
        isUnauthorized: false,
      };
    }

    if (status === 401) {
      return {
        status,
        message: apiMessage ?? 'Your session has expired. Please sign in again.',
        isNetworkError: false,
        isForbidden: false,
        isUnauthorized: true,
      };
    }

    if (status === 404) {
      return {
        status,
        message: apiMessage ?? `The requested ${resourceLabel} was not found.`,
        isNetworkError: false,
        isForbidden: false,
        isUnauthorized: false,
      };
    }

    if (status !== undefined && status >= 500) {
      const genericServerMessage = apiMessage === 'An unexpected error occurred';
      return {
        status,
        message: genericServerMessage
          ? 'The business API returned an unexpected error. If you recently updated the frontend, restart the business backend on branch feat/time-tracking (port 8081) so time-records endpoints are available.'
          : (apiMessage ?? 'A server error occurred. Please try again later.'),
        isNetworkError: false,
        isForbidden: false,
        isUnauthorized: false,
      };
    }

    if (apiMessage) {
      return {
        status,
        message: apiMessage,
        isNetworkError: false,
        isForbidden: false,
        isUnauthorized: false,
      };
    }

    if (!error.response) {
      return {
        status,
        message: 'Unable to reach the service. Check your connection and that all backend services are running.',
        isNetworkError: true,
        isForbidden: false,
        isUnauthorized: false,
      };
    }
  }

  return {
    message: `Failed to load ${resourceLabel}.`,
    isNetworkError: false,
    isForbidden: false,
    isUnauthorized: false,
  };
}

export function getApiErrorMessage(error: unknown, resourceLabel = 'data'): string {
  return getApiErrorDetails(error, resourceLabel).message;
}
