import { Nav } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { MenuTreeNav } from './MenuTreeNav';

export function Sidebar() {
  const { menu, currentUser, tenant, isPlatformAdmin, logout } = useAuth();

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
        <MenuTreeNav nodes={menu} />
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
