import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/theme.css';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';
import { AppLayout } from './components/Layout/AppLayout';
import { LoginPage } from './pages/Login/LoginPage';
import { RoleListPage } from './pages/roles/RoleListPage';
import { UserListPage } from './pages/users/UserListPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { TenantListPage } from './pages/platform/TenantListPage';
import { TenantFormPage } from './pages/platform/TenantFormPage';
import { EmployeeListPage } from './pages/employees/EmployeeListPage';
import { EmployeeFormPage } from './pages/employees/EmployeeFormPage';
import { AccessControlHubPage } from './pages/access/AccessControlHubPage';
import { MenuCataloguePage } from './pages/access/MenuCataloguePage';
import { RoleDetailPage } from './pages/access/RoleDetailPage';
import { UserDetailPage } from './pages/access/UserDetailPage';
import { MyTimePage } from './pages/time/MyTimePage';
import { AdminTimeRecordsPage } from './pages/time/AdminTimeRecordsPage';
import { TimeRecordAuditPage } from './pages/time/TimeRecordAuditPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { PayrollConfigPage } from './pages/payroll/PayrollConfigPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ClientsPage } from './pages/operations/clients/ClientsPage';
import { VehiclesPage } from './pages/operations/vehicles/VehiclesPage';
import { OsiListPage } from './pages/operations/osi/OsiListPage';
import { OsiDetailPage } from './pages/operations/osi/OsiDetailPage';
import { EventTypesPage } from './pages/operations/event-types/EventTypesPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});


function LegacyRoleRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/admin/access/roles/${id}`} replace />;
}

function LegacyRoleMenuRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/admin/access/roles/${id}?tab=permissions`} replace />;
}

function LegacyUserRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/admin/access/users/${id}`} replace />;
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
              <Route path="dashboard" element={<DashboardPage />} />

              <Route
                path="admin/access"
                element={
                  <ProtectedRoute requireAdmin>
                    <AccessControlHubPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/access/menu"
                element={
                  <ProtectedRoute requireAdmin>
                    <MenuCataloguePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/access/roles"
                element={
                  <ProtectedRoute requireAdmin>
                    <RoleListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/access/roles/new"
                element={
                  <ProtectedRoute requireAdmin>
                    <RoleDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/access/roles/:id"
                element={
                  <ProtectedRoute requireAdmin>
                    <RoleDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/access/users"
                element={
                  <ProtectedRoute requireAdmin>
                    <UserListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/access/users/new"
                element={
                  <ProtectedRoute requireAdmin>
                    <UserDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/access/users/:id"
                element={
                  <ProtectedRoute requireAdmin>
                    <UserDetailPage />
                  </ProtectedRoute>
                }
              />

              <Route path="admin/roles" element={<Navigate to="/admin/access/roles" replace />} />
              <Route path="admin/roles/new" element={<Navigate to="/admin/access/roles/new" replace />} />
              <Route path="admin/roles/:id/menu" element={<LegacyRoleMenuRedirect />} />
              <Route path="admin/roles/:id" element={<LegacyRoleRedirect />} />
              <Route path="admin/users" element={<Navigate to="/admin/access/users" replace />} />
              <Route path="admin/users/new" element={<Navigate to="/admin/access/users/new" replace />} />
              <Route path="admin/users/:id" element={<LegacyUserRedirect />} />

              <Route
                path="admin/employees"
                element={
                  <ProtectedRoute requirePermission="EMPLOYEE_CONFIG">
                    <EmployeeListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/employees/new"
                element={
                  <ProtectedRoute requirePermission="EMPLOYEE_CONFIG">
                    <EmployeeFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/employees/:id"
                element={
                  <ProtectedRoute requirePermission="EMPLOYEE_CONFIG">
                    <EmployeeFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/config"
                element={
                  <ProtectedRoute requirePermission="PAYROLL_CONFIG">
                    <PayrollConfigPage />
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
              <Route
                path="my/time"
                element={
                  <ProtectedRoute requirePermission="MY_TIME">
                    <MyTimePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/time/audit"
                element={
                  <ProtectedRoute requirePermission="TIME_RECORDS_ADMIN">
                    <TimeRecordAuditPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/time"
                element={
                  <ProtectedRoute requirePermission="TIME_RECORDS_ADMIN">
                    <AdminTimeRecordsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="reports"
                element={
                  <ProtectedRoute requirePermission="REPORTS">
                    <ReportsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="my/reports"
                element={
                  <ProtectedRoute requirePermission="MY_TIME">
                    <ReportsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="operations/clients"
                element={
                  <ProtectedRoute requirePermission="OPS_CLIENTS">
                    <ClientsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="operations/vehicles"
                element={
                  <ProtectedRoute requirePermission="OPS_VEHICLES">
                    <VehiclesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="operations/osi"
                element={
                  <ProtectedRoute requirePermission="OPS_OSI">
                    <OsiListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="operations/osi/:id"
                element={
                  <ProtectedRoute requirePermission="OPS_OSI">
                    <OsiDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="operations/event-types"
                element={
                  <ProtectedRoute requirePermission="OPS_EVENT_TYPES">
                    <EventTypesPage />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
