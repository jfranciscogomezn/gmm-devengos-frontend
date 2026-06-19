import { useState } from 'react';
import { Button, Form, Modal, Spinner } from 'react-bootstrap';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { osiEventsService, type CreateOsiEventRequest } from '../../api/osiEvents.service';
import { eventTypesService } from '../../api/eventTypes.service';

interface Props {
  osiId: number;
  vehicleId: number;
  onHide: () => void;
}

interface AttachmentRow {
  key: string;
  filename: string;
  uri: string;
}

const EMPTY_FORM = {
  eventTypeId: '',
  text: '',
  geoLat: '',
  geoLng: '',
};

export function EventFormModal({ osiId, vehicleId, onHide }: Props) {
  const { t } = useTranslation('operations');
  const qc = useQueryClient();
  const [form, setForm] = useState(EMPTY_FORM);
  const [attachments, setAttachments] = useState<AttachmentRow[]>([]);
  const [newAttachment, setNewAttachment] = useState({ filename: '', uri: '' });

  const { data: eventTypes = [] } = useQuery({
    queryKey: ['operations-event-types'],
    queryFn: () => eventTypesService.findAll(true),
  });

  const selectedType = eventTypes.find(et => et.id === parseInt(form.eventTypeId, 10));
  const maxAttachments = selectedType?.maxAttachments ?? 0;
  const attachmentLimitReached = maxAttachments > 0 && attachments.length >= maxAttachments;

  const createMutation = useMutation({
    mutationFn: (req: CreateOsiEventRequest) => osiEventsService.create(osiId, vehicleId, req),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['osi-events', osiId, vehicleId] });
      onHide();
    },
  });

  const handleSubmit = () => {
    const req: CreateOsiEventRequest = {
      eventTypeId: parseInt(form.eventTypeId, 10),
      text: form.text,
      geoLat: form.geoLat ? parseFloat(form.geoLat) : undefined,
      geoLng: form.geoLng ? parseFloat(form.geoLng) : undefined,
      attachments: attachments.map(a => ({ filename: a.filename, uri: a.uri })),
    };
    createMutation.mutate(req);
  };

  const addAttachment = () => {
    if (!newAttachment.filename || !newAttachment.uri) return;
    setAttachments(prev => [...prev, { key: crypto.randomUUID(), ...newAttachment }]);
    setNewAttachment({ filename: '', uri: '' });
  };

  const removeAttachment = (key: string) => {
    setAttachments(prev => prev.filter(a => a.key !== key));
  };

  const canSubmit = !!form.eventTypeId && !!form.text && !createMutation.isPending;

  return (
    <Modal show onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{t('eventForm.title')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>{t('eventForm.type')}</Form.Label>
            <Form.Select
              value={form.eventTypeId}
              onChange={e => setForm(p => ({ ...p, eventTypeId: e.target.value }))}
            >
              <option value="">{t('eventForm.selectType')}</option>
              {eventTypes.map(et => (
                <option key={et.id} value={et.id}>{et.name}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t('eventForm.description')}</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={form.text}
              onChange={e => setForm(p => ({ ...p, text: e.target.value }))}
            />
          </Form.Group>

          <div className="row g-2 mb-3">
            <div className="col-6">
              <Form.Group>
                <Form.Label>{t('eventForm.geoLat')}</Form.Label>
                <Form.Control
                  type="number"
                  step="any"
                  placeholder="e.g. 4.7110"
                  value={form.geoLat}
                  onChange={e => setForm(p => ({ ...p, geoLat: e.target.value }))}
                />
              </Form.Group>
            </div>
            <div className="col-6">
              <Form.Group>
                <Form.Label>{t('eventForm.geoLng')}</Form.Label>
                <Form.Control
                  type="number"
                  step="any"
                  placeholder="e.g. -74.0721"
                  value={form.geoLng}
                  onChange={e => setForm(p => ({ ...p, geoLng: e.target.value }))}
                />
              </Form.Group>
            </div>
          </div>

          {maxAttachments > 0 && (
            <div className="mb-3">
              <Form.Label>{t('eventForm.attachments')} ({attachments.length}/{maxAttachments})</Form.Label>
              {attachments.map(a => (
                <div key={a.key} className="d-flex align-items-center gap-2 mb-1">
                  <span className="small flex-grow-1">{a.filename}</span>
                  <Button size="sm" variant="outline-danger" onClick={() => removeAttachment(a.key)}>✕</Button>
                </div>
              ))}
              {!attachmentLimitReached && (
                <div className="d-flex gap-2 mt-1">
                  <Form.Control
                    size="sm"
                    placeholder={t('eventForm.attachFilename')}
                    value={newAttachment.filename}
                    onChange={e => setNewAttachment(p => ({ ...p, filename: e.target.value }))}
                  />
                  <Form.Control
                    size="sm"
                    placeholder="URI"
                    value={newAttachment.uri}
                    onChange={e => setNewAttachment(p => ({ ...p, uri: e.target.value }))}
                  />
                  <Button size="sm" variant="outline-secondary" onClick={addAttachment}>+</Button>
                </div>
              )}
              {attachmentLimitReached && (
                <small className="text-muted">{t('eventForm.attachmentsLimitReached', { max: maxAttachments })}</small>
              )}
            </div>
          )}
        </Form>

        {createMutation.isError && (
          <div className="text-danger mt-2">
            {(createMutation.error as Error)?.message}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>{t('common.cancel')}</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={!canSubmit}>
          {createMutation.isPending ? <Spinner size="sm" /> : t('common.save')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
