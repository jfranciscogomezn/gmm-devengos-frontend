import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Alert, Button, Card, Form, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { authService } from '../../api/auth.service';
import { LanguageSwitcher } from '../../components/LanguageSwitcher/LanguageSwitcher';
import { useAuth } from '../../context/AuthContext';
import { consumeStaleSessionFlag } from '../../utils/jwt';

const LAST_TENANT_KEY = 'stepcore_last_tenant';

export function LoginPage() {
  const { t } = useTranslation(['auth', 'common']);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [staleSession] = useState(() => consumeStaleSessionFlag());

  const [tenantSlug, setTenantSlug] = useState(() => localStorage.getItem(LAST_TENANT_KEY) ?? '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const mutation = useMutation({
    mutationFn: () => authService.login({ tenantSlug: tenantSlug.trim().toLowerCase(), email, password }),
    onSuccess: (response) => {
      localStorage.setItem(LAST_TENANT_KEY, response.tenantSlug);
      login(response);
      if (response.mustChangePassword) {
        navigate('/my/profile', { state: { forceChangePassword: true } });
      } else if (response.roleName === 'PLATFORM_ADMIN') {
        navigate('/platform/tenants');
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
          <div className="d-flex justify-content-end mb-3">
            <LanguageSwitcher id="login-language" />
          </div>
          <div className="text-center mb-4">
            <h4 className="fw-bold text-primary">{t('common:appName')}</h4>
            <p className="text-muted small">{t('auth:title')}</p>
          </div>

          {staleSession && (
            <Alert variant="warning" className="py-2">
              {t('auth:staleSession')}
            </Alert>
          )}

          {mutation.isError && (
            <Alert variant="danger" className="py-2">
              {(mutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message
                ?? t('auth:invalidCredentials')}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>{t('auth:company')}</Form.Label>
              <Form.Control
                type="text"
                placeholder={t('auth:companyPlaceholder')}
                value={tenantSlug}
                onChange={(e) => setTenantSlug(e.target.value)}
                required
                autoCapitalize="none"
                autoCorrect="off"
                disabled={mutation.isPending}
              />
              <Form.Text className="text-muted">{t('auth:companyHint')}</Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('auth:email')}</Form.Label>
              <Form.Control
                type="email"
                placeholder={t('auth:emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={mutation.isPending}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>{t('auth:password')}</Form.Label>
              <Form.Control
                type="password"
                placeholder={t('auth:passwordPlaceholder')}
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
                  {t('common:actions.signingIn')}
                </>
              ) : (
                t('common:actions.signIn')
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
