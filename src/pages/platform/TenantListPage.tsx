import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Badge, Button, Card, Spinner, Table } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { platformService } from '../../api/platform.service';
import { ApiErrorAlert } from '../../components/ApiErrorAlert/ApiErrorAlert';
import type { Tenant, TenantStatus } from '../../types';

const STATUS_VARIANT: Record<TenantStatus, string> = {
  ACTIVE: 'success',
  SUSPENDED: 'danger',
  PROVISIONING: 'warning',
};

export function TenantListPage() {
  const { t } = useTranslation(['platform', 'common']);
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
          <h4 className="mb-0">{t('platform:list.title')}</h4>
          <span className="text-muted small">
            {t('platform:list.subtitle', { count: tenants.length })}
          </span>
        </div>
        <Button variant="primary" onClick={() => navigate('/platform/tenants/new')}>
          + {t('platform:list.new')}
        </Button>
      </div>

      {statusMutation.isError && (
        <Alert variant="danger" className="py-2">{t('platform:list.statusUpdateFailed')}</Alert>
      )}

      <Card>
        <Table responsive hover className="mb-0 align-middle">
          <thead>
            <tr>
              <th>{t('common:labels.name')}</th>
              <th>{t('common:labels.slug')}</th>
              <th>{t('common:labels.plan')}</th>
              <th>{t('platform:list.users')}</th>
              <th>{t('common:labels.status')}</th>
              <th className="text-end">{t('common:labels.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant) => {
              const atCap = tenant.currentUsers >= tenant.maxUsers;
              return (
                <tr key={tenant.id}>
                  <td>
                    {tenant.name}
                    {tenant.platform && (
                      <Badge bg="info" className="ms-2">{t('common:status.platform')}</Badge>
                    )}
                  </td>
                  <td><code>{tenant.slug}</code></td>
                  <td>{tenant.plan}</td>
                  <td className={atCap ? 'text-danger fw-semibold' : undefined}>
                    {tenant.currentUsers}/{tenant.maxUsers}
                  </td>
                  <td>
                    <Badge bg={STATUS_VARIANT[tenant.status]}>
                      {t(`platform:form.status.${tenant.status}`)}
                    </Badge>
                  </td>
                  <td className="text-end">
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      className="me-2"
                      onClick={() => navigate(`/platform/tenants/${tenant.id}`)}
                    >
                      {t('common:actions.edit')}
                    </Button>
                    {!tenant.platform && (
                      <Button
                        size="sm"
                        variant={tenant.status === 'SUSPENDED' ? 'outline-success' : 'outline-danger'}
                        disabled={tenant.status === 'PROVISIONING' || statusMutation.isPending}
                        onClick={() => toggleStatus(tenant)}
                      >
                        {tenant.status === 'SUSPENDED'
                          ? t('platform:list.activate')
                          : t('platform:list.suspend')}
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
