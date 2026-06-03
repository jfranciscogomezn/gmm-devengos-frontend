import { List } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../LanguageSwitcher/LanguageSwitcher';
import { useAuth } from '../../context/AuthContext';
import { CollapsibleSidebarNav } from './CollapsibleSidebarNav';
import styles from './Sidebar.module.css';

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

export function Sidebar({ open, onToggle }: SidebarProps) {
  const { t } = useTranslation(['dashboard', 'common']);
  const { menu, currentUser, tenant, isPlatformAdmin, logout } = useAuth();

  const initials = (tenant?.name ?? 'SC')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <aside className={`${styles.sidebar} ${open ? '' : styles.sidebarClosed}`} aria-hidden={!open}>
      <div className={styles.brand}>
        <div className={styles.brandHeader}>
          <div className={styles.brandContent}>
            <div className={styles.brandLogo}>{initials || 'SC'}</div>
            <div className={styles.brandTitle}>
              {isPlatformAdmin ? t('dashboard:platformConsole') : tenant?.name ?? t('common:appName')}
            </div>
            {tenant && !isPlatformAdmin && (
              <div className={styles.brandMeta}>{t('common:planSuffix', { plan: tenant.plan })}</div>
            )}
            {currentUser && (
              <div className={styles.brandUser}>
                {currentUser.firstName} {currentUser.lastName} · {currentUser.roleName}
              </div>
            )}
          </div>
          <button
            type="button"
            className={styles.menuToggle}
            onClick={onToggle}
            aria-label={t('common:aria.hideNavigation')}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      <CollapsibleSidebarNav nodes={menu} />

      <div className={styles.footer}>
        <div className="mb-2">
          <LanguageSwitcher id="sidebar-language" />
        </div>
        <button type="button" className="btn btn-outline-danger btn-sm w-100" onClick={logout}>
          {t('common:actions.signOut')}
        </button>
      </div>
    </aside>
  );
}
