import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Badge, Button, Card, Col, Form, Nav, Row, Spinner, Tab } from 'react-bootstrap';
import { usersService } from '../../api/users.service';
import { rolesService } from '../../api/roles.service';
import type { CreateUserRequest, UpdateUserRequest } from '../../types';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,}$/;

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const valid = PASSWORD_REGEX.test(password);
  const long = password.length >= 12;
  const variant = !valid ? 'danger' : long ? 'success' : 'warning';
  const label = !valid ? 'Weak' : long ? 'Strong' : 'Fair';
  return <Badge bg={variant} className="mt-1">{label}</Badge>;
}

export function UserDetailPage() {
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
      const message = err.response?.data?.message ?? 'Failed to save user.';
      if (message.includes('USER_LIMIT_REACHED')) {
        setServerError(
          "You've reached your plan's user limit. Contact your provider to upgrade the plan or "
          + 'free up a seat by disabling an existing user.',
        );
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
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setServerError(err.response?.data?.message ?? 'Failed to update role.');
    },
  });

  const isLoading = (isEdit && userLoading) || rolesLoading;
  if (isLoading) return <div className="text-center py-5"><Spinner /></div>;

  const validateAndSave = (mutation: { mutate: () => void }) => {
    setServerError('');
    if (!isEdit && !PASSWORD_REGEX.test(password)) {
      setServerError(
        'Password must have at least 8 characters, one uppercase, one lowercase, one digit, and one special character.',
      );
      return;
    }
    if (roleId === '') {
      setServerError('Please select a role.');
      return;
    }
    mutation.mutate();
  };

  const profileFields = (
    <>
      <Row>
        <Col sm={6}>
          <Form.Group className="mb-3">
            <Form.Label>First Name <span className="text-danger">*</span></Form.Label>
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
            <Form.Label>Last Name <span className="text-danger">*</span></Form.Label>
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
        <Form.Label>Email <span className="text-danger">*</span></Form.Label>
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
        <Form.Label>Phone</Form.Label>
        <Form.Control value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} />
      </Form.Group>
      {!isEdit && (
        <Form.Group className="mb-3">
          <Form.Label>Password <span className="text-danger">*</span></Form.Label>
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
      <Form.Label>Role <span className="text-danger">*</span></Form.Label>
      <Form.Select value={roleId} onChange={(e) => setRoleId(Number(e.target.value))} required>
        <option value="">Select a role…</option>
        {roles.map((r) => (
          <option key={r.id} value={r.id}>{r.name}</option>
        ))}
      </Form.Select>
      <Form.Text className="text-muted">
        The role determines which menu screens and permissions the user receives at login.
      </Form.Text>
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
          Create
        </Button>
        <Button variant="secondary" onClick={() => navigate('/admin/access/users')}>Cancel</Button>
      </div>
    </Form>
  );

  return (
    <div style={{ maxWidth: 720 }}>
      <Link to="/admin/access/users" className="text-decoration-none small">&larr; Users</Link>
      <h4 className="mb-4 mt-2">
        {isEdit ? `Edit User — ${user?.firstName ?? ''} ${user?.lastName ?? ''}` : 'New User'}
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
              <Nav.Link eventKey="profile">Profile</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="role">Role Assignment</Nav.Link>
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
                        Update Profile
                      </Button>
                      <Button variant="secondary" onClick={() => navigate('/admin/access/users')}>
                        Cancel
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
                        Save Role
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
