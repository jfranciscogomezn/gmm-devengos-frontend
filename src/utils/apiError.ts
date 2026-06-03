import axios from 'axios';
import i18n from '../i18n';

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

const RESOURCE_KEY_MAP: Record<string, string> = {
  data: 'resources.data',
  employees: 'resources.employees',
  users: 'resources.users',
  roles: 'resources.roles',
  'time records': 'resources.timeRecords',
  'time record': 'resources.timeRecords',
  report: 'resources.report',
  'report export': 'resources.reportExport',
  'audit history': 'resources.auditHistory',
  'menu catalogue': 'resources.menuCatalogue',
  'menu node': 'resources.menuNode',
  'payroll configuration': 'resources.payrollConfig',
  tenants: 'resources.tenants',
  tenant: 'resources.tenant',
  'earnings summary': 'resources.earningsSummary',
  'incomplete records': 'resources.incompleteRecords',
  'clock-in': 'resources.clockIn',
  'clock-out': 'resources.clockOut',
};

function translateResourceLabel(resourceLabel: string): string {
  const key = RESOURCE_KEY_MAP[resourceLabel];
  if (key) {
    return i18n.t(`errors:${key}`, { defaultValue: resourceLabel });
  }
  return resourceLabel;
}

function readApiMessage(data: unknown): string | undefined {
  if (typeof data === 'object' && data !== null && 'message' in data) {
    const message = (data as ApiErrorBody).message;
    return typeof message === 'string' && message.length > 0 ? message : undefined;
  }
  return undefined;
}

export function getApiErrorDetails(error: unknown, resourceLabel = 'data'): ApiErrorDetails {
  const resource = translateResourceLabel(resourceLabel);

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const apiMessage = readApiMessage(error.response?.data);

    if (status === 403) {
      return {
        status,
        message: apiMessage ?? i18n.t('errors:forbidden'),
        isNetworkError: false,
        isForbidden: true,
        isUnauthorized: false,
      };
    }

    if (status === 401) {
      return {
        status,
        message: apiMessage ?? i18n.t('errors:unauthorized'),
        isNetworkError: false,
        isForbidden: false,
        isUnauthorized: true,
      };
    }

    if (status === 404) {
      return {
        status,
        message: apiMessage ?? i18n.t('errors:notFound', { resource }),
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
          ? i18n.t('errors:unexpectedServerError')
          : (apiMessage ?? i18n.t('errors:serverError')),
        isNetworkError: false,
        isForbidden: false,
        isUnauthorized: false,
      };
    }

    if (apiMessage) {
      if (apiMessage.includes('USER_LIMIT_REACHED')) {
        return {
          status,
          message: i18n.t('errors:userLimitReached'),
          isNetworkError: false,
          isForbidden: false,
          isUnauthorized: false,
        };
      }
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
        message: i18n.t('errors:networkError'),
        isNetworkError: true,
        isForbidden: false,
        isUnauthorized: false,
      };
    }
  }

  return {
    message: i18n.t('errors:loadFailed', { resource }),
    isNetworkError: false,
    isForbidden: false,
    isUnauthorized: false,
  };
}

export function getApiErrorMessage(error: unknown, resourceLabel = 'data'): string {
  return getApiErrorDetails(error, resourceLabel).message;
}
