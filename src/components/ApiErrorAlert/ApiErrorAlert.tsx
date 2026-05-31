import { Alert } from 'react-bootstrap';
import { getApiErrorDetails } from '../../utils/apiError';

interface ApiErrorAlertProps {
  error: unknown;
  resourceLabel?: string;
  roleName?: string | null;
}

export function ApiErrorAlert({ error, resourceLabel = 'data', roleName }: ApiErrorAlertProps) {
  const details = getApiErrorDetails(error, resourceLabel);

  return (
    <Alert variant="danger">
      <div>{details.message}</div>
      {details.isForbidden && roleName && (
        <div className="small mt-2 mb-0">
          Current role: <strong>{roleName}</strong>. If you recently received new permissions, sign out and sign in again.
        </div>
      )}
      {details.isNetworkError && (
        <div className="small mt-2 mb-0">
          Business API: {import.meta.env.VITE_BUSINESS_API_URL ?? 'http://localhost:8081/api/v1'}
        </div>
      )}
    </Alert>
  );
}
