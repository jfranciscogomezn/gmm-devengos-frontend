import { NavLink } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

const MENU_ICONS: Record<string, string> = {
  ROLE_MANAGEMENT: '🔑',
  USER_MANAGEMENT: '👥',
  PAYROLL_CONFIG: '⚙️',
  EMPLOYEE_CONFIG: '🧑‍💼',
  TIME_RECORDS_ADMIN: '🕐',
  REPORTS: '📊',
  MY_TIME: '🗓️',
  MY_PROFILE: '👤',
};

const NAV_LINK_CLASS = ({ isActive }: { isActive: boolean }) =>
  `nav-link text-white-50 px-2 py-2 rounded d-flex align-items-center gap-2 ${
    isActive ? 'bg-primary text-white' : 'hover-bg-secondary'
  }`;

export function Sidebar() {
  const { menuOptions, currentUser, tenant, isPlatformAdmin, logout } = useAuth();

  return (
    <div
      className="d-flex flex-column bg-dark text-white"
      style={{ width: 240, minHeight: '100vh', padding: '1rem 0' }}
    >
      <div className="px-3 mb-4">
        <div className="fw-bold fs-5 text-primary text-truncate">
          {isPlatformAdmin ? 'Platform Console' : tenant?.name ?? 'Workspace'}
        </div>
        {tenant && !isPlatformAdmin && (
          <div className="text-uppercase text-white-50" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>
            {tenant.plan} plan
          </div>
        )}
        {currentUser && (
          <div className="text-muted small mt-1">
            {currentUser.firstName} · {currentUser.roleName}
          </div>
        )}
      </div>

      <Nav className="flex-column px-2 flex-grow-1">
        {isPlatformAdmin && (
          <Nav.Item>
            <NavLink to="/platform/tenants" className={NAV_LINK_CLASS}>
              <span>🏢</span>
              <span className="small">Tenants</span>
            </NavLink>
          </Nav.Item>
        )}
        {menuOptions.map((opt) => (
          <Nav.Item key={opt.code}>
            <NavLink to={opt.route} className={NAV_LINK_CLASS}>
              <span>{MENU_ICONS[opt.code] ?? '•'}</span>
              <span className="small">{opt.label}</span>
            </NavLink>
          </Nav.Item>
        ))}
      </Nav>

      <div className="px-3 mt-auto border-top border-secondary pt-3">
        <button
          className="btn btn-outline-danger btn-sm w-100"
          onClick={logout}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
