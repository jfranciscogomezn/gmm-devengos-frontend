import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Col, Form, Row, Spinner, Table } from 'react-bootstrap';
import { employeesService } from '../../api/employees.service';
import { timeService } from '../../api/time.service';
import { ApiErrorAlert } from '../../components/ApiErrorAlert/ApiErrorAlert';
import { TimeRecordStatusBadge } from '../../components/time/TimeRecordStatusBadge';
import { useAuth } from '../../context/AuthContext';
import {
  addDays,
  computeDurationMinutes,
  formatDuration,
  formatInstant,
  formatWorkDate,
  startOfMonth,
  toIsoDateString,
} from '../../utils/timeFormat';

export function AdminTimeRecordsPage() {
  const { currentUser } = useAuth();
  const today = toIsoDateString(new Date());
  const [employeeId, setEmployeeId] = useState<number | ''>('');
  const [fromDate, setFromDate] = useState(toIsoDateString(startOfMonth(new Date())));
  const [toDate, setToDate] = useState(today);

  const {
    data: employees = [],
    isLoading: employeesLoading,
    isError: employeesError,
    error: employeesQueryError,
  } = useQuery({
    queryKey: ['employees'],
    queryFn: employeesService.findAll,
  });

  const selectedEmployeeId = employeeId === '' ? null : employeeId;

  const {
    data: records = [],
    isLoading: recordsLoading,
    isError: recordsError,
    error: recordsQueryError,
  } = useQuery({
    queryKey: ['time-records', 'admin', selectedEmployeeId, fromDate, toDate],
    queryFn: () =>
      timeService.getByEmployee({
        employeeId: selectedEmployeeId as number,
        from: fromDate,
        to: toDate,
      }),
    enabled: selectedEmployeeId !== null,
  });

  const selectedEmployee = useMemo(
    () => employees.find((employee) => employee.id === selectedEmployeeId),
    [employees, selectedEmployeeId]
  );

  if (employeesLoading) {
    return (
      <div className="text-center py-5">
        <Spinner />
      </div>
    );
  }

  if (employeesError) {
    return (
      <ApiErrorAlert
        error={employeesQueryError}
        resourceLabel="employees"
        roleName={currentUser?.roleName}
      />
    );
  }

  return (
    <div>
      <h4 className="mb-4">Time Records</h4>

      <Row className="g-3 mb-4">
        <Col md={4}>
          <Form.Group controlId="admin-time-employee">
            <Form.Label>Employee</Form.Label>
            <Form.Select
              value={employeeId}
              onChange={(event) => {
                const value = event.target.value;
                setEmployeeId(value === '' ? '' : Number(value));
              }}
            >
              <option value="">Select an employee…</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName} ({employee.email})
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="admin-time-from">
            <Form.Label>From</Form.Label>
            <Form.Control
              type="date"
              value={fromDate}
              max={toDate}
              disabled={selectedEmployeeId === null}
              onChange={(event) => setFromDate(event.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="admin-time-to">
            <Form.Label>To</Form.Label>
            <Form.Control
              type="date"
              value={toDate}
              min={fromDate}
              max={today}
              disabled={selectedEmployeeId === null}
              onChange={(event) => setToDate(event.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={2} className="d-flex align-items-end">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm w-100"
            disabled={selectedEmployeeId === null}
            onClick={() => {
              setFromDate(toIsoDateString(addDays(new Date(), -30)));
              setToDate(today);
            }}
          >
            Last 30 days
          </button>
        </Col>
      </Row>

      {selectedEmployeeId === null && (
        <p className="text-muted">Select an employee to view their time records.</p>
      )}

      {selectedEmployeeId !== null && recordsLoading && (
        <div className="text-center py-4">
          <Spinner />
        </div>
      )}

      {selectedEmployeeId !== null && recordsError && (
        <ApiErrorAlert
          error={recordsQueryError}
          resourceLabel="time records"
          roleName={currentUser?.roleName}
        />
      )}

      {selectedEmployeeId !== null && !recordsLoading && !recordsError && (
        <>
          {selectedEmployee && (
            <p className="text-muted mb-3">
              Showing records for {selectedEmployee.firstName} {selectedEmployee.lastName}.
            </p>
          )}

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
        </>
      )}
    </div>
  );
}
