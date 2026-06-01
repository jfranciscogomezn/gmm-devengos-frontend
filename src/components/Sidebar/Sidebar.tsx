import { useAuth } from '../../context/AuthContext';
import { CollapsibleSidebarNav } from './CollapsibleSidebarNav';
import styles from './Sidebar.module.css';

export function Sidebar() {
  const { menu, currentUser, tenant, isPlatformAdmin, logout } = useAuth();

  const initials = (tenant?.name ?? 'SC')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
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

      <CollapsibleSidebarNav nodes={menu} />

      <div className={styles.footer}>
        <button type="button" className="btn btn-outline-danger btn-sm w-100" onClick={logout}>
          Sign out
        </button>
      </div>
    </aside>
  );
}
