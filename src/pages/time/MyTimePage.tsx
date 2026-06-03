import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Col, Form, Row, Spinner, Table } from 'react-bootstrap';
import { timeService } from '../../api/time.service';
import { ApiErrorAlert } from '../../components/ApiErrorAlert/ApiErrorAlert';
import { TimeRecordStatusBadge } from '../../components/time/TimeRecordStatusBadge';
import { useAuth } from '../../context/AuthContext';
import type { TimeRecord } from '../../types';
import { getApiErrorMessage } from '../../utils/apiError';
import {
  addDays,
  computeDurationMinutes,
  formatDuration,
  formatInstant,
  formatWorkDate,
  startOfMonth,
  toIsoDateString,
} from '../../utils/timeFormat';

function findTodayRecord(records: TimeRecord[], today: string): TimeRecord | undefined {
  return records.find((record) => record.workDate === today);
}

export function MyTimePage() {
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

  const todayRecord = useMemo(() => findTodayRecord(records, today), [records, today]);

  const invalidateRecords = async () => {
    await queryClient.invalidateQueries({ queryKey: ['time-records', 'mine'] });
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

  if (isLoading) {
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

  return (
    <div>
      <h4 className="mb-4">My Time</h4>

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Today — {formatWorkDate(today)}</h5>
          {todayRecord ? (
            <div className="mb-3">
              <div className="mb-2">
                Status: <TimeRecordStatusBadge status={todayRecord.status} />
                {todayRecord.corrected && (
                  <span className="badge bg-secondary ms-2">Corrected</span>
                )}
              </div>
              <div className="text-muted small">
                Clock in: {formatInstant(todayRecord.clockIn)}
                {todayRecord.clockOut && (
                  <>
                    {' '}
                    · Clock out: {formatInstant(todayRecord.clockOut)}
                  </>
                )}
              </div>
            </div>
          ) : (
            <p className="text-muted mb-3">No time record for today yet.</p>
          )}

          {actionError && <Alert variant="danger">{actionError}</Alert>}

          <div className="d-flex gap-2">
            <Button
              variant="success"
              disabled={!canClockIn || isMutating}
              onClick={() => clockInMutation.mutate()}
            >
              {clockInMutation.isPending ? 'Clocking in…' : 'Clock in'}
            </Button>
            <Button
              variant="outline-primary"
              disabled={!canClockOut || isMutating}
              onClick={() => clockOutMutation.mutate()}
            >
              {clockOutMutation.isPending ? 'Clocking out…' : 'Clock out'}
            </Button>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">History</h5>
        <Link to="/my/reports" className="btn btn-outline-primary btn-sm">View earnings report</Link>
      </div>

      <Row className="g-3 mb-3">
        <Col md={3}>
          <Form.Group controlId="my-time-from">
            <Form.Label>From</Form.Label>
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
            <Form.Label>To</Form.Label>
            <Form.Control
              type="date"
              value={toDate}
              min={fromDate}
              max={today}
              onChange={(event) => setToDate(event.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={6} className="d-flex align-items-end gap-2">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => {
              setFromDate(toIsoDateString(startOfMonth(new Date())));
              setToDate(today);
            }}
          >
            This month
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => {
              setFromDate(toIsoDateString(addDays(new Date(), -30)));
              setToDate(today);
            }}
          >
            Last 30 days
          </Button>
        </Col>
      </Row>

      <Table striped hover responsive>
        <thead className="table-dark">
          <tr>
            <th>Date</th>
            <th>Clock in</th>
            <th>Clock out</th>
            <th>Duration</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {records.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center text-muted py-4">
                No records in this date range.
              </td>
            </tr>
          ) : (
            records.map((record) => {
              const durationMinutes = computeDurationMinutes(record.clockIn, record.clockOut);
              return (
                <tr key={record.id}>
                  <td>{formatWorkDate(record.workDate)}</td>
                  <td>{formatInstant(record.clockIn)}</td>
                  <td>{record.clockOut ? formatInstant(record.clockOut) : '—'}</td>
                  <td>{durationMinutes !== null ? formatDuration(durationMinutes) : '—'}</td>
                  <td>
                    <TimeRecordStatusBadge status={record.status} />
                    {record.corrected && (
                      <span className="badge bg-secondary ms-2">Corrected</span>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </Table>
    </div>
  );
}
