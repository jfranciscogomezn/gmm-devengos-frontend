import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requirePlatformAdmin?: boolean;
  requirePermission?: string;
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
  requirePlatformAdmin = false,
  requirePermission,
}: ProtectedRouteProps) {
  const { isAuthenticated, currentUser, hasPermission, mustChangePassword } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Force the user to change their password before accessing any other route.
  if (mustChangePassword && location.pathname !== '/my/profile') {
    return <Navigate to="/my/profile" replace />;
  }

  if (requirePlatformAdmin && currentUser?.roleName !== 'PLATFORM_ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireAdmin && currentUser?.roleName !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  if (requirePermission && !hasPermission(requirePermission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
