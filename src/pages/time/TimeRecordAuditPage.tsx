import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Alert, Button, Col, Form, Row, Spinner, Table } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { auditService } from '../../api/audit.service';
import { employeesService } from '../../api/employees.service';
import { usersService } from '../../api/users.service';
import { ApiErrorAlert } from '../../components/ApiErrorAlert/ApiErrorAlert';
import type { Employee, UserProfile } from '../../types';
import {
  formatAuditAction,
  formatAuditSnapshotSummary,
  parseAuditSnapshot,
  resolveAuditEmployeeId,
} from '../../utils/auditDisplay';
import { formatInstant, startOfMonth, toIsoDateString } from '../../utils/timeFormat';

function employeeLabel(employee: Employee): string {
  return `${employee.firstName} ${employee.lastName}`;
}

function userLabel(user: UserProfile): string {
  return `${user.firstName} ${user.lastName} (${user.email})`;
}

export function TimeRecordAuditPage() {
  const { t } = useTranslation(['time', 'common']);
  const today = toIsoDateString(new Date());
  const [fromDate, setFromDate] = useState(toIsoDateString(startOfMonth(new Date())));
  const [toDate, setToDate] = useState(today);
  const [employeeId, setEmployeeId] = useState<number | ''>('');
  const [userId, setUserId] = useState<number | ''>('');

  const { data: employees = [], isLoading: employeesLoading, isError: employeesError, error: employeesQueryError } =
    useQuery({
      queryKey: ['employees'],
      queryFn: employeesService.findAll,
    });

  const { data: users = [], isLoading: usersLoading, isError: usersError, error: usersQueryError } = useQuery({
    queryKey: ['users'],
    queryFn: usersService.findAll,
  });

  const queryParams = useMemo(
    () => ({
      from: fromDate,
      to: toDate,
      ...(employeeId !== '' ? { employeeId } : {}),
      ...(userId !== '' ? { userId } : {}),
      limit: 100,
    }),
    [fromDate, toDate, employeeId, userId]
  );

  const {
    data: entries = [],
    isLoading: entriesLoading,
    isError: entriesError,
    error: entriesQueryError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['audit', 'time-records', queryParams],
    queryFn: () => auditService.listTimeRecords(queryParams),
  });

  const employeeById = useMemo(
    () => new Map(employees.map((employee) => [employee.id, employee])),
    [employees]
  );

  const userById = useMemo(() => new Map(users.map((user) => [user.id, user])), [users]);

  const filtersLoading = employeesLoading || usersLoading;
  const filtersError = employeesError || usersError;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">{t('time:audit.title')}</h4>
          <p className="text-muted mb-0">{t('time:audit.subtitle')}</p>
        </div>
        <Link to="/admin/time" className="btn btn-outline-secondary btn-sm">
          {t('time:audit.back')}
        </Link>
      </div>

      {filtersError && (
        <ApiErrorAlert
          error={employeesError ? employeesQueryError : usersQueryError}
          resourceLabel={employeesError ? 'employees' : 'users'}
        />
      )}

      <Row className="g-3 mb-4">
        <Col md={3}>
          <Form.Group controlId="audit-from-date">
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
          <Form.Group controlId="audit-to-date">
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
        <Col md={3}>
          <Form.Group controlId="audit-employee">
            <Form.Label>{t('common:labels.employee')}</Form.Label>
            <Form.Select
              value={employeeId}
              disabled={filtersLoading}
              onChange={(event) => {
                const value = event.target.value;
                setEmployeeId(value === '' ? '' : Number(value));
              }}
            >
              <option value="">{t('time:audit.allEmployees')}</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employeeLabel(employee)}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="audit-user">
            <Form.Label>{t('time:audit.userActor')}</Form.Label>
            <Form.Select
              value={userId}
              disabled={filtersLoading}
              onChange={(event) => {
                const value = event.target.value;
                setUserId(value === '' ? '' : Number(value));
              }}
            >
              <option value="">{t('time:audit.allUsers')}</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {userLabel(user)}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col xs={12} className="d-flex justify-content-end">
          <Button variant="primary" size="sm" disabled={isFetching} onClick={() => refetch()}>
            {isFetching ? t('common:actions.refreshing') : t('common:actions.refresh')}
          </Button>
        </Col>
      </Row>

      {entriesError && <ApiErrorAlert error={entriesQueryError} resourceLabel="audit history" />}

      {entriesLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" />
        </div>
      ) : entries.length === 0 ? (
        <Alert variant="info">{t('time:audit.empty')}</Alert>
      ) : (
        <Table responsive hover size="sm" className="align-middle">
          <thead>
            <tr>
              <th>{t('time:audit.table.when')}</th>
              <th>{t('time:audit.table.action')}</th>
              <th>{t('time:audit.table.user')}</th>
              <th>{t('time:audit.table.employee')}</th>
              <th>{t('time:audit.table.record')}</th>
              <th>{t('time:audit.table.before')}</th>
              <th>{t('time:audit.table.after')}</th>
              <th>{t('time:audit.table.reason')}</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const auditEmployeeId = resolveAuditEmployeeId(entry);
              const employee =
                auditEmployeeId != null ? employeeById.get(auditEmployeeId) : undefined;
              const actor =
                entry.actorUserId != null
                  ? userById.get(entry.actorUserId)
                  : undefined;
              const actorDisplay =
                actor != null
                  ? userLabel(actor)
                  : entry.actorEmail ?? (entry.actorUserId != null
                    ? t('time:audit.userFallback', { id: entry.actorUserId })
                    : '—');

              return (
                <tr key={entry.id}>
                  <td className="text-nowrap">{formatInstant(entry.createdAt)}</td>
                  <td>{formatAuditAction(entry.action)}</td>
                  <td>{actorDisplay}</td>
                  <td>{employee ? employeeLabel(employee) : auditEmployeeId ?? '—'}</td>
                  <td>#{entry.entityId}</td>
                  <td>{formatAuditSnapshotSummary(parseAuditSnapshot(entry.oldValue))}</td>
                  <td>{formatAuditSnapshotSummary(parseAuditSnapshot(entry.newValue))}</td>
                  <td>{entry.correctionReason ?? '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </div>
  );
}
