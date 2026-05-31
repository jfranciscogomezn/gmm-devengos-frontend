import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';
import { AppLayout } from './components/Layout/AppLayout';
import { LoginPage } from './pages/Login/LoginPage';
import { RoleListPage } from './pages/roles/RoleListPage';
import { RoleFormPage } from './pages/roles/RoleFormPage';
import { MenuOptionAssignPage } from './pages/roles/MenuOptionAssignPage';
import { UserListPage } from './pages/users/UserListPage';
import { UserFormPage } from './pages/users/UserFormPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { TenantListPage } from './pages/platform/TenantListPage';
import { TenantFormPage } from './pages/platform/TenantFormPage';
import { EmployeeListPage } from './pages/employees/EmployeeListPage';
import { EmployeeFormPage } from './pages/employees/EmployeeFormPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function DashboardPlaceholder() {
  return (
    <div>
      <h4>Dashboard</h4>
      <p className="text-muted">Welcome to StepCore.</p>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPlaceholder />} />
              <Route
                path="admin/roles"
                element={
                  <ProtectedRoute requireAdmin>
                    <RoleListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/roles/new"
                element={
                  <ProtectedRoute requireAdmin>
                    <RoleFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/roles/:id"
                element={
                  <ProtectedRoute requireAdmin>
                    <RoleFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/roles/:id/menu"
                element={
                  <ProtectedRoute requireAdmin>
                    <MenuOptionAssignPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/users"
                element={
                  <ProtectedRoute requireAdmin>
                    <UserListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/users/new"
                element={
                  <ProtectedRoute requireAdmin>
                    <UserFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/users/:id"
                element={
                  <ProtectedRoute requireAdmin>
                    <UserFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/employees"
                element={
                  <ProtectedRoute requireAdmin>
                    <EmployeeListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/employees/new"
                element={
                  <ProtectedRoute requireAdmin>
                    <EmployeeFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/employees/:id"
                element={
                  <ProtectedRoute requireAdmin>
                    <EmployeeFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="platform/tenants"
                element={
                  <ProtectedRoute requirePlatformAdmin>
                    <TenantListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="platform/tenants/new"
                element={
                  <ProtectedRoute requirePlatformAdmin>
                    <TenantFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="platform/tenants/:id"
                element={
                  <ProtectedRoute requirePlatformAdmin>
                    <TenantFormPage />
                  </ProtectedRoute>
                }
              />
              <Route path="my/profile" element={<ProfilePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
