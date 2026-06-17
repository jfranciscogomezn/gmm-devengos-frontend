import { useState } from 'react';
import { Badge, Button, Form, Modal, Spinner } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { osiVehicleAssignmentsService } from '../../api/osiVehicleAssignments.service';
import { vehiclesService } from '../../api/vehicles.service';
import type { OsiVehicleState } from '../../types';

const STATE_VARIANTS: Record<OsiVehicleState, string> = {
  PLANNED: 'secondary',
  EN_RUTA: 'primary',
  EN_DESTINO: 'info',
  DESCARGANDO: 'warning',
  CERRADO_TRACKING: 'success',
  INCIDENTE: 'danger',
};

const VALID_TRANSITIONS: Record<OsiVehicleState, OsiVehicleState[]> = {
  PLANNED: ['EN_RUTA'],
  EN_RUTA: ['EN_DESTINO', 'INCIDENTE'],
  EN_DESTINO: ['DESCARGANDO', 'INCIDENTE'],
  DESCARGANDO: ['CERRADO_TRACKING', 'INCIDENTE'],
  INCIDENTE: ['EN_RUTA'],
  CERRADO_TRACKING: [],
};

interface Props {
  osiId: number;
}

export function OsiVehicleAssignmentPanel({ osiId }: Props) {
  const { t } = useTranslation('operations');
  const qc = useQueryClient();
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showTransitionModal, setShowTransitionModal] = useState<{ assignmentId: number; currentState: OsiVehicleState } | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [targetState, setTargetState] = useState('');

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['osi-assignments', osiId],
    queryFn: () => osiVehicleAssignmentsService.list(osiId),
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['operations-vehicles'],
    queryFn: () => vehiclesService.findAll('ACTIVE'),
  });

  const assignMutation = useMutation({
    mutationFn: (vehicleId: number) => osiVehicleAssignmentsService.assign(osiId, vehicleId),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['osi-assignments', osiId] }); setShowAssignModal(false); },
  });

  const transitionMutation = useMutation({
    mutationFn: ({ assignmentId, state }: { assignmentId: number; state: string }) =>
      osiVehicleAssignmentsService.transitionState(osiId, assignmentId, state),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['osi-assignments', osiId] }); setShowTransitionModal(null); },
  });

  if (isLoading) return <Spinner size="sm" />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 className="mb-0">{t('osi.vehicles')}</h6>
        <Button size="sm" variant="outline-primary" onClick={() => setShowAssignModal(true)}>
          + {t('osi.assignVehicle')}
        </Button>
      </div>

      {assignments.length === 0 ? (
        <p className="text-muted small">No vehicles assigned.</p>
      ) : (
        <ul className="list-group list-group-flush">
          {assignments.map(a => (
            <li key={a.id} className="list-group-item px-0 d-flex align-items-center gap-2">
              <strong>{a.vehiclePlate}</strong>
              <Badge bg={STATE_VARIANTS[a.state]}>{t(`osi.${a.state}`)}</Badge>
              {VALID_TRANSITIONS[a.state].length > 0 && (
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={() => {
                    setShowTransitionModal({ assignmentId: a.id, currentState: a.state });
                    setTargetState(VALID_TRANSITIONS[a.state][0]);
                  }}
                >
                  {t('osi.transition')}
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)} size="sm">
        <Modal.Header closeButton>
          <Modal.Title>{t('osi.assignVehicle')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Select value={selectedVehicleId} onChange={e => setSelectedVehicleId(e.target.value)}>
            <option value="">Select vehicle…</option>
            {vehicles
              .filter(v => !assignments.some(a => a.vehicleId === v.id))
              .map(v => <option key={v.id} value={v.id}>{v.plate}</option>)}
          </Form.Select>
          {assignMutation.isError && (
            <div className="text-danger mt-2">{(assignMutation.error as Error)?.message}</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAssignModal(false)}>Cancel</Button>
          <Button
            variant="primary"
            disabled={!selectedVehicleId || assignMutation.isPending}
            onClick={() => assignMutation.mutate(parseInt(selectedVehicleId, 10))}
          >
            {assignMutation.isPending ? <Spinner size="sm" /> : 'Assign'}
          </Button>
        </Modal.Footer>
      </Modal>

      {showTransitionModal && (
        <Modal show onHide={() => setShowTransitionModal(null)} size="sm">
          <Modal.Header closeButton>
            <Modal.Title>{t('osi.transition')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Select value={targetState} onChange={e => setTargetState(e.target.value)}>
              {VALID_TRANSITIONS[showTransitionModal.currentState].map(s => (
                <option key={s} value={s}>{t(`osi.${s}`)}</option>
              ))}
            </Form.Select>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowTransitionModal(null)}>Cancel</Button>
            <Button
              variant="primary"
              disabled={transitionMutation.isPending}
              onClick={() => transitionMutation.mutate({ assignmentId: showTransitionModal.assignmentId, state: targetState })}
            >
              {transitionMutation.isPending ? <Spinner size="sm" /> : 'Update'}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}
