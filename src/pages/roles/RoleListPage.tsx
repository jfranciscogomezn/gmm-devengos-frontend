import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Badge, Button, Modal, Spinner, Table } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { rolesService } from '../../api/roles.service';
import { ApiErrorAlert } from '../../components/ApiErrorAlert/ApiErrorAlert';
import type { Role } from '../../types';

export function RoleListPage() {
  const { t } = useTranslation(['access', 'common']);
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const { data: roles = [], isLoading, isError, error } = useQuery({
    queryKey: ['roles'],
    queryFn: rolesService.findAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => rolesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setDeleteTarget(null);
      setDeleteError('');
    },
    onError: () => {
      setDeleteError(t('access:roles.deleteFailed'));
    },
  });

  if (isLoading) return <div className="text-center py-5"><Spinner /></div>;
  if (isError) return <ApiErrorAlert error={error} resourceLabel="roles" />;

  return (
    <div>
      <Link to="/admin/access" className="text-decoration-none small">{t('access:backToAccess')}</Link>
      <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
        <h4 className="mb-0">{t('access:roles.title')}</h4>
        <Link to="/admin/access/roles/new" className="btn btn-primary btn-sm">
          + {t('access:roles.new')}
        </Link>
      </div>

      <Table striped hover responsive>
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>{t('common:labels.name')}</th>
            <th>{t('common:labels.description')}</th>
            <th>{t('access:roles.menuItems')}</th>
            <th>{t('common:labels.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.id}>
              <td>{role.id}</td>
              <td><Badge bg="secondary">{role.name}</Badge></td>
              <td className="text-muted">{role.description ?? '—'}</td>
              <td>{role.menuNodes?.length ?? 0}</td>
              <td>
                <Link to={`/admin/access/roles/${role.id}`} className="btn btn-outline-primary btn-sm me-1">
                  {t('common:actions.edit')}
                </Link>
                <Link to={`/admin/access/roles/${role.id}?tab=permissions`} className="btn btn-outline-secondary btn-sm me-1">
                  {t('access:roles.permissions')}
                </Link>
                <Button size="sm" variant="outline-danger" onClick={() => { setDeleteTarget(role); setDeleteError(''); }}>
                  {t('common:actions.delete')}
                </Button>
              </td>
            </tr>
          ))}
          {roles.length === 0 && (
            <tr><td colSpan={5} className="text-center text-muted py-4">{t('access:roles.empty')}</td></tr>
          )}
        </tbody>
      </Table>

      <Modal show={deleteTarget !== null} onHide={() => setDeleteTarget(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('common:actions.confirmDelete')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deleteError && <Alert variant="danger" className="py-2">{deleteError}</Alert>}
          {t('access:roles.deleteConfirm', { name: deleteTarget?.name ?? '' })}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>{t('common:actions.cancel')}</Button>
          <Button
            variant="danger"
            onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? <Spinner as="span" size="sm" className="me-1" /> : null}
            {t('common:actions.delete')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
