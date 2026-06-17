import { useState } from 'react';
import { Badge, Button, Modal, Form, Spinner, Table } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { clientsService, type CreateClientRequest } from '../../../api/clients.service';
import type { Client } from '../../../types';
import { PageHeader } from '../../../components/ui/PageHeader';
import { ApiErrorAlert } from '../../../components/ApiErrorAlert/ApiErrorAlert';

interface ClientFormValues {
  name: string;
  taxId: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  internalNotes: string;
}

const emptyForm: ClientFormValues = {
  name: '', taxId: '', contactName: '', contactEmail: '', contactPhone: '', internalNotes: '',
};

export function ClientsPage() {
  const { t } = useTranslation('operations');
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState<ClientFormValues>(emptyForm);

  const { data: clients = [], isLoading, isError, error } = useQuery({
    queryKey: ['operations-clients'],
    queryFn: () => clientsService.findAll(),
  });

  const createMutation = useMutation({
    mutationFn: (req: CreateClientRequest) => clientsService.create(req),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['operations-clients'] }); setShowModal(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, req }: { id: number; req: CreateClientRequest }) =>
      clientsService.update(id, req),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['operations-clients'] }); setShowModal(false); },
  });

  const handleOpen = (client?: Client) => {
    if (client) {
      setEditing(client);
      setForm({
        name: client.name,
        taxId: client.taxId ?? '',
        contactName: client.contactName ?? '',
        contactEmail: client.contactEmail ?? '',
        contactPhone: client.contactPhone ?? '',
        internalNotes: client.internalNotes ?? '',
      });
    } else {
      setEditing(null);
      setForm(emptyForm);
    }
    setShowModal(true);
  };

  const handleSubmit = () => {
    const req: CreateClientRequest = {
      name: form.name,
      taxId: form.taxId || undefined,
      contactName: form.contactName || undefined,
      contactEmail: form.contactEmail || undefined,
      contactPhone: form.contactPhone || undefined,
      internalNotes: form.internalNotes || undefined,
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, req });
    } else {
      createMutation.mutate(req);
    }
  };

  if (isLoading) return <div className="text-center py-5"><Spinner /></div>;
  if (isError) return <ApiErrorAlert error={error} resourceLabel="clients" />;

  return (
    <div>
      <PageHeader
        title={t('clients.title')}
        actions={
          <Button size="sm" variant="primary" onClick={() => handleOpen()}>
            + {t('clients.new')}
          </Button>
        }
      />

      <div className="table-responsive">
        <Table striped hover className="mb-0">
          <thead>
            <tr>
              <th>{t('clients.name')}</th>
              <th>{t('clients.taxId')}</th>
              <th>{t('clients.contactName')}</th>
              <th>{t('clients.contactEmail')}</th>
              <th>{t('clients.status')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-muted py-4">{t('clients.noClients')}</td></tr>
            ) : clients.map(c => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.taxId ?? '—'}</td>
                <td>{c.contactName ?? '—'}</td>
                <td>{c.contactEmail ?? '—'}</td>
                <td>
                  <Badge bg={c.status === 'ACTIVE' ? 'success' : 'secondary'}>
                    {t(`clients.${c.status}`)}
                  </Badge>
                </td>
                <td>
                  <Button size="sm" variant="outline-secondary" onClick={() => handleOpen(c)}>
                    {t('clients.edit')}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editing ? t('clients.edit') : t('clients.new')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {(['name', 'taxId', 'contactName', 'contactEmail', 'contactPhone'] as const).map(f => (
              <Form.Group className="mb-3" key={f}>
                <Form.Label>{t(`clients.${f}`)}</Form.Label>
                <Form.Control
                  value={form[f]}
                  onChange={e => setForm(prev => ({ ...prev, [f]: e.target.value }))}
                  required={f === 'name'}
                />
              </Form.Group>
            ))}
            <Form.Group className="mb-3">
              <Form.Label>{t('clients.internalNotes')}</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={form.internalNotes}
                onChange={e => setForm(prev => ({ ...prev, internalNotes: e.target.value }))}
              />
            </Form.Group>
          </Form>
          {(createMutation.isError || updateMutation.isError) && (
            <div className="text-danger mt-2">
              {(createMutation.error as Error)?.message ?? (updateMutation.error as Error)?.message}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
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
