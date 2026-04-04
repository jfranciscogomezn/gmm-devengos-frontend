import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Alert, Badge, Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap';
import { authService } from '../../api/auth.service';
import { useAuth } from '../../context/AuthContext';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,}$/;

function getStrengthLabel(pwd: string): { label: string; variant: string } {
  if (!pwd) return { label: '', variant: 'secondary' };
  if (!PASSWORD_REGEX.test(pwd)) return { label: 'Weak', variant: 'danger' };
  if (pwd.length < 12) return { label: 'Fair', variant: 'warning' };
  return { label: 'Strong', variant: 'success' };
}

export function ProfilePage() {
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
      setSuccessMsg('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      if (!forceChange) setShowForm(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClientError('');
    setSuccessMsg('');
    if (!PASSWORD_REGEX.test(newPassword)) {
      setClientError('Password must have at least 8 characters, one uppercase, one lowercase, one digit, and one special character.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setClientError('Passwords do not match.');
      return;
    }
    mutation.mutate();
  };

  const strength = getStrengthLabel(newPassword);

  return (
    <div>
      <h4 className="mb-4">My Profile</h4>

      {forceChange && (
        <Alert variant="warning" className="mb-3">
          You must change your password before continuing.
        </Alert>
      )}

      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>Account Information</Card.Header>
            <Card.Body>
              <dl className="row mb-0">
                <dt className="col-sm-4">Name</dt>
                <dd className="col-sm-8">{currentUser?.firstName} {currentUser?.lastName}</dd>
                <dt className="col-sm-4">Email</dt>
                <dd className="col-sm-8">{currentUser?.email}</dd>
                <dt className="col-sm-4">Role</dt>
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
              Change Password
              {!forceChange && (
                <Button size="sm" variant="outline-primary" onClick={() => setShowForm((s) => !s)}>
                  {showForm ? 'Cancel' : 'Change'}
                </Button>
              )}
            </Card.Header>
            {showForm && (
              <Card.Body>
                {successMsg && <Alert variant="success" className="py-2">{successMsg}</Alert>}
                {(clientError || mutation.isError) && (
                  <Alert variant="danger" className="py-2">
                    {clientError || 'Failed to change password. Check your current password.'}
                  </Alert>
                )}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Current Password</Form.Label>
                    <Form.Control type="password" value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)} required />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>New Password</Form.Label>
                    <Form.Control type="password" value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)} required />
                    {newPassword && (
                      <div className="mt-1">
                        <Badge bg={strength.variant}>{strength.label}</Badge>
                      </div>
                    )}
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Confirm New Password</Form.Label>
                    <Form.Control type="password" value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)} required />
                  </Form.Group>
                  <Button type="submit" variant="primary" disabled={mutation.isPending}>
                    {mutation.isPending ? <Spinner as="span" size="sm" className="me-2" /> : null}
                    Save Password
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
