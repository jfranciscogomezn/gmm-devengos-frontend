import { Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { operationsNotificationsService } from '../../api/operationsNotifications.service';

const MAX_VISIBLE = 5;

const TYPE_VARIANT: Record<string, string> = {
  OSI_APPROVAL_PENDING: 'warning',
  OSI_HC_REJECTED: 'danger',
};

export function OsiNotificationsBanner() {
  const { t } = useTranslation('operations');
  const { hasPermission } = useAuth();
  const isOsiUser = hasPermission('OPS_OSI');

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['operations-notifications'],
    queryFn: operationsNotificationsService.listRecent,
    enabled: isOsiUser,
    staleTime: 60_000,
  });

  if (!isOsiUser) return null;
  if (isLoading) return <div className="mb-3 text-center"><Spinner size="sm" /></div>;
  if (notifications.length === 0) return null;

  const visible = notifications.slice(0, MAX_VISIBLE);

  return (
    <div className="mb-4">
      {visible.map(n => (
        <Alert key={n.id} variant={TYPE_VARIANT[n.notificationType] ?? 'info'} className="py-2 mb-2">
          <div className="d-flex justify-content-between align-items-start gap-2">
            <div>
              <strong className="d-block">{n.title}</strong>
              <small>{n.message}</small>
            </div>
            <Link
              to={`/operations/osi/${n.osiId}`}
              className={`alert-link text-nowrap small`}
            >
              {t('notifications.viewOsi')} →
            </Link>
          </div>
        </Alert>
      ))}
    </div>
  );
}
