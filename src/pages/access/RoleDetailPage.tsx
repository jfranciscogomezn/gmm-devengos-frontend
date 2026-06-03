import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Card, Form, Nav, Spinner, Tab } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { rolesService } from '../../api/roles.service';
import { RoleMenuPermissionsPanel } from './RoleMenuPermissionsPanel';
import type { CreateRoleRequest, UpdateRoleRequest } from '../../types';

export function RoleDetailPage() {
  const { t } = useTranslation(['access', 'common']);
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
    onError: () => {
      setServerError(t('access:roles.saveFailed'));
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
        <Form.Label>{t('access:roles.roleName')}</Form.Label>
        <Form.Control
          value={name}
          onChange={(e) => setName(e.target.value.toUpperCase())}
          placeholder={t('access:roles.roleNamePlaceholder')}
          required
          maxLength={100}
        />
      </Form.Group>
      <Form.Group className="mb-4">
        <Form.Label>{t('common:labels.description')}</Form.Label>
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
          {isEdit ? t('common:actions.update') : t('common:actions.create')}
        </Button>
        <Button variant="secondary" onClick={() => navigate('/admin/access/roles')}>
          {t('common:actions.cancel')}
        </Button>
      </div>
    </Form>
  );

  return (
    <div style={{ maxWidth: 720 }}>
      <Link to="/admin/access/roles" className="text-decoration-none small">{t('access:backToRoles')}</Link>
      <h4 className="mb-4 mt-2">
        {isEdit ? t('access:roles.editTitle', { name: role?.name ?? '' }) : t('access:roles.newTitle')}
      </h4>

      {!isEdit ? (
        <Card><Card.Body>{generalForm}</Card.Body></Card>
      ) : (
        <Tab.Container
          activeKey={activeTab}
          onSelect={(key) => setSearchParams(key === 'permissions' ? { tab: 'permissions' } : {})}
        >
          <Nav variant="tabs" className="mb-3">
            <Nav.Item>
              <Nav.Link eventKey="general">{t('access:roles.tabs.general')}</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="permissions">{t('access:roles.tabs.permissions')}</Nav.Link>
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
