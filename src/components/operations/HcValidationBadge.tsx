import { useState } from 'react';
import { Badge, Button, Form, Spinner } from 'react-bootstrap';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { osiVehicleAssignmentsService } from '../../api/osiVehicleAssignments.service';
import type { HcValidationStatus } from '../../types';

interface Props {
  osiId: number;
  assignmentId: number;
  status: HcValidationStatus;
  notes: string | null;
}

const STATUS_VARIANT: Record<HcValidationStatus, string> = {
  PENDIENTE: 'warning',
  VALIDADO: 'success',
  RECHAZADO: 'danger',
};

export function HcValidationBadge({ osiId, assignmentId, status, notes }: Props) {
  const { t } = useTranslation('operations');
  const { hasPermission } = useAuth();
  const qc = useQueryClient();
  const isHcValidador = hasPermission('OPS_HC_VALIDADOR');

  const [editMode, setEditMode] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'VALIDADO' | 'RECHAZADO'>('VALIDADO');
  const [editNotes, setEditNotes] = useState(notes ?? '');

  const mutation = useMutation({
    mutationFn: () =>
      osiVehicleAssignmentsService.updateHcValidation(
        osiId, assignmentId, selectedStatus, editNotes || undefined,
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['osi-assignments', osiId] });
      void qc.invalidateQueries({ queryKey: ['osi-detail', osiId] });
      setEditMode(false);
    },
  });

  return (
    <div className="mt-2">
      <div className="d-flex align-items-center gap-2">
        <small className="text-muted fw-semibold">{t('hc.title')}:</small>
        <Badge bg={STATUS_VARIANT[status]}>{t(`hc.${status}`)}</Badge>
        {isHcValidador && status !== 'VALIDADO' && !editMode && (
          <Button size="sm" variant="outline-secondary" onClick={() => setEditMode(true)}>
            {t('hc.update')}
          </Button>
        )}
      </div>

      {isHcValidador && editMode && (
        <div className="mt-2 p-2 border rounded bg-light">
          <Form.Select
            size="sm"
            className="mb-2"
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value as 'VALIDADO' | 'RECHAZADO')}
          >
            <option value="VALIDADO">{t('hc.VALIDADO')}</option>
            <option value="RECHAZADO">{t('hc.RECHAZADO')}</option>
          </Form.Select>
          <Form.Control
            as="textarea"
            size="sm"
            rows={2}
            placeholder={t('hc.notes')}
            value={editNotes}
            onChange={e => setEditNotes(e.target.value)}
            className="mb-2"
          />
          <div className="d-flex gap-2">
            <Button
              size="sm"
              variant="primary"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? <Spinner size="sm" /> : t('hc.save')}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setEditMode(false)}>
              {t('common.cancel')}
            </Button>
          </div>
          {mutation.isError && (
            <small className="text-danger">{(mutation.error as Error)?.message}</small>
          )}
        </div>
      )}
    </div>
  );
}
