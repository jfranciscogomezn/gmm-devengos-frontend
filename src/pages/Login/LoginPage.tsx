import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Alert, Button, Card, Form, Spinner } from 'react-bootstrap';
import { authService } from '../../api/auth.service';
import { useAuth } from '../../context/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const mutation = useMutation({
    mutationFn: () => authService.login({ email, password }),
    onSuccess: (response) => {
      login(response);
      if (response.mustChangePassword) {
        navigate('/my/profile', { state: { forceChangePassword: true } });
      } else {
        navigate('/dashboard');
      }
    },
  });

  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center bg-light"
      style={{ minHeight: '100vh' }}
    >
      <Card style={{ width: 400 }} className="shadow-sm">
        <Card.Body className="p-4">
          <div className="text-center mb-4">
            <h4 className="fw-bold text-primary">GMM Devengos</h4>
            <p className="text-muted small">Sign in to your account</p>
          </div>

          {mutation.isError && (
            <Alert variant="danger" className="py-2">
              {(mutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message
                ?? 'Invalid credentials. Please try again.'}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={mutation.isPending}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={mutation.isPending}
              />
            </Form.Group>

            <Button type="submit" variant="primary" className="w-100" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
