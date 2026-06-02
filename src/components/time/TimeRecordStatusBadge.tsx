import { Badge } from 'react-bootstrap';
import type { TimeRecordStatus } from '../../types';

const STATUS_VARIANT: Record<TimeRecordStatus, string> = {
  OPEN: 'warning',
  CLOSED: 'success',
  INCOMPLETE: 'danger',
};

const STATUS_LABEL: Record<TimeRecordStatus, string> = {
  OPEN: 'Open',
  CLOSED: 'Closed',
  INCOMPLETE: 'Incomplete',
};

interface TimeRecordStatusBadgeProps {
  status: TimeRecordStatus;
}

export function TimeRecordStatusBadge({ status }: TimeRecordStatusBadgeProps) {
  return <Badge bg={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>;
}
