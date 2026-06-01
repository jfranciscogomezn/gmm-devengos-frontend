import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Badge, Button, Modal, Spinner, Table } from 'react-bootstrap';
import { rolesService } from '../../api/roles.service';
import { ApiErrorAlert } from '../../components/ApiErrorAlert/ApiErrorAlert';
import type { Role } from '../../types';

export function RoleListPage() {
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
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setDeleteError(err.response?.data?.message ?? 'Failed to delete role.');
    },
  });

  if (isLoading) return <div className="text-center py-5"><Spinner /></div>;
  if (isError) return <ApiErrorAlert error={error} resourceLabel="roles" />;

  return (
    <div>
      <Link to="/admin/access" className="text-decoration-none small">&larr; Access Control</Link>
      <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
        <h4 className="mb-0">Roles &amp; Permissions</h4>
        <Link to="/admin/access/roles/new" className="btn btn-primary btn-sm">+ New Role</Link>
      </div>

      <Table striped hover responsive>
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Description</th>
            <th>Menu Items</th>
            <th>Actions</th>
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
                <Link to={`/admin/access/roles/${role.id}`} className="btn btn-outline-primary btn-sm me-1">Edit</Link>
                <Link to={`/admin/access/roles/${role.id}?tab=permissions`} className="btn btn-outline-secondary btn-sm me-1">Permissions</Link>
                <Button size="sm" variant="outline-danger" onClick={() => { setDeleteTarget(role); setDeleteError(''); }}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
          {roles.length === 0 && (
            <tr><td colSpan={5} className="text-center text-muted py-4">No roles found.</td></tr>
          )}
        </tbody>
      </Table>

      <Modal show={deleteTarget !== null} onHide={() => setDeleteTarget(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deleteError && <Alert variant="danger" className="py-2">{deleteError}</Alert>}
          Are you sure you want to delete role <strong>{deleteTarget?.name}</strong>?
          This action cannot be undone.
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
