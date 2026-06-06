import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Alert, Button, Form, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { authService } from '../../api/auth.service';
import { LoginBrandHeader } from './LoginBrandHeader';
import { LoginSkyline } from '../../components/brand/LoginSkyline';
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
      <aside className={styles.brandPanel}>
        <div className={styles.brandInner}>
          <LoginBrandHeader
            productLine={t('auth:productLine')}
            tagline={t('auth:brandTagline')}
          />
        </div>
        <LoginSkyline />
      </aside>

      <main className={styles.formPanel}>
        <div className={styles.langRow}>
          <LanguageSwitcher id="login-language" appearance="compact" />
        </div>

        <div className={styles.formInner}>
          <div className={styles.mobileBrand}>
            <LoginBrandHeader
              variant="light"
              hideTagline
              productLine={t('auth:productLine')}
              tagline={t('auth:brandTagline')}
            />
          </div>

          <header className={styles.formHeader}>
            <h1 className={styles.formTitle}>{t('auth:welcomeBack')}</h1>
            <p className={styles.formSubtitle}>{t('auth:signInSubtitle')}</p>
          </header>

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

          <Form onSubmit={handleSubmit} className={styles.form}>
            <Form.Group className="mb-3">
              <Form.Label className={styles.label}>{t('auth:company')}</Form.Label>
              <Form.Control
                type="text"
                placeholder={t('auth:companyPlaceholder')}
                value={tenantSlug}
                onChange={(e) => setTenantSlug(e.target.value)}
                required
                autoCapitalize="none"
                autoCorrect="off"
                disabled={mutation.isPending}
                className={styles.input}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className={styles.label}>{t('auth:email')}</Form.Label>
              <Form.Control
                type="email"
                placeholder={t('auth:emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={mutation.isPending}
                className={styles.input}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <div className={styles.passwordRow}>
                <Form.Label className={`${styles.label} mb-0`}>{t('auth:password')}</Form.Label>
                <button type="button" className={styles.forgotLink} disabled title={t('auth:forgotPasswordSoon')}>
                  {t('auth:forgotPassword')}
                </button>
              </div>
              <Form.Control
                type="password"
                placeholder={t('auth:passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={mutation.isPending}
                className={styles.input}
              />
            </Form.Group>

            <Button type="submit" variant="primary" className={`w-100 ${styles.signInBtn}`} disabled={mutation.isPending}>
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
