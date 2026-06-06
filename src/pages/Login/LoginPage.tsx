import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Alert, Button, Form, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { authService } from '../../api/auth.service';
import { APP_COPYRIGHT } from '../../config/appMeta';
import { LanguageSwitcher } from '../../components/LanguageSwitcher/LanguageSwitcher';
import { useAuth } from '../../context/AuthContext';
import { consumeStaleSessionFlag } from '../../utils/jwt';
import styles from './LoginPage.module.css';

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
    <div className={styles.shell}>
      <aside className={styles.brandPanel} aria-hidden={false}>
        <div className={styles.brandInner}>
          <div className={styles.logoMark}>SC</div>
          <h1 className={styles.brandTitle}>{t('common:appName')}</h1>
          <p className={styles.brandTagline}>{t('auth:brandTagline')}</p>
        </div>
        <p className={styles.brandFooter}>{APP_COPYRIGHT}</p>
      </aside>

      <main className={styles.formPanel}>
        <div className={styles.formCard}>
          <div className={styles.langRow}>
            <LanguageSwitcher id="login-language" />
          </div>

          <div className={styles.formHeader}>
            <div className={styles.mobileBrand}>
              <div className={styles.mobileLogo}>SC</div>
              <div>
                <h2 className={styles.formTitle}>{t('common:appName')}</h2>
              </div>
            </div>
            <h2 className={styles.formTitle}>{t('auth:title')}</h2>
            <p className={styles.formSubtitle}>{t('auth:subtitle')}</p>
          </div>

          {staleSession && (
            <Alert variant="warning" className="py-2 mb-3">
              {t('auth:staleSession')}
            </Alert>
          )}

          {mutation.isError && (
            <Alert variant="danger" className="py-2 mb-3">
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

            <Button type="submit" variant="primary" className="w-100 py-2" disabled={mutation.isPending}>
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
        </div>
      </main>
    </div>
  );
}
