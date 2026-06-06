import { Link, NavLink } from 'react-router-dom';
import { ChevronRight, List, Speedometer2 } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import { BrandMark } from '../brand/BrandMark';
import { useAuth } from '../../context/AuthContext';
import { CollapsibleSidebarNav } from './CollapsibleSidebarNav';
import styles from './Sidebar.module.css';

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

function userInitials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase() || '?';
}

export function Sidebar({ open, onToggle }: SidebarProps) {
  const { t } = useTranslation(['dashboard', 'common', 'menu', 'auth']);
  const { menu, currentUser, tenant, isPlatformAdmin, logout } = useAuth();

  return (
    <aside className={`${styles.sidebar} ${open ? '' : styles.sidebarClosed}`} aria-hidden={!open}>
      <div className={styles.brand}>
        <div className={styles.brandHeader}>
          <BrandMark
            variant="dark"
            size="sidebar"
            showSubtitle
            subtitle={t('auth:productLine')}
          />
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

      <nav className={styles.nav}>
        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) => `${styles.link} ${isActive ? styles.linkActive : ''}`}
        >
          <span className={styles.icon}><Speedometer2 size={18} /></span>
          <span className={styles.linkLabel}>{t('menu:DASHBOARD')}</span>
        </NavLink>
        <CollapsibleSidebarNav nodes={menu} />
      </nav>

      {currentUser && (
        <div className={styles.userFooter}>
          {tenant && !isPlatformAdmin && (
            <p className={styles.tenantName}>{tenant.name}</p>
          )}
          <Link to="/my/profile" className={styles.userProfile}>
            <span className={styles.avatar}>
              {userInitials(currentUser.firstName, currentUser.lastName)}
            </span>
            <span className={styles.userMeta}>
              <span className={styles.userName}>
                {currentUser.firstName} {currentUser.lastName}
              </span>
              <span className={styles.userRole}>{currentUser.roleName}</span>
            </span>
            <ChevronRight size={14} className={styles.userChevron} />
          </Link>
          <button type="button" className={styles.signOutBtn} onClick={logout}>
            {t('common:actions.signOut')}
          </button>
        </div>
      )}
    </aside>
  );
}
