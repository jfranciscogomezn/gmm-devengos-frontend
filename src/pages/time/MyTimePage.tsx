import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Col, Form, Row, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { reportsService, type TimeReportRecord } from '../../api/reports.service';
import { timeService } from '../../api/time.service';
import {
  MyTimeHistoryTable,
  parseIncompleteReportError,
} from '../../components/reports/MyTimeHistoryTable';
import { ApiErrorAlert } from '../../components/ApiErrorAlert/ApiErrorAlert';
import { TimeRecordStatusBadge } from '../../components/time/TimeRecordStatusBadge';
import { useAuth } from '../../context/AuthContext';
import type { TimeRecord } from '../../types';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatMoney } from '../../utils/reportDisplay';
import {
  addDays,
  formatInstant,
  formatWorkDate,
  startOfMonth,
  startOfWeek,
  toIsoDateString,
} from '../../utils/timeFormat';

function findTodayRecord(records: TimeRecord[], today: string): TimeRecord | undefined {
  return records.find((record) => record.workDate === today);
}

export function MyTimePage() {
  const { t } = useTranslation(['time', 'common']);
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const today = toIsoDateString(new Date());
  const [fromDate, setFromDate] = useState(toIsoDateString(startOfMonth(new Date())));
  const [toDate, setToDate] = useState(today);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: records = [], isLoading, isError, error } = useQuery({
    queryKey: ['time-records', 'mine', fromDate, toDate],
    queryFn: () => timeService.getMine({ from: fromDate, to: toDate }),
  });

  const earningsQuery = useQuery({
    queryKey: ['reports', 'time', 'mine', fromDate, toDate],
    queryFn: () => reportsService.getCappedReport({ startDate: fromDate, endDate: toDate }),
    retry: (_, queryError) => parseIncompleteReportError(queryError) === null,
  });

  const todayRecord = useMemo(() => findTodayRecord(records, today), [records, today]);

  const reportByRecordId = useMemo(() => {
    const map = new Map<number, TimeReportRecord>();
    earningsQuery.data?.records.forEach((row) => map.set(row.timeRecordId, row));
    return map;
  }, [earningsQuery.data]);

  const incompleteDates = parseIncompleteReportError(earningsQuery.error);
  const reportBlocked = incompleteDates !== null;

  const invalidateRecords = async () => {
    await queryClient.invalidateQueries({ queryKey: ['time-records', 'mine'] });
    await queryClient.invalidateQueries({ queryKey: ['reports', 'time', 'mine'] });
  };

  const clockInMutation = useMutation({
    mutationFn: timeService.clockIn,
    onMutate: () => setActionError(null),
    onSuccess: invalidateRecords,
    onError: (mutationError) => setActionError(getApiErrorMessage(mutationError, 'clock-in')),
  });

  const clockOutMutation = useMutation({
    mutationFn: timeService.clockOut,
    onMutate: () => setActionError(null),
    onSuccess: invalidateRecords,
    onError: (mutationError) => setActionError(getApiErrorMessage(mutationError, 'clock-out')),
  });

  const canClockIn = !todayRecord;
  const canClockOut = todayRecord?.status === 'OPEN';
  const isMutating = clockInMutation.isPending || clockOutMutation.isPending;
  const historyLoading = isLoading || earningsQuery.isLoading;

  if (historyLoading) {
    return (
      <div className="text-center py-5">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <ApiErrorAlert
        error={error}
        resourceLabel="time records"
        roleName={currentUser?.roleName}
      />
    );
  }

  if (earningsQuery.isError && !reportBlocked) {
    return (
      <ApiErrorAlert
        error={earningsQuery.error}
        resourceLabel="earnings summary"
        roleName={currentUser?.roleName}
      />
    );
  }

  return (
    <div>
      <h4 className="mb-4">{t('time:myTime.title')}</h4>

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">{t('time:myTime.today', { date: formatWorkDate(today) })}</h5>
          {todayRecord ? (
            <div className="mb-3">
              <div className="mb-2">
                {t('time:myTime.status')}{' '}
                <TimeRecordStatusBadge status={todayRecord.status} />
                {todayRecord.corrected && (
                  <span className="badge bg-secondary ms-2">{t('time:badges.corrected')}</span>
                )}
              </div>
              <div className="text-muted small">
                {t('time:myTime.clockIn')} {formatInstant(todayRecord.clockIn)}
                {todayRecord.clockOut && (
                  <>
                    {' '}
                    · {t('time:myTime.clockOut')} {formatInstant(todayRecord.clockOut)}
                  </>
                )}
              </div>
            </div>
          ) : (
            <p className="text-muted mb-3">{t('time:myTime.noRecordToday')}</p>
          )}

          {actionError && <Alert variant="danger">{actionError}</Alert>}

          <div className="d-flex gap-2">
            <Button
              variant="success"
              disabled={!canClockIn || isMutating}
              onClick={() => clockInMutation.mutate()}
            >
              {clockInMutation.isPending ? t('time:myTime.clockingIn') : t('time:myTime.clockInAction')}
            </Button>
            <Button
              variant="outline-primary"
              disabled={!canClockOut || isMutating}
              onClick={() => clockOutMutation.mutate()}
            >
              {clockOutMutation.isPending ? t('time:myTime.clockingOut') : t('time:myTime.clockOutAction')}
            </Button>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">{t('time:myTime.history')}</h5>
        <Link to="/my/reports" className="btn btn-outline-primary btn-sm">
          {t('time:myTime.fullReport')}
        </Link>
      </div>

      <Row className="g-3 mb-3">
        <Col md={3}>
          <Form.Group controlId="my-time-from">
            <Form.Label>{t('common:labels.from')}</Form.Label>
            <Form.Control
              type="date"
              value={fromDate}
              max={toDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="my-time-to">
            <Form.Label>{t('common:labels.to')}</Form.Label>
            <Form.Control
              type="date"
              value={toDate}
              min={fromDate}
              max={today}
              onChange={(event) => setToDate(event.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={6} className="d-flex align-items-end gap-2 flex-wrap">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => {
              setFromDate(toIsoDateString(startOfMonth(new Date())));
              setToDate(today);
            }}
          >
            {t('time:myTime.presets.thisMonth')}
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => {
              setFromDate(toIsoDateString(startOfWeek(new Date())));
              setToDate(today);
            }}
          >
            {t('time:myTime.presets.thisWeek')}
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => {
              setFromDate(toIsoDateString(addDays(new Date(), -30)));
              setToDate(today);
            }}
          >
            {t('time:myTime.presets.last30Days')}
          </Button>
        </Col>
      </Row>

      {!reportBlocked && earningsQuery.data && (
        <p className="text-muted small mb-3">
          {t('time:myTime.periodTotal')}{' '}
          {formatMoney(earningsQuery.data.totalCappedEarnings)}
        </p>
      )}

      <MyTimeHistoryTable
        records={records}
        reportByRecordId={reportByRecordId}
        reportBlocked={reportBlocked}
        incompleteDates={incompleteDates}
      />
    </div>
  );
}
