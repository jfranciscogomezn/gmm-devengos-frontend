import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Badge, Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap';
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

export function UserFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = id !== undefined;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
      setRoleId(user.id);
    }
  }, [user]);

  const mutation = useMutation({
    mutationFn: () => {
      if (isEdit) {
        const req: UpdateUserRequest = { firstName, lastName, phone: phone || undefined, roleId: Number(roleId) };
        return usersService.update(Number(id), req);
      }
      const req: CreateUserRequest = {
        firstName, lastName, email, phone: phone || undefined, password, roleId: Number(roleId),
      };
      return usersService.create(req);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      navigate('/admin/users');
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

  const isLoading = (isEdit && userLoading) || rolesLoading;
  if (isLoading) return <div className="text-center py-5"><Spinner /></div>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!isEdit && !PASSWORD_REGEX.test(password)) {
      setServerError('Password must have at least 8 characters, one uppercase, one lowercase, one digit, and one special character.');
      return;
    }
    if (roleId === '') {
      setServerError('Please select a role.');
      return;
    }
    mutation.mutate();
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <h4 className="mb-4">{isEdit ? 'Edit User' : 'New User'}</h4>
      <Card>
        <Card.Body>
          {serverError && <Alert variant="danger" className="py-2">{serverError}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col sm={6}>
                <Form.Group className="mb-3">
                  <Form.Label>First Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control value={firstName} onChange={(e) => setFirstName(e.target.value)}
                    required maxLength={100} />
                </Form.Group>
              </Col>
              <Col sm={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Last Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control value={lastName} onChange={(e) => setLastName(e.target.value)}
                    required maxLength={100} />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Email <span className="text-danger">*</span></Form.Label>
              <Form.Control type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                required disabled={isEdit} maxLength={255} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} />
            </Form.Group>

            {!isEdit && (
              <Form.Group className="mb-2">
                <Form.Label>Password <span className="text-danger">*</span></Form.Label>
                <Form.Control type="password" value={password}
                  onChange={(e) => setPassword(e.target.value)} required />
                <PasswordStrength password={password} />
              </Form.Group>
            )}

            <Form.Group className="mb-4">
              <Form.Label>Role <span className="text-danger">*</span></Form.Label>
              <Form.Select value={roleId} onChange={(e) => setRoleId(Number(e.target.value))} required>
                <option value="">Select a role…</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <div className="d-flex gap-2">
              <Button type="submit" variant="primary" disabled={mutation.isPending}>
                {mutation.isPending ? <Spinner as="span" size="sm" className="me-2" /> : null}
                {isEdit ? 'Update' : 'Create'}
              </Button>
              <Button variant="secondary" onClick={() => navigate('/admin/users')}>Cancel</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
