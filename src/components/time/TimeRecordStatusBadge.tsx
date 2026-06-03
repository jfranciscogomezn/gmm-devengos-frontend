import { Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import type { TimeRecordStatus } from '../../types';

const STATUS_VARIANT: Record<TimeRecordStatus, string> = {
  OPEN: 'warning',
  CLOSED: 'success',
  INCOMPLETE: 'danger',
};

interface TimeRecordStatusBadgeProps {
  status: TimeRecordStatus;
}

export function TimeRecordStatusBadge({ status }: TimeRecordStatusBadgeProps) {
  const { t } = useTranslation('time');
  return <Badge bg={STATUS_VARIANT[status]}>{t(`status.${status}`)}</Badge>;
}
