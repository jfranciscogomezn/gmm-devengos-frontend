import { useState } from 'react';
import { Alert, Button, Form, Spinner } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { digestService } from '../../api/digest.service';

interface Props {
  osiId: number;
}

export function DigestPanel({ osiId }: Props) {
  const { t } = useTranslation('operations');
  const [editedText, setEditedText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: proposedText, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['osi-digest', osiId],
    queryFn: () => digestService.getDigest(osiId),
  });

  const displayText = editedText ?? proposedText ?? '';

  const handleRegenerate = () => {
    const hasEdits = editedText !== null && editedText !== proposedText;
    if (hasEdits && !window.confirm(t('digest.confirmRegenerate'))) {
      return;
    }
    setEditedText(null);
    void refetch();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback: select the textarea content
    }
  };

  if (isLoading) {
    return <div className="text-center py-4"><Spinner size="sm" /> {t('common.loading')}</div>;
  }

  if (isError) {
    return <Alert variant="warning">{t('digest.noEvents')}</Alert>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <small className="text-muted">{t('digest.hint')}</small>
        <div className="d-flex gap-2">
          <Button
            size="sm"
            variant="outline-secondary"
            onClick={handleRegenerate}
            disabled={isFetching}
          >
            {isFetching ? <Spinner size="sm" /> : t('digest.regenerate')}
          </Button>
          <Button
            size="sm"
            variant={copied ? 'success' : 'primary'}
            onClick={() => void handleCopy()}
          >
            {copied ? t('digest.copied') : t('digest.copy')}
          </Button>
        </div>
      </div>

      <Form.Control
        as="textarea"
        rows={14}
        value={displayText}
        onChange={e => setEditedText(e.target.value)}
        className="font-monospace"
        style={{ fontSize: '0.82rem', lineHeight: '1.5' }}
      />
    </div>
  );
}
