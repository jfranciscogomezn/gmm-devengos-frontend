import { useState } from 'react';
import { Badge, Button, Form, Modal, Spinner, Table } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { vehiclesService, type CreateVehicleRequest } from '../../../api/vehicles.service';
import type { Vehicle, VehicleStatus } from '../../../types';
import { PageHeader } from '../../../components/ui/PageHeader';
import { ApiErrorAlert } from '../../../components/ApiErrorAlert/ApiErrorAlert';

const VEHICLE_TYPES = ['CAMION', 'TRACTOMULA', 'FURGON', 'VAN', 'OTRO'];
const STATUS_VARIANTS: Record<VehicleStatus, string> = {
  ACTIVE: 'success',
  MAINTENANCE: 'warning',
  RETIRED: 'secondary',
};

interface FormValues {
  plate: string;
  type: string;
  brand: string;
  model: string;
  year: string;
  internalNotes: string;
}

const emptyForm: FormValues = { plate: '', type: 'CAMION', brand: '', model: '', year: '', internalNotes: '' };

export function VehiclesPage() {
  const { t } = useTranslation('operations');
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [form, setForm] = useState<FormValues>(emptyForm);

  const { data: vehicles = [], isLoading, isError, error } = useQuery({
    queryKey: ['operations-vehicles', statusFilter],
    queryFn: () => vehiclesService.findAll(statusFilter || undefined),
  });

  const createMutation = useMutation({
    mutationFn: (req: CreateVehicleRequest) => vehiclesService.create(req),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['operations-vehicles'] }); setShowModal(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, req }: { id: number; req: Partial<CreateVehicleRequest> }) =>
      vehiclesService.update(id, req),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['operations-vehicles'] }); setShowModal(false); },
  });

  const handleOpen = (v?: Vehicle) => {
    if (v) {
      setEditing(v);
      setForm({ plate: v.plate, type: v.type, brand: v.brand ?? '', model: v.model ?? '', year: v.year?.toString() ?? '', internalNotes: v.internalNotes ?? '' });
    } else {
      setEditing(null);
      setForm(emptyForm);
    }
    setShowModal(true);
  };

  const handleSubmit = () => {
    const req: CreateVehicleRequest = {
      plate: form.plate,
      type: form.type,
      brand: form.brand || undefined,
      model: form.model || undefined,
      year: form.year ? parseInt(form.year, 10) : undefined,
      internalNotes: form.internalNotes || undefined,
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, req });
    } else {
      createMutation.mutate(req);
    }
  };

  if (isLoading) return <div className="text-center py-5"><Spinner /></div>;
  if (isError) return <ApiErrorAlert error={error} resourceLabel="vehicles" />;

  return (
    <div>
      <PageHeader
        title={t('vehicles.title')}
        actions={
          <Button size="sm" variant="primary" onClick={() => handleOpen()}>
            + {t('vehicles.new')}
          </Button>
        }
      />

      <div className="d-flex gap-2 mb-3">
        <Form.Select
          size="sm"
          style={{ maxWidth: 160 }}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">{t('vehicles.status')}: All</option>
          {(['ACTIVE', 'MAINTENANCE', 'RETIRED'] as VehicleStatus[]).map(s => (
            <option key={s} value={s}>{t(`vehicles.${s}`)}</option>
          ))}
        </Form.Select>
      </div>

      <div className="table-responsive">
        <Table striped hover className="mb-0">
          <thead>
            <tr>
              <th>{t('vehicles.plate')}</th>
              <th>{t('vehicles.type')}</th>
              <th>{t('vehicles.brand')}</th>
              <th>{t('vehicles.model')}</th>
              <th>{t('vehicles.year')}</th>
              <th>{t('vehicles.status')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {vehicles.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-muted py-4">{t('vehicles.noVehicles')}</td></tr>
            ) : vehicles.map(v => (
              <tr key={v.id}>
                <td><strong>{v.plate}</strong></td>
                <td>{t(`vehicles.${v.type}`)}</td>
                <td>{v.brand ?? '—'}</td>
                <td>{v.model ?? '—'}</td>
                <td>{v.year ?? '—'}</td>
                <td>
                  <Badge bg={STATUS_VARIANTS[v.status]}>{t(`vehicles.${v.status}`)}</Badge>
                </td>
                <td>
                  <Button size="sm" variant="outline-secondary" onClick={() => handleOpen(v)}>
                    {t('vehicles.edit')}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editing ? t('vehicles.edit') : t('vehicles.new')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>{t('vehicles.plate')}</Form.Label>
              <Form.Control
                value={form.plate}
                onChange={e => setForm(p => ({ ...p, plate: e.target.value.toUpperCase().replace(/\s/g, '') }))}
                disabled={!!editing}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t('vehicles.type')}</Form.Label>
              <Form.Select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                {VEHICLE_TYPES.map(ty => <option key={ty} value={ty}>{t(`vehicles.${ty}`)}</option>)}
              </Form.Select>
            </Form.Group>
            {(['brand', 'model'] as const).map(f => (
              <Form.Group className="mb-3" key={f}>
                <Form.Label>{t(`vehicles.${f}`)}</Form.Label>
                <Form.Control value={form[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))} />
              </Form.Group>
            ))}
            <Form.Group className="mb-3">
              <Form.Label>{t('vehicles.year')}</Form.Label>
              <Form.Control
                type="number"
                value={form.year}
                onChange={e => setForm(p => ({ ...p, year: e.target.value }))}
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
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={createMutation.isPending || updateMutation.isPending || !form.plate}
          >
            {createMutation.isPending || updateMutation.isPending ? <Spinner size="sm" /> : 'Save'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
