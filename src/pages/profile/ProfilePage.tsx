import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Alert, Badge, Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { authService } from '../../api/auth.service';
import { useAuth } from '../../context/AuthContext';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,}$/;

export function ProfilePage() {
  const { t } = useTranslation(['profile', 'common']);
  const { currentUser, mustChangePassword } = useAuth();
  const location = useLocation();
  const forceChange = (location.state as { forceChangePassword?: boolean })?.forceChangePassword ?? mustChangePassword;

  const [showForm, setShowForm] = useState(forceChange);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [clientError, setClientError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (forceChange) setShowForm(true);
  }, [forceChange]);

  const mutation = useMutation({
    mutationFn: () => authService.changePassword({ currentPassword, newPassword }),
    onSuccess: () => {
      setSuccessMsg(t('profile:passwordChanged'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      if (!forceChange) setShowForm(false);
    },
  });

  const getStrengthLabel = (pwd: string): { label: string; variant: string } => {
    if (!pwd) return { label: '', variant: 'secondary' };
    if (!PASSWORD_REGEX.test(pwd)) return { label: t('common:passwordStrength.weak'), variant: 'danger' };
    if (pwd.length < 12) return { label: t('common:passwordStrength.fair'), variant: 'warning' };
    return { label: t('common:passwordStrength.strong'), variant: 'success' };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClientError('');
    setSuccessMsg('');
    if (!PASSWORD_REGEX.test(newPassword)) {
      setClientError(t('profile:passwordMin'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setClientError(t('profile:passwordMismatch'));
      return;
    }
    mutation.mutate();
  };

  const strength = getStrengthLabel(newPassword);

  return (
    <div>
      <h4 className="mb-4">{t('profile:title')}</h4>

      {forceChange && (
        <Alert variant="warning" className="mb-3">
          {t('profile:mustChangePassword')}
        </Alert>
      )}

      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>{t('profile:accountInfo')}</Card.Header>
            <Card.Body>
              <dl className="row mb-0">
                <dt className="col-sm-4">{t('common:labels.name')}</dt>
                <dd className="col-sm-8">{currentUser?.firstName} {currentUser?.lastName}</dd>
                <dt className="col-sm-4">{t('common:labels.email')}</dt>
                <dd className="col-sm-8">{currentUser?.email}</dd>
                <dt className="col-sm-4">{t('common:labels.role')}</dt>
                <dd className="col-sm-8">
                  <Badge bg="primary">{currentUser?.roleName}</Badge>
                </dd>
              </dl>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              {t('profile:changePassword')}
              {!forceChange && (
                <Button size="sm" variant="outline-primary" onClick={() => setShowForm((s) => !s)}>
                  {showForm ? t('common:actions.cancel') : t('profile:toggleChange')}
                </Button>
              )}
            </Card.Header>
            {showForm && (
              <Card.Body>
                {successMsg && <Alert variant="success" className="py-2">{successMsg}</Alert>}
                {(clientError || mutation.isError) && (
                  <Alert variant="danger" className="py-2">
                    {clientError || t('profile:passwordChangeFailed')}
                  </Alert>
                )}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('profile:currentPassword')}</Form.Label>
                    <Form.Control type="password" value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)} required />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>{t('profile:newPassword')}</Form.Label>
                    <Form.Control type="password" value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)} required />
                    {newPassword && (
                      <div className="mt-1">
                        <Badge bg={strength.variant}>{strength.label}</Badge>
                      </div>
                    )}
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('profile:confirmPassword')}</Form.Label>
                    <Form.Control type="password" value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)} required />
                  </Form.Group>
                  <Button type="submit" variant="primary" disabled={mutation.isPending}>
                    {mutation.isPending ? <Spinner as="span" size="sm" className="me-2" /> : null}
                    {t('profile:savePassword')}
                  </Button>
                </Form>
              </Card.Body>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
