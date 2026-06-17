import { useState } from 'react';
import { Badge, Button, Card, Form, Modal, Spinner } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { osiEventsService, type CreateOsiEventRequest } from '../../api/osiEvents.service';
import { eventTypesService } from '../../api/eventTypes.service';
import type { EventVisibility } from '../../types';

const VISIBILITY_VARIANTS: Record<EventVisibility, string> = {
  INTERNO: 'secondary',
  CLIENTE: 'info',
  CLIENTE_CON_APROBACION: 'warning',
  PENDIENTE_APROBACION: 'warning',
};

interface Props {
  osiId: number;
  vehicleId: number;
  vehiclePlate: string;
  isOwner?: boolean;
}

export function EventLogPanel({ osiId, vehicleId, vehiclePlate, isOwner = false }: Props) {
  const { t } = useTranslation('operations');
  const qc = useQueryClient();
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [eventForm, setEventForm] = useState({ eventTypeId: '', text: '' });

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['osi-events', osiId, vehicleId],
    queryFn: () => osiEventsService.list(osiId, vehicleId),
  });

  const { data: eventTypes = [] } = useQuery({
    queryKey: ['operations-event-types'],
    queryFn: () => eventTypesService.findAll(true),
  });

  const createMutation = useMutation({
    mutationFn: (req: CreateOsiEventRequest) => osiEventsService.create(osiId, vehicleId, req),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['osi-events', osiId, vehicleId] });
      setShowAddEvent(false);
      setEventForm({ eventTypeId: '', text: '' });
    },
  });

  const approveMutation = useMutation({
    mutationFn: (eventId: number) => osiEventsService.approve(osiId, vehicleId, eventId),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['osi-events', osiId, vehicleId] }),
  });

  if (isLoading) return <Spinner size="sm" />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 className="mb-0">{vehiclePlate} — {t('events.title')}</h6>
        <Button size="sm" variant="outline-primary" onClick={() => setShowAddEvent(true)}>
          + {t('events.newEvent')}
        </Button>
      </div>

      {events.length === 0 ? (
        <p className="text-muted small">{t('events.noEvents')}</p>
      ) : (
        <div className="d-flex flex-column gap-2">
          {events.map(ev => (
            <Card key={ev.id} className="border-0 bg-light p-2">
              <div className="d-flex align-items-center gap-2 mb-1">
                <small className="text-muted">{new Date(ev.receivedAt).toLocaleString()}</small>
                <Badge bg={VISIBILITY_VARIANTS[ev.effectiveVisibility]} className="small">
                  {t(`eventTypes.${ev.effectiveVisibility}`)}
                </Badge>
                <small className="text-muted">{ev.eventTypeName}</small>
                {ev.parentEventId && (
                  <Badge bg="warning" text="dark" className="small">{t('events.correction')}</Badge>
                )}
              </div>
              <p className="mb-1 small">{ev.text}</p>
              {ev.effectiveVisibility === 'PENDIENTE_APROBACION' && isOwner && (
                <Button
                  size="sm"
                  variant="outline-success"
                  onClick={() => approveMutation.mutate(ev.id)}
                  disabled={approveMutation.isPending}
                >
                  {t('events.approve')}
                </Button>
              )}
              {ev.attachments.length > 0 && (
                <div className="mt-1">
                  {ev.attachments.map(att => (
                    <a key={att.id} href={att.uri} target="_blank" rel="noreferrer" className="small me-2">
                      📎 {att.filename}
                    </a>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal show={showAddEvent} onHide={() => setShowAddEvent(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('events.newEvent')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>{t('events.eventType')}</Form.Label>
              <Form.Select
                value={eventForm.eventTypeId}
                onChange={e => setEventForm(p => ({ ...p, eventTypeId: e.target.value }))}
                required
              >
                <option value="">Select type…</option>
                {eventTypes.map(et => <option key={et.id} value={et.id}>{et.name}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t('events.text')}</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={eventForm.text}
                onChange={e => setEventForm(p => ({ ...p, text: e.target.value }))}
                required
              />
            </Form.Group>
          </Form>
          {createMutation.isError && (
            <div className="text-danger mt-2">{(createMutation.error as Error)?.message}</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddEvent(false)}>Cancel</Button>
          <Button
            variant="primary"
            disabled={createMutation.isPending || !eventForm.eventTypeId || !eventForm.text}
            onClick={() => createMutation.mutate({ eventTypeId: parseInt(eventForm.eventTypeId, 10), text: eventForm.text })}
          >
            {createMutation.isPending ? <Spinner size="sm" /> : 'Save'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
