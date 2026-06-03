import { Alert } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';
import { getApiErrorDetails } from '../../utils/apiError';

interface ApiErrorAlertProps {
  error: unknown;
  resourceLabel?: string;
  roleName?: string | null;
}

export function ApiErrorAlert({ error, resourceLabel = 'data', roleName }: ApiErrorAlertProps) {
  const { t } = useTranslation('errors');
  const details = getApiErrorDetails(error, resourceLabel);

  return (
    <Alert variant="danger">
      <div>{details.message}</div>
      {details.isForbidden && roleName && (
        <div className="small mt-2 mb-0">
          <Trans
            ns="errors"
            i18nKey="currentRoleHint"
            values={{ roleName }}
            components={{ strong: <strong /> }}
          />
        </div>
      )}
      {details.isNetworkError && (
        <div className="small mt-2 mb-0">
          {t('businessApiHint', {
            url: import.meta.env.VITE_BUSINESS_API_URL ?? 'http://localhost:8081/api/v1',
          })}
        </div>
      )}
    </Alert>
  );
}
