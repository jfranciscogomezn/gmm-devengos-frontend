import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Badge, Button, Modal, Spinner, Table } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { usersService } from '../../api/users.service';
import { ApiErrorAlert } from '../../components/ApiErrorAlert/ApiErrorAlert';
import type { UserProfile } from '../../types';

export function UserListPage() {
  const { t } = useTranslation(['access', 'common']);
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null);
  const [actionError, setActionError] = useState('');

  const { data: users = [], isLoading, isError, error } = useQuery({
    queryKey: ['users'],
    queryFn: usersService.findAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeleteTarget(null);
      setActionError('');
    },
    onError: () => {
      setActionError(t('access:users.deleteFailed'));
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
      usersService.setStatus(id, enabled),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const resetMutation = useMutation({
    mutationFn: (id: number) => usersService.resetPassword(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  if (isLoading) return <div className="text-center py-5"><Spinner /></div>;
  if (isError) return <ApiErrorAlert error={error} resourceLabel="users" />;

  return (
    <div>
      <Link to="/admin/access" className="text-decoration-none small">{t('access:backToAccess')}</Link>
      <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
        <h4 className="mb-0">{t('access:users.title')}</h4>
        <Link to="/admin/access/users/new" className="btn btn-primary btn-sm">
          + {t('access:users.new')}
        </Link>
      </div>

      {actionError && <Alert variant="danger" dismissible onClose={() => setActionError('')}>{actionError}</Alert>}

      <Table striped hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>{t('common:labels.name')}</th>
            <th>{t('common:labels.email')}</th>
            <th>{t('common:labels.role')}</th>
            <th>{t('common:labels.status')}</th>
            <th>{t('common:labels.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.firstName} {user.lastName}</td>
              <td className="text-muted">{user.email}</td>
              <td><Badge bg="secondary">{user.roleName}</Badge></td>
              <td>
                <Badge bg={user.enabled ? 'success' : 'danger'}>
                  {user.enabled ? t('common:status.active') : t('common:status.disabled')}
                </Badge>
                {user.mustChangePassword && (
                  <Badge bg="warning" text="dark" className="ms-1">{t('common:status.mustChangePassword')}</Badge>
                )}
              </td>
              <td>
                <Link to={`/admin/access/users/${user.id}`} className="btn btn-outline-primary btn-sm me-1">
                  {t('common:actions.edit')}
                </Link>
                <Button
                  size="sm"
                  variant={user.enabled ? 'outline-warning' : 'outline-success'}
                  className="me-1"
                  disabled={statusMutation.isPending}
                  onClick={() => statusMutation.mutate({ id: user.id, enabled: !user.enabled })}
                >
                  {user.enabled ? t('common:actions.disable') : t('common:actions.enable')}
                </Button>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  className="me-1"
                  disabled={resetMutation.isPending}
                  onClick={() => resetMutation.mutate(user.id)}
                >
                  {t('access:users.resetPasswordShort')}
                </Button>
                <Button
                  size="sm"
                  variant="outline-danger"
                  onClick={() => { setDeleteTarget(user); setActionError(''); }}
                >
                  {t('common:actions.delete')}
                </Button>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr><td colSpan={6} className="text-center text-muted py-4">{t('access:users.empty')}</td></tr>
          )}
        </tbody>
      </Table>

      <Modal show={deleteTarget !== null} onHide={() => setDeleteTarget(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('common:actions.confirmDelete')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {actionError && <Alert variant="danger" className="py-2">{actionError}</Alert>}
          {t('access:users.deleteConfirm', {
            name: deleteTarget ? `${deleteTarget.firstName} ${deleteTarget.lastName}` : '',
          })}
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
