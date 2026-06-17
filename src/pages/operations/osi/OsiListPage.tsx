import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Form, Modal, Spinner, Table } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { osiService, type CreateOsiRequest } from '../../../api/osi.service';
import { clientsService } from '../../../api/clients.service';
import type { OsiStatus } from '../../../types';
import { PageHeader } from '../../../components/ui/PageHeader';
import { ApiErrorAlert } from '../../../components/ApiErrorAlert/ApiErrorAlert';

const STATUS_VARIANTS: Record<OsiStatus, string> = {
  DRAFT: 'secondary',
  ACTIVE: 'primary',
  CLOSED: 'success',
};

export function OsiListPage() {
  const { t } = useTranslation('operations');
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [page, setPage] = useState(0);
  const [form, setForm] = useState<{
    clientId: string; origin: string; destination: string;
    commercialReference: string; internalNotes: string;
  }>({ clientId: '', origin: '', destination: '', commercialReference: '', internalNotes: '' });

  const { data: paged, isLoading, isError, error } = useQuery({
    queryKey: ['operations-osi', statusFilter, page],
    queryFn: () => osiService.list({ status: statusFilter || undefined, page, size: 20 }),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['operations-clients'],
    queryFn: () => clientsService.findAll(true),
  });

  const createMutation = useMutation({
    mutationFn: (req: CreateOsiRequest) => osiService.create(req),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['operations-osi'] });
      setShowCreateModal(false);
      setForm({ clientId: '', origin: '', destination: '', commercialReference: '', internalNotes: '' });
    },
  });

  const handleCreate = () => {
    createMutation.mutate({
      clientId: parseInt(form.clientId, 10),
      origin: form.origin,
      destination: form.destination,
      commercialReference: form.commercialReference || undefined,
      internalNotes: form.internalNotes || undefined,
    });
  };

  const osis = paged?.content ?? [];
  const totalPages = paged?.totalPages ?? 0;

  if (isLoading) return <div className="text-center py-5"><Spinner /></div>;
  if (isError) return <ApiErrorAlert error={error} resourceLabel="osi" />;

  return (
    <div>
      <PageHeader
        title={t('osi.title')}
        actions={
          <Button size="sm" variant="primary" onClick={() => setShowCreateModal(true)}>
            + {t('osi.new')}
          </Button>
        }
      />

      <div className="d-flex gap-2 mb-3 flex-wrap">
        <Form.Select
          size="sm"
          style={{ maxWidth: 160 }}
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
        >
          <option value="">{t('osi.status')}: All</option>
          {(['DRAFT', 'ACTIVE', 'CLOSED'] as OsiStatus[]).map(s => (
            <option key={s} value={s}>{t(`osi.${s}`)}</option>
          ))}
        </Form.Select>
      </div>

      <div className="table-responsive">
        <Table striped hover className="mb-0">
          <thead>
            <tr>
              <th>{t('osi.osiNumber')}</th>
              <th>{t('osi.client')}</th>
              <th>{t('osi.origin')}</th>
              <th>{t('osi.destination')}</th>
              <th>{t('osi.vehicles')}</th>
              <th>{t('osi.status')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {osis.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-muted py-4">{t('osi.noOsi')}</td></tr>
            ) : osis.map(o => (
              <tr key={o.id}>
                <td><code>{o.osiNumber}</code></td>
                <td>{o.clientName}</td>
                <td className="text-truncate" style={{ maxWidth: 180 }}>{o.origin}</td>
                <td className="text-truncate" style={{ maxWidth: 180 }}>{o.destination}</td>
                <td><Badge bg="light" text="dark">{o.vehicleCount}</Badge></td>
                <td><Badge bg={STATUS_VARIANTS[o.status]}>{t(`osi.${o.status}`)}</Badge></td>
                <td>
                  <Link to={`/operations/osi/${o.id}`} className="btn btn-sm btn-outline-secondary">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center gap-2 mt-3">
          <Button size="sm" variant="outline-secondary" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
            &laquo;
          </Button>
          <span className="align-self-center small">{page + 1} / {totalPages}</span>
          <Button size="sm" variant="outline-secondary" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
            &raquo;
          </Button>
        </div>
      )}

      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('osi.new')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>{t('osi.client')}</Form.Label>
              <Form.Select
                value={form.clientId}
                onChange={e => setForm(p => ({ ...p, clientId: e.target.value }))}
                required
              >
                <option value="">Select client…</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Form.Select>
            </Form.Group>
            {(['origin', 'destination', 'commercialReference'] as const).map(f => (
              <Form.Group className="mb-3" key={f}>
                <Form.Label>{t(`osi.${f === 'commercialReference' ? 'commercialRef' : f}`)}</Form.Label>
                <Form.Control
                  value={form[f]}
                  onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))}
                  required={f !== 'commercialReference'}
                />
              </Form.Group>
            ))}
            <Form.Group className="mb-3">
              <Form.Label>{t('osi.internalNotes')}</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={form.internalNotes}
                onChange={e => setForm(p => ({ ...p, internalNotes: e.target.value }))}
              />
            </Form.Group>
          </Form>
          {createMutation.isError && (
            <div className="text-danger mt-2">{(createMutation.error as Error)?.message}</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button
            variant="primary"
            onClick={handleCreate}
            disabled={createMutation.isPending || !form.clientId || !form.origin || !form.destination}
          >
            {createMutation.isPending ? <Spinner size="sm" /> : 'Create'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
