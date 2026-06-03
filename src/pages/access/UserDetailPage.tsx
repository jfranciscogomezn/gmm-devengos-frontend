import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Badge, Button, Card, Col, Form, Nav, Row, Spinner, Tab } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { usersService } from '../../api/users.service';
import { rolesService } from '../../api/roles.service';
import type { CreateUserRequest, UpdateUserRequest } from '../../types';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,}$/;

function PasswordStrength({ password }: { password: string }) {
  const { t } = useTranslation('common');
  if (!password) return null;
  const valid = PASSWORD_REGEX.test(password);
  const long = password.length >= 12;
  const variant = !valid ? 'danger' : long ? 'success' : 'warning';
  const label = !valid
    ? t('passwordStrength.weak')
    : long
      ? t('passwordStrength.strong')
      : t('passwordStrength.fair');
  return <Badge bg={variant} className="mt-1">{label}</Badge>;
}

export function UserDetailPage() {
  const { t } = useTranslation(['access', 'common', 'employees']);
  const { id } = useParams<{ id: string }>();
  const isEdit = id !== undefined;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') === 'role' ? 'role' : 'profile';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState<number | ''>('');
  const [serverError, setServerError] = useState('');

  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: rolesService.findAll,
  });

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['users', id],
    queryFn: () => usersService.findById(Number(id)),
    enabled: isEdit,
  });

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email);
      setPhone(user.phone ?? '');
      setRoleId(user.roleId ?? '');
    }
  }, [user]);

  const saveProfileMutation = useMutation({
    mutationFn: () => {
      if (isEdit) {
        const req: UpdateUserRequest = {
          firstName,
          lastName,
          phone: phone || undefined,
          roleId: Number(roleId),
        };
        return usersService.update(Number(id), req);
      }
      const req: CreateUserRequest = {
        firstName,
        lastName,
        email,
        phone: phone || undefined,
        password,
        roleId: Number(roleId),
      };
      return usersService.create(req);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      navigate('/admin/access/users');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      const message = err.response?.data?.message ?? t('access:users.saveFailed');
      if (message.includes('USER_LIMIT_REACHED')) {
        setServerError(t('access:users.userLimitReached'));
        return;
      }
      setServerError(message);
    },
  });

  const saveRoleMutation = useMutation({
    mutationFn: () =>
      usersService.update(Number(id), {
        firstName,
        lastName,
        phone: phone || undefined,
        roleId: Number(roleId),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      navigate('/admin/access/users');
    },
    onError: () => {
      setServerError(t('access:users.roleUpdateFailed'));
    },
  });

  const isLoading = (isEdit && userLoading) || rolesLoading;
  if (isLoading) return <div className="text-center py-5"><Spinner /></div>;

  const validateAndSave = (mutation: { mutate: () => void }) => {
    setServerError('');
    if (!isEdit && !PASSWORD_REGEX.test(password)) {
      setServerError(t('access:users.passwordMin'));
      return;
    }
    if (roleId === '') {
      setServerError(t('access:users.selectRole'));
      return;
    }
    mutation.mutate();
  };

  const profileFields = (
    <>
      <Row>
        <Col sm={6}>
          <Form.Group className="mb-3">
            <Form.Label>{t('employees:form.firstName')}</Form.Label>
            <Form.Control
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              maxLength={100}
            />
          </Form.Group>
        </Col>
        <Col sm={6}>
          <Form.Group className="mb-3">
            <Form.Label>{t('employees:form.lastName')}</Form.Label>
            <Form.Control
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              maxLength={100}
            />
          </Form.Group>
        </Col>
      </Row>
      <Form.Group className="mb-3">
        <Form.Label>{t('common:labels.email')} <span className="text-danger">*</span></Form.Label>
        <Form.Control
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isEdit}
          maxLength={255}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>{t('common:labels.phone')}</Form.Label>
        <Form.Control value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} />
      </Form.Group>
      {!isEdit && (
        <Form.Group className="mb-3">
          <Form.Label>{t('access:users.password')}</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <PasswordStrength password={password} />
        </Form.Group>
      )}
    </>
  );

  const roleSelect = (
    <Form.Group className="mb-4">
      <Form.Label>{t('common:labels.role')} <span className="text-danger">*</span></Form.Label>
      <Form.Select value={roleId} onChange={(e) => setRoleId(Number(e.target.value))} required>
        <option value="">{t('common:placeholders.selectRole')}</option>
        {roles.map((r) => (
          <option key={r.id} value={r.id}>{r.name}</option>
        ))}
      </Form.Select>
      <Form.Text className="text-muted">{t('access:users.roleHint')}</Form.Text>
    </Form.Group>
  );

  const newUserForm = (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        validateAndSave(saveProfileMutation);
      }}
    >
      {serverError && <Alert variant="danger" className="py-2">{serverError}</Alert>}
      {profileFields}
      {roleSelect}
      <div className="d-flex gap-2">
        <Button type="submit" variant="primary" disabled={saveProfileMutation.isPending}>
          {saveProfileMutation.isPending ? <Spinner as="span" size="sm" className="me-2" /> : null}
          {t('common:actions.create')}
        </Button>
        <Button variant="secondary" onClick={() => navigate('/admin/access/users')}>
          {t('common:actions.cancel')}
        </Button>
      </div>
    </Form>
  );

  return (
    <div style={{ maxWidth: 720 }}>
      <Link to="/admin/access/users" className="text-decoration-none small">{t('access:backToUsers')}</Link>
      <h4 className="mb-4 mt-2">
        {isEdit
          ? t('access:users.editTitle', { name: `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() })
          : t('access:users.newTitle')}
      </h4>

      {!isEdit ? (
        <Card><Card.Body>{newUserForm}</Card.Body></Card>
      ) : (
        <Tab.Container
          activeKey={activeTab}
          onSelect={(key) => setSearchParams(key === 'role' ? { tab: 'role' } : {})}
        >
          <Nav variant="tabs" className="mb-3">
            <Nav.Item>
              <Nav.Link eventKey="profile">{t('access:users.tabs.profile')}</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="role">{t('access:users.tabs.role')}</Nav.Link>
            </Nav.Item>
          </Nav>
          <Card>
            <Card.Body>
              {serverError && <Alert variant="danger" className="py-2">{serverError}</Alert>}
              <Tab.Content>
                <Tab.Pane eventKey="profile">
                  <Form
                    onSubmit={(e) => {
                      e.preventDefault();
                      validateAndSave(saveProfileMutation);
                    }}
                  >
                    {profileFields}
                    <div className="d-flex gap-2">
                      <Button type="submit" variant="primary" disabled={saveProfileMutation.isPending}>
                        {saveProfileMutation.isPending ? <Spinner as="span" size="sm" className="me-2" /> : null}
                        {t('access:users.updateProfile')}
                      </Button>
                      <Button variant="secondary" onClick={() => navigate('/admin/access/users')}>
                        {t('common:actions.cancel')}
                      </Button>
                    </div>
                  </Form>
                </Tab.Pane>
                <Tab.Pane eventKey="role">
                  <Form
                    onSubmit={(e) => {
                      e.preventDefault();
                      validateAndSave(saveRoleMutation);
                    }}
                  >
                    {roleSelect}
                    <div className="d-flex gap-2">
                      <Button type="submit" variant="primary" disabled={saveRoleMutation.isPending}>
                        {saveRoleMutation.isPending ? <Spinner as="span" size="sm" className="me-2" /> : null}
                        {t('access:users.saveRole')}
                      </Button>
                    </div>
                  </Form>
                </Tab.Pane>
              </Tab.Content>
            </Card.Body>
          </Card>
        </Tab.Container>
      )}
    </div>
  );
}
