import { useState } from 'react';
import { Badge, Button, Form, Spinner } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  osiTransportDocumentsService,
  type CreateTransportDocumentRequest,
} from '../../api/osiTransportDocuments.service';
import type { TransportDocumentType } from '../../types';

const DOCUMENT_TYPES: TransportDocumentType[] = ['PEDIDO', 'MANIFIESTO', 'REMISION', 'OTRO'];

interface Props {
  osiId: number;
  vehicleId: number;
  vehiclePlate: string;
}

const EMPTY_FORM: CreateTransportDocumentRequest = {
  type: 'PEDIDO',
  documentNumber: '',
  documentDate: new Date().toISOString().slice(0, 10),
};

export function OsiDocumentsPanel({ osiId, vehicleId, vehiclePlate }: Props) {
  const { t } = useTranslation('operations');
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateTransportDocumentRequest>(EMPTY_FORM);

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ['osi-documents', osiId, vehicleId],
    queryFn: () => osiTransportDocumentsService.findByAssignment(osiId, vehicleId),
  });

  const createMutation = useMutation({
    mutationFn: (req: CreateTransportDocumentRequest) =>
      osiTransportDocumentsService.create(osiId, vehicleId, req),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['osi-documents', osiId, vehicleId] });
      setShowForm(false);
      setForm(EMPTY_FORM);
    },
  });

  if (isLoading) return <Spinner size="sm" />;

  const canSubmit = !!form.documentNumber && !!form.documentDate && !createMutation.isPending;

  return (
    <div className="mt-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 className="mb-0">{vehiclePlate} — {t('documents.title')}</h6>
        <Button size="sm" variant="outline-secondary" onClick={() => setShowForm(f => !f)}>
          {showForm ? t('common.cancel') : `+ ${t('documents.add')}`}
        </Button>
      </div>

      {showForm && (
        <div className="border rounded p-3 mb-3 bg-light">
          <div className="row g-2 mb-2">
            <div className="col-md-3">
              <Form.Label className="small">{t('documents.type')}</Form.Label>
              <Form.Select
                size="sm"
                value={form.type}
                onChange={e => setForm(p => ({ ...p, type: e.target.value as TransportDocumentType }))}
              >
                {DOCUMENT_TYPES.map(dt => (
                  <option key={dt} value={dt}>{t(`documents.types.${dt}`)}</option>
                ))}
              </Form.Select>
            </div>
            <div className="col-md-4">
              <Form.Label className="small">{t('documents.number')}</Form.Label>
              <Form.Control
                size="sm"
                value={form.documentNumber ?? ''}
                onChange={e => setForm(p => ({ ...p, documentNumber: e.target.value }))}
                placeholder="#"
              />
            </div>
            <div className="col-md-3">
              <Form.Label className="small">{t('documents.date')}</Form.Label>
              <Form.Control
                size="sm"
                type="date"
                value={form.documentDate ?? ''}
                onChange={e => setForm(p => ({ ...p, documentDate: e.target.value }))}
              />
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <Button
                size="sm"
                variant="primary"
                className="w-100"
                disabled={!canSubmit}
                onClick={() => createMutation.mutate(form)}
              >
                {createMutation.isPending ? <Spinner size="sm" /> : t('common.save')}
              </Button>
            </div>
          </div>
          <div className="row g-2">
            <div className="col-md-6">
              <Form.Label className="small">{t('documents.notes')}</Form.Label>
              <Form.Control
                size="sm"
                value={form.internalNotes ?? ''}
                onChange={e => setForm(p => ({ ...p, internalNotes: e.target.value }))}
                placeholder={t('documents.notesPlaceholder')}
              />
            </div>
            <div className="col-md-6">
              <Form.Label className="small">{t('documents.fileUri')}</Form.Label>
              <Form.Control
                size="sm"
                value={form.adjunctUri ?? ''}
                onChange={e => setForm(p => ({ ...p, adjunctUri: e.target.value }))}
                placeholder="https://…"
              />
            </div>
          </div>
          {createMutation.isError && (
            <div className="text-danger mt-2 small">
              {(createMutation.error as Error)?.message}
            </div>
          )}
        </div>
      )}

      {docs.length === 0 && !showForm ? (
        <p className="text-muted small">{t('documents.empty')}</p>
      ) : (
        <div className="d-flex flex-column gap-1">
          {docs.map(doc => (
            <div key={doc.id} className="d-flex align-items-center gap-2 border-bottom py-1">
              <Badge bg="secondary">{t(`documents.types.${doc.type}`)}</Badge>
              {doc.documentNumber && <span className="small fw-semibold">{doc.documentNumber}</span>}
              {doc.documentDate && <span className="small text-muted">{doc.documentDate}</span>}
              {doc.internalNotes && <span className="small text-muted">— {doc.internalNotes}</span>}
              {doc.adjunctUri && (
                <a href={doc.adjunctUri} target="_blank" rel="noreferrer" className="small">
                  📎 {t('documents.viewFile')}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
