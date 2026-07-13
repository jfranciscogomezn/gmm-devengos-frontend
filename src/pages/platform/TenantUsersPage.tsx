import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Badge, Button, Card, Spinner, Table } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { platformUsersService } from '../../api/platformUsers.service';
import { ApiErrorAlert } from '../../components/ApiErrorAlert/ApiErrorAlert';

export function TenantUsersPage() {
  const { id } = useParams<{ id: string }>();
  const tenantId = Number(id);
  const { t } = useTranslation(['platform', 'common']);
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState('');

  const { data: users = [], isLoading, isError, error } = useQuery({
    queryKey: ['platform-tenant-users', tenantId],
    queryFn: () => platformUsersService.listByTenant(tenantId),
  });

  const statusMutation = useMutation({
    mutationFn: ({ userId, enabled }: { userId: number; enabled: boolean }) =>
      platformUsersService.setUserStatus(tenantId, userId, enabled),
    onSuccess: () => {
      setActionError('');
      queryClient.invalidateQueries({ queryKey: ['platform-tenant-users', tenantId] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setActionError(err.response?.data?.message ?? t('platform:users.setStatusFailed'));
    },
  });

  if (isLoading) return <div className="text-center py-5"><Spinner /></div>;
  if (isError) return <ApiErrorAlert error={error} resourceLabel="users" />;

  return (
    <div>
      <Link to="/platform/tenants" className="text-decoration-none small">
        {t('platform:users.backToTenants')}
      </Link>
      <h4 className="mb-4 mt-2">{t('platform:users.title')}</h4>

      {actionError && (
        <Alert variant="danger" dismissible onClose={() => setActionError('')}>
          {actionError}
        </Alert>
      )}

      <Card>
        <Table responsive hover className="mb-0 align-middle">
          <thead>
            <tr>
              <th>{t('common:labels.name')}</th>
              <th>{t('common:labels.email')}</th>
              <th>{t('common:labels.role')}</th>
              <th>{t('common:labels.status')}</th>
              <th className="text-end">{t('common:labels.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-muted py-4">
                  {t('platform:users.empty')}
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.email}</td>
                  <td><code>{user.roleName}</code></td>
                  <td>
                    <Badge bg={user.enabled ? 'success' : 'danger'}>
                      {user.enabled ? t('common:status.active') : t('common:status.disabled')}
                    </Badge>
                  </td>
                  <td className="text-end">
                    <Button
                      size="sm"
                      variant={user.enabled ? 'outline-warning' : 'outline-success'}
                      disabled={statusMutation.isPending}
                      onClick={() => statusMutation.mutate({ userId: user.id, enabled: !user.enabled })}
                    >
                      {user.enabled ? t('common:actions.disable') : t('common:actions.enable')}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
