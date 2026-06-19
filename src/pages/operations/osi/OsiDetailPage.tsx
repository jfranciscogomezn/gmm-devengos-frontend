import { useParams, Link } from 'react-router-dom';
import { Badge, Card, Col, Row, Spinner, Tab, Tabs } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { osiService } from '../../../api/osi.service';
import { OsiVehicleAssignmentPanel } from '../../../components/operations/OsiVehicleAssignmentPanel';
import { EventLogPanel } from '../../../components/operations/EventLogPanel';
import { OsiDocumentsPanel } from '../../../components/operations/OsiDocumentsPanel';
import { TrackingTokenPanel } from '../../../components/operations/TrackingTokenPanel';
import { DigestPanel } from '../../../components/operations/DigestPanel';
import { ApiErrorAlert } from '../../../components/ApiErrorAlert/ApiErrorAlert';
import type { OsiStatus } from '../../../types';

const STATUS_VARIANTS: Record<OsiStatus, string> = {
  DRAFT: 'secondary',
  ACTIVE: 'primary',
  CLOSED: 'success',
};

export function OsiDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation('operations');
  const osiId = parseInt(id!, 10);

  const { data: osi, isLoading, isError, error } = useQuery({
    queryKey: ['osi-detail', osiId],
    queryFn: () => osiService.findById(osiId),
    enabled: !isNaN(osiId),
  });

  if (isLoading) return <div className="text-center py-5"><Spinner /></div>;
  if (isError || !osi) return <ApiErrorAlert error={error} resourceLabel="osi" />;

  return (
    <div>
      <div className="d-flex align-items-center gap-2 mb-3">
        <Link to="/operations/osi" className="btn btn-sm btn-outline-secondary">&larr;</Link>
        <h4 className="mb-0">
          <code>{osi.osiNumber}</code>
          <Badge bg={STATUS_VARIANTS[osi.status]} className="ms-2">
            {t(`osi.${osi.status}`)}
          </Badge>
        </h4>
      </div>

      <Card className="mb-3">
        <Card.Body>
          <TrackingTokenPanel osiId={osiId} />
        </Card.Body>
      </Card>

      <Row className="g-3 mb-3">
        <Col md={6}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title as="h6">{t('osi.detail')}</Card.Title>
              <dl className="row small mb-0">
                <dt className="col-sm-4">{t('osi.client')}</dt>
                <dd className="col-sm-8">{osi.clientName}</dd>
                <dt className="col-sm-4">{t('osi.origin')}</dt>
                <dd className="col-sm-8">{osi.origin}</dd>
                <dt className="col-sm-4">{t('osi.destination')}</dt>
                <dd className="col-sm-8">{osi.destination}</dd>
                {osi.commercialReference && (
                  <>
                    <dt className="col-sm-4">{t('osi.commercialRef')}</dt>
                    <dd className="col-sm-8">{osi.commercialReference}</dd>
                  </>
                )}
                {osi.internalNotes && (
                  <>
                    <dt className="col-sm-4">{t('osi.internalNotes')}</dt>
                    <dd className="col-sm-8">{osi.internalNotes}</dd>
                  </>
                )}
              </dl>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title as="h6">{t('osi.vehicles')}</Card.Title>
              <OsiVehicleAssignmentPanel osiId={osiId} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {osi.assignments.length > 0 && (
        <>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title as="h6">{t('documents.title')}</Card.Title>
              <Tabs defaultActiveKey={`docs-${osi.assignments[0].vehicleId}`} className="mb-3">
                {osi.assignments.map(a => (
                  <Tab
                    key={a.vehicleId}
                    eventKey={`docs-${a.vehicleId}`}
                    title={a.vehiclePlate}
                  >
                    <OsiDocumentsPanel
                      osiId={osiId}
                      vehicleId={a.vehicleId}
                      vehiclePlate={a.vehiclePlate}
                    />
                  </Tab>
                ))}
              </Tabs>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <Card.Title as="h6">{t('events.title')}</Card.Title>
              <Tabs defaultActiveKey={`vehicle-${osi.assignments[0].vehicleId}`} className="mb-3">
                {osi.assignments.map(a => (
                  <Tab
                    key={a.vehicleId}
                    eventKey={`vehicle-${a.vehicleId}`}
                    title={a.vehiclePlate}
                  >
                    <EventLogPanel
                      osiId={osiId}
                      vehicleId={a.vehicleId}
                      vehiclePlate={a.vehiclePlate}
                      isOwner={true}
                    />
                  </Tab>
                ))}
              </Tabs>
            </Card.Body>
          </Card>

          <Card className="mt-3">
            <Card.Body>
              <Card.Title as="h6">{t('digest.title')}</Card.Title>
              <DigestPanel osiId={osiId} />
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
}
