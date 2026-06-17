import { useState } from 'react';
import { Badge, Button, Col, Form, Modal, Row, Spinner, Table } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { eventTypesService, type CreateEventTypeRequest } from '../../../api/eventTypes.service';
import type { EventType } from '../../../types';
import { PageHeader } from '../../../components/ui/PageHeader';
import { ApiErrorAlert } from '../../../components/ApiErrorAlert/ApiErrorAlert';

const VISIBILITY_OPTIONS = ['INTERNO', 'CLIENTE', 'CLIENTE_CON_APROBACION'];

interface FormValues {
  name: string;
  description: string;
  defaultVisibility: string;
  minAttachments: string;
  maxAttachments: string;
  hasMeasurementForm: boolean;
}

const emptyForm: FormValues = {
  name: '', description: '', defaultVisibility: 'INTERNO',
  minAttachments: '0', maxAttachments: '10', hasMeasurementForm: false,
};

export function EventTypesPage() {
  const { t } = useTranslation('operations');
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<EventType | null>(null);
  const [form, setForm] = useState<FormValues>(emptyForm);

  const { data: eventTypes = [], isLoading, isError, error } = useQuery({
    queryKey: ['operations-event-types-all'],
    queryFn: () => eventTypesService.findAll(false),
  });

  const createMutation = useMutation({
    mutationFn: (req: CreateEventTypeRequest) => eventTypesService.create(req),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['operations-event-types-all'] }); setShowModal(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, req }: { id: number; req: Partial<CreateEventTypeRequest & { active: boolean }> }) =>
      eventTypesService.update(id, req),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['operations-event-types-all'] }); setShowModal(false); },
  });

  const handleOpen = (et?: EventType) => {
    if (et) {
      setEditing(et);
      setForm({
        name: et.name,
        description: et.description ?? '',
        defaultVisibility: et.defaultVisibility,
        minAttachments: et.minAttachments.toString(),
        maxAttachments: et.maxAttachments.toString(),
        hasMeasurementForm: et.hasMeasurementForm,
      });
    } else {
      setEditing(null);
      setForm(emptyForm);
    }
    setShowModal(true);
  };

  const handleSubmit = () => {
    const req: CreateEventTypeRequest = {
      name: form.name,
      description: form.description || undefined,
      defaultVisibility: form.defaultVisibility,
      minAttachments: parseInt(form.minAttachments, 10),
      maxAttachments: parseInt(form.maxAttachments, 10),
      hasMeasurementForm: form.hasMeasurementForm,
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, req });
    } else {
      createMutation.mutate(req);
    }
  };

  const toggleActive = (et: EventType) => {
    updateMutation.mutate({ id: et.id, req: { active: !et.active } });
  };

  if (isLoading) return <div className="text-center py-5"><Spinner /></div>;
  if (isError) return <ApiErrorAlert error={error} resourceLabel="event-types" />;

  return (
    <div>
      <PageHeader
        title={t('eventTypes.title')}
        actions={
          <Button size="sm" variant="primary" onClick={() => handleOpen()}>
            + {t('eventTypes.new')}
          </Button>
        }
      />

      <div className="table-responsive">
        <Table striped hover className="mb-0">
          <thead>
            <tr>
              <th>{t('eventTypes.name')}</th>
              <th>{t('eventTypes.defaultVisibility')}</th>
              <th>{t('eventTypes.minAttachments')}</th>
              <th>{t('eventTypes.maxAttachments')}</th>
              <th>{t('eventTypes.active')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {eventTypes.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-muted py-4">{t('eventTypes.noEventTypes')}</td></tr>
            ) : eventTypes.map(et => (
              <tr key={et.id}>
                <td>{et.name}</td>
                <td><Badge bg="secondary">{t(`eventTypes.${et.defaultVisibility}`)}</Badge></td>
                <td>{et.minAttachments}</td>
                <td>{et.maxAttachments}</td>
                <td>
                  <Badge bg={et.active ? 'success' : 'secondary'}>
                    {et.active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="d-flex gap-1">
                  <Button size="sm" variant="outline-secondary" onClick={() => handleOpen(et)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="outline-warning" onClick={() => toggleActive(et)}>
                    {et.active ? t('eventTypes.deactivate') : t('eventTypes.activate')}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editing ? t('eventTypes.edit') : t('eventTypes.new')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>{t('eventTypes.name')}</Form.Label>
              <Form.Control
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t('eventTypes.description')}</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t('eventTypes.defaultVisibility')}</Form.Label>
              <Form.Select
                value={form.defaultVisibility}
                onChange={e => setForm(p => ({ ...p, defaultVisibility: e.target.value }))}
              >
                {VISIBILITY_OPTIONS.map(v => (
                  <option key={v} value={v}>{t(`eventTypes.${v}`)}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Row className="g-2">
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>{t('eventTypes.minAttachments')}</Form.Label>
                  <Form.Control
                    type="number"
                    min={0}
                    value={form.minAttachments}
                    onChange={e => setForm(p => ({ ...p, minAttachments: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>{t('eventTypes.maxAttachments')}</Form.Label>
                  <Form.Control
                    type="number"
                    min={0}
                    value={form.maxAttachments}
                    onChange={e => setForm(p => ({ ...p, maxAttachments: e.target.value }))}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Check
              type="checkbox"
              label={t('eventTypes.hasMeasurementForm')}
              checked={form.hasMeasurementForm}
              onChange={e => setForm(p => ({ ...p, hasMeasurementForm: e.target.checked }))}
            />
          </Form>
          {(createMutation.isError || updateMutation.isError) && (
            <div className="text-danger mt-2">
              {(createMutation.error as Error)?.message ?? (updateMutation.error as Error)?.message}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={createMutation.isPending || updateMutation.isPending || !form.name}
          >
            {createMutation.isPending || updateMutation.isPending ? <Spinner size="sm" /> : 'Save'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
