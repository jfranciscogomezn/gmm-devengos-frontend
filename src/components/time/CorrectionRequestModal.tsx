import { useState } from 'react';
import { Button, Form, Modal, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { correctionRequestsService } from '../../api/correctionRequests.service';
import { getApiErrorMessage } from '../../utils/apiError';

interface CorrectionRequestModalProps {
  timeRecordId: number;
  workDate: string;
  show: boolean;
  onHide: () => void;
}

export function CorrectionRequestModal({
  timeRecordId,
  workDate,
  show,
  onHide,
}: CorrectionRequestModalProps) {
  const { t } = useTranslation('time');
  const queryClient = useQueryClient();
  const [note, setNote] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => correctionRequestsService.create(timeRecordId, note),
    onMutate: () => setSubmitError(null),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['correction-requests', 'mine'] });
      setNote('');
      onHide();
    },
    onError: (err) => setSubmitError(getApiErrorMessage(err, 'correction request')),
  });

  const handleClose = () => {
    if (!mutation.isPending) {
      setNote('');
      setSubmitError(null);
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton={!mutation.isPending}>
        <Modal.Title className="h6">
          {t('myTime.correctionRequestModal.title', { date: workDate })}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-muted small mb-3">
          {t('myTime.correctionRequestModal.description')}
        </p>
        <Form.Group controlId="correction-request-note">
          <Form.Label>{t('myTime.correctionRequestModal.noteLabel')}</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={mutation.isPending}
            placeholder={t('myTime.correctionRequestModal.notePlaceholder')}
            maxLength={1000}
          />
          <Form.Text className="text-muted">
            {note.length}/1000
          </Form.Text>
        </Form.Group>
        {submitError && (
          <div className="alert alert-danger mt-2 mb-0 py-2 small">{submitError}</div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={mutation.isPending}>
          {t('myTime.correctionRequestModal.cancel')}
        </Button>
        <Button
          variant="primary"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || note.trim().length === 0}
        >
          {mutation.isPending ? (
            <>
              <Spinner size="sm" className="me-1" />
              {t('myTime.correctionRequestModal.submitting')}
            </>
          ) : (
            t('myTime.correctionRequestModal.submit')
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
