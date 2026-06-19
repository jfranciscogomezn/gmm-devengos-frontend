import { useState } from 'react';
import { Alert, Button, Form, InputGroup, Modal, Spinner } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { osiTrackingTokenService } from '../../api/osiTrackingToken.service';

interface Props {
  osiId: number;
}

export function TrackingTokenPanel({ osiId }: Props) {
  const { t } = useTranslation('operations');
  const qc = useQueryClient();
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: token, isLoading } = useQuery({
    queryKey: ['osi-token', osiId],
    queryFn: () => osiTrackingTokenService.getActive(osiId),
  });

  const generateMutation = useMutation({
    mutationFn: () => osiTrackingTokenService.generate(osiId),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['osi-token', osiId] }),
  });

  const revokeMutation = useMutation({
    mutationFn: () => osiTrackingTokenService.revoke(osiId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['osi-token', osiId] });
      setShowRevokeConfirm(false);
    },
  });

  const portalUrl = token
    ? `${window.location.origin}/portal/${token.token}`
    : null;

  const handleCopy = async () => {
    if (!portalUrl) return;
    await navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) return <Spinner size="sm" />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 className="mb-0">{t('portal.title')}</h6>
        {!token && (
          <Button
            size="sm"
            variant="outline-primary"
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? <Spinner size="sm" /> : t('portal.generate')}
          </Button>
        )}
        {token && (
          <div className="d-flex gap-2">
            <Button
              size="sm"
              variant="outline-warning"
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
            >
              {t('portal.regenerate')}
            </Button>
            <Button
              size="sm"
              variant="outline-danger"
              onClick={() => setShowRevokeConfirm(true)}
            >
              {t('portal.revoke')}
            </Button>
          </div>
        )}
      </div>

      {token && portalUrl && (
        <div>
          <InputGroup size="sm" className="mb-2">
            <Form.Control value={portalUrl} readOnly />
            <Button variant="outline-secondary" onClick={handleCopy}>
              {copied ? t('portal.copied') : t('portal.copy')}
            </Button>
            <Button
              variant="outline-primary"
              href={portalUrl}
              target="_blank"
              rel="noreferrer"
              as="a"
            >
              {t('portal.preview')}
            </Button>
          </InputGroup>
          <small className="text-muted">
            {t('portal.createdAt')}: {new Date(token.createdAt).toLocaleString()}
          </small>
        </div>
      )}

      {!token && !generateMutation.isPending && (
        <p className="text-muted small">{t('portal.noToken')}</p>
      )}

      {generateMutation.isError && (
        <Alert variant="danger" className="mt-2 small py-2">
          {(generateMutation.error as Error)?.message}
        </Alert>
      )}

      <Modal show={showRevokeConfirm} onHide={() => setShowRevokeConfirm(false)} size="sm">
        <Modal.Header closeButton>
          <Modal.Title>{t('portal.revokeTitle')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{t('portal.revokeConfirm')}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRevokeConfirm(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="danger"
            onClick={() => revokeMutation.mutate()}
            disabled={revokeMutation.isPending}
          >
            {revokeMutation.isPending ? <Spinner size="sm" /> : t('portal.revoke')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
