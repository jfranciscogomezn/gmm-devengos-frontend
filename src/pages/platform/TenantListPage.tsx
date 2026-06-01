import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Badge, Button, Card, Spinner, Table } from 'react-bootstrap';
import { platformService } from '../../api/platform.service';
import { ApiErrorAlert } from '../../components/ApiErrorAlert/ApiErrorAlert';
import type { Tenant, TenantStatus } from '../../types';

const STATUS_VARIANT: Record<TenantStatus, string> = {
  ACTIVE: 'success',
  SUSPENDED: 'danger',
  PROVISIONING: 'warning',
};

export function TenantListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: tenants = [], isLoading, isError, error } = useQuery({
    queryKey: ['platform-tenants'],
    queryFn: platformService.findAll,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: TenantStatus }) =>
      platformService.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['platform-tenants'] }),
  });

  if (isLoading) return <div className="text-center py-5"><Spinner /></div>;
  if (isError) return <ApiErrorAlert error={error} resourceLabel="tenants" />;

  const toggleStatus = (tenant: Tenant) => {
    const next: TenantStatus = tenant.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    statusMutation.mutate({ id: tenant.id, status: next });
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-0">Tenants</h4>
          <span className="text-muted small">Provider administration · {tenants.length} tenant(s)</span>
        </div>
        <Button variant="primary" onClick={() => navigate('/platform/tenants/new')}>
          + New tenant
        </Button>
      </div>

      {statusMutation.isError && (
        <Alert variant="danger" className="py-2">Could not update the tenant status.</Alert>
      )}

      <Card>
        <Table responsive hover className="mb-0 align-middle">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Plan</th>
              <th>Users</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((t) => {
              const atCap = t.currentUsers >= t.maxUsers;
              return (
                <tr key={t.id}>
                  <td>
                    {t.name}
                    {t.platform && <Badge bg="info" className="ms-2">platform</Badge>}
                  </td>
                  <td><code>{t.slug}</code></td>
                  <td>{t.plan}</td>
                  <td className={atCap ? 'text-danger fw-semibold' : undefined}>
                    {t.currentUsers}/{t.maxUsers}
                  </td>
                  <td><Badge bg={STATUS_VARIANT[t.status]}>{t.status}</Badge></td>
                  <td className="text-end">
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      className="me-2"
                      onClick={() => navigate(`/platform/tenants/${t.id}`)}
                    >
                      Edit
                    </Button>
                    {!t.platform && (
                      <Button
                        size="sm"
                        variant={t.status === 'SUSPENDED' ? 'outline-success' : 'outline-danger'}
                        disabled={t.status === 'PROVISIONING' || statusMutation.isPending}
                        onClick={() => toggleStatus(t)}
                      >
                        {t.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
