import { useState } from 'react';
import { Badge, Button, Card, Spinner } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { osiEventsService } from '../../api/osiEvents.service';
import { EventFormModal } from './EventFormModal';
import { EventApprovalBadge } from './EventApprovalBadge';
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
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['osi-events', osiId, vehicleId],
    queryFn: () => osiEventsService.list(osiId, vehicleId),
  });

  if (isLoading) return <Spinner size="sm" />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 className="mb-0">{vehiclePlate} — {t('events.title')}</h6>
        <Button size="sm" variant="outline-primary" onClick={() => setShowCreateModal(true)}>
          + {t('events.newEvent')}
        </Button>
      </div>

      {events.length === 0 ? (
        <p className="text-muted small">{t('events.noEvents')}</p>
      ) : (
        <div className="d-flex flex-column gap-2">
          {events.map(ev => (
            <Card key={ev.id} className="border-0 bg-light p-2">
              <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                <small className="text-muted">{new Date(ev.receivedAt).toLocaleString()}</small>
                <Badge bg={VISIBILITY_VARIANTS[ev.effectiveVisibility]} className="small">
                  {t(`eventTypes.${ev.effectiveVisibility}`)}
                </Badge>
                <small className="text-muted">{ev.eventTypeName}</small>
                {ev.parentEventId && (
                  <Badge bg="warning" text="dark" className="small">{t('events.correction')}</Badge>
                )}
                {(ev.effectiveVisibility === 'CLIENTE_CON_APROBACION' || ev.effectiveVisibility === 'PENDIENTE_APROBACION') && (
                  <EventApprovalBadge
                    osiId={osiId}
                    vehicleId={vehicleId}
                    eventId={ev.id}
                    isOwner={isOwner}
                  />
                )}
              </div>
              <p className="mb-1 small">{ev.text}</p>
              {ev.geoLat != null && ev.geoLng != null && (
                <small className="text-muted">
                  📍 {ev.geoLat.toFixed(5)}, {ev.geoLng.toFixed(5)}
                </small>
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

      {showCreateModal && (
        <EventFormModal
          osiId={osiId}
          vehicleId={vehicleId}
          onHide={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}
