import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Alert, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { notificationsService } from '../../api/notifications.service';
import { useAuth } from '../../context/AuthContext';
import { formatWorkDate } from '../../utils/timeFormat';

export function AdminNotificationsBanner() {
  const { t } = useTranslation('time');
  const { hasPermission } = useAuth();
  const isTimeAdmin = hasPermission('TIME_RECORDS_ADMIN');

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', 'admin'],
    queryFn: notificationsService.listRecent,
    enabled: isTimeAdmin,
    staleTime: 60_000,
  });

  if (!isTimeAdmin || isLoading) {
    return isTimeAdmin && isLoading ? (
      <div className="mb-3 text-center"><Spinner size="sm" /></div>
    ) : null;
  }

  const incompleteAlerts = notifications.filter(
    (notification) => notification.notificationType === 'INCOMPLETE_TIME_RECORDS'
  );

  if (incompleteAlerts.length === 0) {
    return null;
  }

  const latest = incompleteAlerts[0];

  return (
    <Alert variant="warning" className="mb-4">
      <Alert.Heading className="h6">{latest.title}</Alert.Heading>
      <p className="mb-2">{latest.message}</p>
      {latest.items.length > 0 && (
        <ul className="small mb-2">
          {latest.items.map((item) => (
            <li key={`${item.employeeId}-${item.workDate}`}>
              {item.employeeName} — {formatWorkDate(item.workDate)}
            </li>
          ))}
        </ul>
      )}
      <Link to="/admin/time" className="alert-link">
        {t('adminNotificationLink')}
      </Link>
    </Alert>
  );
}
