import { Navigate } from 'react-router-dom';
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
  const { isAuthenticated, currentUser, hasPermission } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
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
