import { Badge, Button, Spinner } from 'react-bootstrap';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { osiEventsService } from '../../api/osiEvents.service';

interface Props {
  osiId: number;
  vehicleId: number;
  eventId: number;
  isOwner: boolean;
}

export function EventApprovalBadge({ osiId, vehicleId, eventId, isOwner }: Props) {
  const { t } = useTranslation('operations');
  const qc = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: () => osiEventsService.approve(osiId, vehicleId, eventId),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['osi-events', osiId, vehicleId] }),
  });

  return (
    <span className="d-inline-flex align-items-center gap-2">
      <Badge bg="warning" text="dark">
        {t('approval.pending')}
      </Badge>
      {isOwner && (
        <Button
          size="sm"
          variant="outline-success"
          onClick={() => approveMutation.mutate()}
          disabled={approveMutation.isPending}
        >
          {approveMutation.isPending ? <Spinner size="sm" /> : t('approval.approve')}
        </Button>
      )}
    </span>
  );
}
