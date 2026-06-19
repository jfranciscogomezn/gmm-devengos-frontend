import { useState } from 'react';
import { Alert, Badge, Button, Form, Modal, Spinner } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { osiVehicleAssignmentsService } from '../../api/osiVehicleAssignments.service';
import { vehiclesService } from '../../api/vehicles.service';
import type { OsiVehicleAssignment, OsiVehicleState } from '../../types';

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

interface GpsEditorProps {
  assignment: OsiVehicleAssignment;
  osiId: number;
}

function GpsEditor({ assignment, osiId }: GpsEditorProps) {
  const { t } = useTranslation('operations');
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [provider, setProvider] = useState(assignment.gpsProvider ?? '');
  const [url, setUrl] = useState(assignment.gpsReferenceUrl ?? '');

  const gpsMutation = useMutation({
    mutationFn: () => osiVehicleAssignmentsService.updateGps(
      osiId, assignment.id, provider || null, url || null,
    ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['osi-assignments', osiId] });
      setEditing(false);
    },
  });

  if (!editing) {
    return (
      <div className="mt-1 d-flex align-items-center gap-2">
        {assignment.gpsReferenceUrl ? (
          <a href={assignment.gpsReferenceUrl} target="_blank" rel="noreferrer" className="small">
            🛰 {assignment.gpsProvider ?? t('gps.viewTracking')}
          </a>
        ) : (
          <span className="small text-muted">{t('gps.noReference')}</span>
        )}
        <Button size="sm" variant="link" className="p-0 small" onClick={() => setEditing(true)}>
          {t('gps.edit')}
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-2 border rounded p-2 bg-light">
      <div className="row g-1 mb-1">
        <div className="col-5">
          <Form.Control
            size="sm"
            placeholder={t('gps.provider')}
            value={provider}
            onChange={e => setProvider(e.target.value)}
          />
        </div>
        <div className="col-7">
          <Form.Control
            size="sm"
            placeholder="https://…"
            value={url}
            onChange={e => setUrl(e.target.value)}
          />
        </div>
      </div>
      <div className="d-flex gap-2">
        <Button size="sm" variant="primary" onClick={() => gpsMutation.mutate()} disabled={gpsMutation.isPending}>
          {gpsMutation.isPending ? <Spinner size="sm" /> : t('common.save')}
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setEditing(false)}>
          {t('common.cancel')}
        </Button>
      </div>
    </div>
  );
}

interface Props {
  osiId: number;
}

export function OsiVehicleAssignmentPanel({ osiId }: Props) {
  const { t } = useTranslation('operations');
  const qc = useQueryClient();
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showTransitionModal, setShowTransitionModal] = useState<{
    assignmentId: number;
    currentState: OsiVehicleState;
  } | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [targetState, setTargetState] = useState('');
  const [transitionError, setTransitionError] = useState<string | null>(null);

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
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['osi-assignments', osiId] });
      setShowAssignModal(false);
    },
  });

  const transitionMutation = useMutation({
    mutationFn: ({ assignmentId, state }: { assignmentId: number; state: string }) =>
      osiVehicleAssignmentsService.transitionState(osiId, assignmentId, state),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['osi-assignments', osiId] });
      setShowTransitionModal(null);
      setTransitionError(null);
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? (error as Error)?.message
        ?? t('osi.transitionError');
      setTransitionError(msg);
    },
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
            <li key={a.id} className="list-group-item px-0">
              <div className="d-flex align-items-center gap-2">
                <strong>{a.vehiclePlate}</strong>
                <Badge bg={STATE_VARIANTS[a.state]}>{t(`osi.${a.state}`)}</Badge>
                {VALID_TRANSITIONS[a.state].length > 0 && (
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={() => {
                      setShowTransitionModal({ assignmentId: a.id, currentState: a.state });
                      setTargetState(VALID_TRANSITIONS[a.state][0]);
                      setTransitionError(null);
                    }}
                  >
                    {t('osi.transition')}
                  </Button>
                )}
              </div>
              <GpsEditor assignment={a} osiId={osiId} />
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
          <Button variant="secondary" onClick={() => setShowAssignModal(false)}>{t('common.cancel')}</Button>
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
        <Modal show onHide={() => { setShowTransitionModal(null); setTransitionError(null); }} size="sm">
          <Modal.Header closeButton>
            <Modal.Title>{t('osi.transition')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Select value={targetState} onChange={e => setTargetState(e.target.value)}>
              {VALID_TRANSITIONS[showTransitionModal.currentState].map(s => (
                <option key={s} value={s}>{t(`osi.${s}`)}</option>
              ))}
            </Form.Select>
            {transitionError && (
              <Alert variant="danger" className="mt-2 mb-0 small py-2">
                {transitionError}
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => { setShowTransitionModal(null); setTransitionError(null); }}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              disabled={transitionMutation.isPending}
              onClick={() => transitionMutation.mutate({
                assignmentId: showTransitionModal.assignmentId,
                state: targetState,
              })}
            >
              {transitionMutation.isPending ? <Spinner size="sm" /> : 'Update'}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}
