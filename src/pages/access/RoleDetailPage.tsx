import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Card, Form, Nav, Spinner, Tab } from 'react-bootstrap';
import { rolesService } from '../../api/roles.service';
import { RoleMenuPermissionsPanel } from './RoleMenuPermissionsPanel';
import type { CreateRoleRequest, UpdateRoleRequest } from '../../types';

export function RoleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = id !== undefined;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') === 'permissions' ? 'permissions' : 'general';

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
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      if (isEdit) return;
      navigate(`/admin/access/roles/${saved.id}?tab=permissions`);
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setServerError(err.response?.data?.message ?? 'Failed to save role.');
    },
  });

  if (isEdit && isLoading) {
    return <div className="text-center py-5"><Spinner /></div>;
  }

  const generalForm = (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        setServerError('');
        mutation.mutate();
      }}
    >
      {serverError && <Alert variant="danger" className="py-2">{serverError}</Alert>}
      <Form.Group className="mb-3">
        <Form.Label>Role Name <span className="text-danger">*</span></Form.Label>
        <Form.Control
          value={name}
          onChange={(e) => setName(e.target.value.toUpperCase())}
          placeholder="e.g. SUPERVISOR"
          required
          maxLength={100}
        />
      </Form.Group>
      <Form.Group className="mb-4">
        <Form.Label>Description</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
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
        <Button variant="secondary" onClick={() => navigate('/admin/access/roles')}>
          Cancel
        </Button>
      </div>
    </Form>
  );

  return (
    <div style={{ maxWidth: 720 }}>
      <Link to="/admin/access/roles" className="text-decoration-none small">&larr; Roles</Link>
      <h4 className="mb-4 mt-2">{isEdit ? `Edit Role — ${role?.name ?? ''}` : 'New Role'}</h4>

      {!isEdit ? (
        <Card><Card.Body>{generalForm}</Card.Body></Card>
      ) : (
        <Tab.Container
          activeKey={activeTab}
          onSelect={(key) => setSearchParams(key === 'permissions' ? { tab: 'permissions' } : {})}
        >
          <Nav variant="tabs" className="mb-3">
            <Nav.Item>
              <Nav.Link eventKey="general">General</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="permissions">Menu Permissions</Nav.Link>
            </Nav.Item>
          </Nav>
          <Card>
            <Card.Body>
              <Tab.Content>
                <Tab.Pane eventKey="general">{generalForm}</Tab.Pane>
                <Tab.Pane eventKey="permissions">
                  <RoleMenuPermissionsPanel
                    roleId={Number(id)}
                    roleName={role?.name}
                    onSaved={() => navigate('/admin/access/roles')}
                  />
                </Tab.Pane>
              </Tab.Content>
            </Card.Body>
          </Card>
        </Tab.Container>
      )}
    </div>
  );
}
