import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Card, Form, Spinner } from 'react-bootstrap';
import { rolesService } from '../../api/roles.service';
import type { CreateRoleRequest, UpdateRoleRequest } from '../../types';

export function RoleFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = id !== undefined;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [serverError, setServerError] = useState('');

  const { data: role, isLoading } = useQuery({
    queryKey: ['roles', id],
    queryFn: () => rolesService.findById(Number(id)),
    enabled: isEdit,
  });

  useEffect(() => {
    if (role) {
      setName(role.name);
      setDescription(role.description ?? '');
    }
  }, [role]);

  const mutation = useMutation({
    mutationFn: () =>
      isEdit
        ? rolesService.update(Number(id), { name, description } as UpdateRoleRequest)
        : rolesService.create({ name, description } as CreateRoleRequest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      navigate('/admin/roles');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setServerError(err.response?.data?.message ?? 'Failed to save role.');
    },
  });

  if (isEdit && isLoading) return <div className="text-center py-5"><Spinner /></div>;

  return (
    <div style={{ maxWidth: 540 }}>
      <h4 className="mb-4">{isEdit ? 'Edit Role' : 'New Role'}</h4>
      <Card>
        <Card.Body>
          {serverError && <Alert variant="danger" className="py-2">{serverError}</Alert>}
          <Form onSubmit={(e) => { e.preventDefault(); setServerError(''); mutation.mutate(); }}>
            <Form.Group className="mb-3">
              <Form.Label>Role Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                value={name}
                onChange={(e) => setName(e.target.value.toUpperCase())}
                placeholder="e.g. SUPERVISOR"
                required maxLength={100}
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea" rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={255}
              />
            </Form.Group>
            <div className="d-flex gap-2">
              <Button type="submit" variant="primary" disabled={mutation.isPending}>
                {mutation.isPending ? <Spinner as="span" size="sm" className="me-2" /> : null}
                {isEdit ? 'Update' : 'Create'}
              </Button>
              <Button variant="secondary" onClick={() => navigate('/admin/roles')}>Cancel</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
