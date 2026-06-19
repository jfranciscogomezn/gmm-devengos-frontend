import { useParams } from 'react-router-dom';
import { Badge, Card, Container, Spinner } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { portalService } from '../../api/portal.service';
import type { PortalEvent } from '../../types';

const portalQueryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 60_000 } },
});

function EventCard({ event }: { event: PortalEvent }) {
  return (
    <Card className="mb-2 border-0 bg-light">
      <Card.Body className="py-2 px-3">
        <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
          <small className="text-muted">{new Date(event.receivedAt).toLocaleString()}</small>
          <Badge bg="info" className="small">{event.eventTypeName}</Badge>
        </div>
        <p className="mb-1 small">{event.text}</p>
        {event.geoLat != null && event.geoLng != null && (
          <small className="text-muted d-block">
            📍 {Number(event.geoLat).toFixed(5)}, {Number(event.geoLng).toFixed(5)}
          </small>
        )}
        {event.attachments.length > 0 && (
          <div className="mt-1">
            {event.attachments.map(att => (
              <a key={att.id} href={att.uri} target="_blank" rel="noreferrer" className="small me-2">
                📎 {att.filename}
              </a>
            ))}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

function PortalContent() {
  const { token } = useParams<{ token: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['portal', token],
    queryFn: () => portalService.getPortalData(token!),
    enabled: !!token,
  });

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-center py-5">
        <h4 className="text-muted">🔒 Link not available</h4>
        <p className="text-muted">This tracking link has expired or been revoked. Please contact your coordinator.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-primary text-white py-3 px-4 mb-4 rounded">
        <div className="d-flex align-items-baseline gap-3 flex-wrap">
          <code className="fs-5 text-white">{data.osiNumber}</code>
          <Badge bg="light" text="dark">{data.aggregatedState}</Badge>
        </div>
        <div className="small mt-1">
          <span className="fw-semibold">{data.clientName}</span>
          {' · '}
          <span>{data.origin}</span>
          {' → '}
          <span>{data.destination}</span>
        </div>
      </div>

      <h6 className="text-muted mb-3">Event Timeline</h6>
      {data.events.length === 0 ? (
        <p className="text-muted small">No events available yet.</p>
      ) : (
        data.events.map(ev => <EventCard key={ev.id} event={ev} />)
      )}
    </div>
  );
}

export function ClientPortalPage() {
  return (
    <QueryClientProvider client={portalQueryClient}>
      <div className="min-vh-100 bg-light">
        <div className="bg-white border-bottom py-2 px-4 mb-0">
          <span className="fw-bold text-primary">GMM · Cargo Tracking</span>
        </div>
        <Container className="py-4" style={{ maxWidth: 720 }}>
          <PortalContent />
          <footer className="text-center text-muted small mt-5">
            Powered by GMM-Devengos · {new Date().getFullYear()}
          </footer>
        </Container>
      </div>
    </QueryClientProvider>
  );
}
