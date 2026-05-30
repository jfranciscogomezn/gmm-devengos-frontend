import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requirePlatformAdmin?: boolean;
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
  requirePlatformAdmin = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, currentUser } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requirePlatformAdmin && currentUser?.roleName !== 'PLATFORM_ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireAdmin && currentUser?.roleName !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
