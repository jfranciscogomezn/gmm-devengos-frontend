import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Card, Col, Form, Modal, Row, Spinner } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';
import { platformService } from '../../api/platform.service';
import type {
  CreateTenantRequest,
  ProvisionTenantResponse,
  TenantPlan,
  TenantStatus,
  UpdateTenantRequest,
} from '../../types';

const PLANS: TenantPlan[] = ['STANDARD', 'PREMIUM'];

export function TenantFormPage() {
  const { t } = useTranslation(['platform', 'common']);
  const { id } = useParams<{ id: string }>();
  const isEdit = id !== undefined;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [plan, setPlan] = useState<TenantPlan>('STANDARD');
  const [maxUsers, setMaxUsers] = useState<number | ''>('');
  const [status, setStatus] = useState<TenantStatus>('ACTIVE');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminFirstName, setAdminFirstName] = useState('');
  const [adminLastName, setAdminLastName] = useState('');
  const [serverError, setServerError] = useState('');
  const [provisioned, setProvisioned] = useState<ProvisionTenantResponse | null>(null);

  const { data: tenant, isLoading: tenantLoading } = useQuery({
    queryKey: ['platform-tenants', id],
    queryFn: () => platformService.findById(Number(id)),
    enabled: isEdit,
  });

  useEffect(() => {
    if (tenant) {
      setName(tenant.name);
      setSlug(tenant.slug);
      setPlan(tenant.plan);
      setMaxUsers(tenant.maxUsers);
      setStatus(tenant.status);
    }
  }, [tenant]);

  const createMutation = useMutation({
    mutationFn: () => {
      const req: CreateTenantRequest = {
        name,
        slug: slug.trim().toLowerCase(),
        plan,
        maxUsers: maxUsers === '' ? undefined : Number(maxUsers),
        adminEmail,
        adminFirstName,
        adminLastName,
      };
      return platformService.create(req);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['platform-tenants'] });
      setProvisioned(response);
    },
    onError: (err) => setServerError(errorMessage(err, t('platform:form.saveFailed'))),
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      const req: UpdateTenantRequest = {
        plan,
        maxUsers: maxUsers === '' ? undefined : Number(maxUsers),
        status,
      };
      return platformService.update(Number(id), req);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-tenants'] });
      navigate('/platform/tenants');
    },
    onError: (err) => setServerError(errorMessage(err, t('platform:form.saveFailed'))),
  });

  if (isEdit && tenantLoading) return <div className="text-center py-5"><Spinner /></div>;

  const pending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (isEdit) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  return (
    <div style={{ maxWidth: 680 }}>
      <h4 className="mb-4">
        {isEdit ? t('platform:form.editTitle', { name }) : t('platform:form.newTitle')}
      </h4>
      <Card>
        <Card.Body>
          {serverError && <Alert variant="danger" className="py-2">{serverError}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col sm={8}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('platform:form.companyName')}</Form.Label>
                  <Form.Control
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={150}
                    disabled={isEdit}
                  />
                </Form.Group>
              </Col>
              <Col sm={4}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('common:labels.slug')} <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                    maxLength={100}
                    placeholder={t('platform:form.slugPlaceholder')}
                    disabled={isEdit}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col sm={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('common:labels.plan')} <span className="text-danger">*</span></Form.Label>
                  <Form.Select value={plan} onChange={(e) => setPlan(e.target.value as TenantPlan)}>
                    {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col sm={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('platform:form.maxUsers')}</Form.Label>
                  <Form.Control
                    type="number"
                    min={1}
                    value={maxUsers}
                    onChange={(e) => setMaxUsers(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder={t('platform:form.maxUsersPlaceholder')}
                  />
                </Form.Group>
              </Col>
            </Row>

            {isEdit ? (
              <Form.Group className="mb-4">
                <Form.Label>{t('common:labels.status')}</Form.Label>
                <Form.Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TenantStatus)}
                  disabled={status === 'PROVISIONING'}
                >
                  <option value="ACTIVE">{t('platform:form.status.ACTIVE')}</option>
                  <option value="SUSPENDED">{t('platform:form.status.SUSPENDED')}</option>
                  {status === 'PROVISIONING' && (
                    <option value="PROVISIONING">{t('platform:form.status.PROVISIONING')}</option>
                  )}
                </Form.Select>
              </Form.Group>
            ) : (
              <>
                <hr />
                <p className="fw-semibold mb-3">{t('platform:form.initialAdmin')}</p>
                <Form.Group className="mb-3">
                  <Form.Label>{t('platform:form.adminEmail')}</Form.Label>
                  <Form.Control
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                    maxLength={255}
                  />
                </Form.Group>
                <Row>
                  <Col sm={6}>
                    <Form.Group className="mb-4">
                      <Form.Label>{t('platform:form.adminFirstName')}</Form.Label>
                      <Form.Control
                        value={adminFirstName}
                        onChange={(e) => setAdminFirstName(e.target.value)}
                        required
                        maxLength={100}
                      />
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    <Form.Group className="mb-4">
                      <Form.Label>{t('platform:form.adminLastName')}</Form.Label>
                      <Form.Control
                        value={adminLastName}
                        onChange={(e) => setAdminLastName(e.target.value)}
                        required
                        maxLength={100}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </>
            )}

            <div className="d-flex gap-2">
              <Button type="submit" variant="primary" disabled={pending}>
                {pending ? <Spinner as="span" size="sm" className="me-2" /> : null}
                {isEdit ? t('platform:form.saveChanges') : t('platform:form.provision')}
              </Button>
              <Button variant="secondary" onClick={() => navigate('/platform/tenants')}>
                {t('common:actions.cancel')}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      <Modal show={provisioned !== null} backdrop="static" centered>
        <Modal.Header>
          <Modal.Title>{t('platform:form.provisionedTitle')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-2">
            <Trans i18nKey="platform:form.provisionedBody" components={{ strong: <strong /> }} />
          </p>
          <div className="bg-light border rounded p-3">
            <div>
              <span className="text-muted small">{t('platform:form.adminEmail')}</span><br />
              {provisioned?.adminEmail}
            </div>
            <div className="mt-2">
              <span className="text-muted small">{t('platform:form.tempPassword')}</span><br />
              <code className="fs-6">{provisioned?.temporaryPassword}</code>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => navigate('/platform/tenants')}>
            {t('common:actions.done')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

function errorMessage(err: unknown, fallback: string): string {
  const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
  return message ?? fallback;
}
