import { useQuery } from '@tanstack/react-query';
import { Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { notificationsService } from '../../api/notifications.service';
import { useAuth } from '../../context/AuthContext';

const EMPLOYEE_NOTIFICATION_TYPES = new Set([
  'TIME_RECORD_REOPENED',
  'TIME_RECORD_CORRECTED',
  'TIME_RECORD_CREATED_BY_ADMIN',
]);

export function EmployeeNotificationsBanner() {
  const { t } = useTranslation('time');
  const { hasPermission } = useAuth();
  const isEmployee = hasPermission('MY_TIME');

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', 'mine'],
    queryFn: notificationsService.listMine,
    enabled: isEmployee,
    staleTime: 60_000,
  });

  const relevant = notifications.filter(
    (n) => EMPLOYEE_NOTIFICATION_TYPES.has(n.notificationType) && !n.read,
  );

  if (!isEmployee || relevant.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      {relevant.slice(0, 3).map((notification) => (
        <Alert key={notification.id} variant="info" className="mb-2">
          <strong>
            {t(`notifications.${notification.notificationType}`, {
              date: '',
              defaultValue: notification.title,
            })}
          </strong>
          <p className="mb-0 small">{notification.message}</p>
        </Alert>
      ))}
    </div>
  );
}
