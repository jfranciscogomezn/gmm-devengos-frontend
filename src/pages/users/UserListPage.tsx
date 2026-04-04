import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Badge, Button, Modal, Spinner, Table } from 'react-bootstrap';
import { usersService } from '../../api/users.service';
import type { UserProfile } from '../../types';

export function UserListPage() {
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null);
  const [actionError, setActionError] = useState('');

  const { data: users = [], isLoading, isError } = useQuery({
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
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setActionError(err.response?.data?.message ?? 'Cannot delete user.');
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
  if (isError) return <Alert variant="danger">Failed to load users.</Alert>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">User Management</h4>
        <Link to="/admin/users/new" className="btn btn-primary btn-sm">+ New User</Link>
      </div>

      {actionError && <Alert variant="danger" dismissible onClose={() => setActionError('')}>{actionError}</Alert>}

      <Table striped hover responsive>
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
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
                  {user.enabled ? 'Active' : 'Disabled'}
                </Badge>
                {user.mustChangePassword && (
                  <Badge bg="warning" text="dark" className="ms-1">Must Change PW</Badge>
                )}
              </td>
              <td>
                <Link to={`/admin/users/${user.id}`} className="btn btn-outline-primary btn-sm me-1">Edit</Link>
                <Button
                  size="sm"
                  variant={user.enabled ? 'outline-warning' : 'outline-success'}
                  className="me-1"
                  disabled={statusMutation.isPending}
                  onClick={() => statusMutation.mutate({ id: user.id, enabled: !user.enabled })}
                >
                  {user.enabled ? 'Disable' : 'Enable'}
                </Button>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  className="me-1"
                  disabled={resetMutation.isPending}
                  onClick={() => resetMutation.mutate(user.id)}
                >
                  Reset PW
                </Button>
                <Button
                  size="sm"
                  variant="outline-danger"
                  onClick={() => { setDeleteTarget(user); setActionError(''); }}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr><td colSpan={6} className="text-center text-muted py-4">No users found.</td></tr>
          )}
        </tbody>
      </Table>

      <Modal show={deleteTarget !== null} onHide={() => setDeleteTarget(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {actionError && <Alert variant="danger" className="py-2">{actionError}</Alert>}
          Are you sure you want to delete user{' '}
          <strong>{deleteTarget?.firstName} {deleteTarget?.lastName}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button
            variant="danger"
            onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? <Spinner as="span" size="sm" className="me-1" /> : null}
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
