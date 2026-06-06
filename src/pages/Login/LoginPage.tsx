import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Alert, Button, Form, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { authService } from '../../api/auth.service';
import { BrandMark } from '../../components/brand/BrandMark';
import { LoginSkyline } from '../../components/brand/LoginSkyline';
import { LanguageSwitcher } from '../../components/LanguageSwitcher/LanguageSwitcher';
import { useAuth } from '../../context/AuthContext';
import { consumeStaleSessionFlag } from '../../utils/jwt';
import styles from './LoginPage.module.css';

const LAST_TENANT_KEY = 'stepcore_last_tenant';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c3.4-3.117 5.384-7.702 5.384-13.115z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}

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
          <BrandMark variant="dark" showSubtitle subtitle={t('auth:productLine')} />
          <p className={styles.brandTagline}>{t('auth:brandTagline')}</p>
        </div>
        <LoginSkyline />
      </aside>

      <main className={styles.formPanel}>
        <div className={styles.langRow}>
          <LanguageSwitcher id="login-language" />
        </div>

        <div className={styles.formInner}>
          <div className={styles.mobileBrand}>
            <BrandMark variant="light" showSubtitle subtitle={t('auth:productLine')} />
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

            <div className={styles.divider}>
              <span>{t('auth:orSignInWith')}</span>
            </div>

            <Button
              type="button"
              variant="outline-secondary"
              className={`w-100 ${styles.googleBtn}`}
              disabled
              title={t('auth:socialLoginSoon')}
            >
              <GoogleIcon />
              {t('auth:signInWithGoogle')}
            </Button>
          </Form>
        </div>
      </main>
    </div>
  );
}
