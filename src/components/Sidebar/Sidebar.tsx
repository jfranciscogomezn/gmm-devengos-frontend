import { List } from 'react-bootstrap-icons';
import { useAuth } from '../../context/AuthContext';
import { CollapsibleSidebarNav } from './CollapsibleSidebarNav';
import styles from './Sidebar.module.css';

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

export function Sidebar({ open, onToggle }: SidebarProps) {
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
              {isPlatformAdmin ? 'Platform Console' : tenant?.name ?? 'StepCore'}
            </div>
            {tenant && !isPlatformAdmin && (
              <div className={styles.brandMeta}>{tenant.plan} plan</div>
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
            aria-label="Hide navigation menu"
          >
            <List size={18} />
          </button>
        </div>
      </div>

      <CollapsibleSidebarNav nodes={menu} />

      <div className={styles.footer}>
        <button type="button" className="btn btn-outline-danger btn-sm w-100" onClick={logout}>
          Sign out
        </button>
      </div>
    </aside>
  );
}
