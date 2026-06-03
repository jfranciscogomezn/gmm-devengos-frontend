import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Alert, Button, Col, Form, Row, Spinner, Table } from 'react-bootstrap';
import { employeesService } from '../../api/employees.service';
import { reportsService, type TimeReportRecord } from '../../api/reports.service';
import { ApiErrorAlert } from '../../components/ApiErrorAlert/ApiErrorAlert';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatInstant, formatWorkDate, toIsoDateString } from '../../utils/timeFormat';

function highlightClass(level: TimeReportRecord['highlightLevel']): string {
  if (level === 'WARNING') {
    return 'table-warning';
  }
  if (level === 'ALERT') {
    return 'table-danger';
  }
  return '';
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

export function ReportsPage() {
  const { currentUser, hasPermission } = useAuth();
  const isAdmin = hasPermission('REPORTS');
  const today = toIsoDateString(new Date());
  const [employeeId, setEmployeeId] = useState<number | ''>('');
  const [month, setMonth] = useState(today.slice(0, 7));
  const [uncapped, setUncapped] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: employeesService.findAll,
    enabled: isAdmin,
  });

  const queryParams = useMemo(() => {
    const base = { month, ...(isAdmin && employeeId !== '' ? { employeeId } : {}) };
    return base;
  }, [month, isAdmin, employeeId]);

  const reportQuery = useQuery({
    queryKey: ['reports', 'time', uncapped, queryParams],
    queryFn: () =>
      uncapped && isAdmin && employeeId !== ''
        ? reportsService.getUncappedReport({ ...queryParams, employeeId: employeeId as number })
        : reportsService.getCappedReport(queryParams),
    enabled: !isAdmin || employeeId !== '',
  });

  const exportMutation = useMutation({
    mutationFn: () =>
      reportsService.exportReport({
        ...queryParams,
        cap: !uncapped,
      }),
    onMutate: () => setExportError(null),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'time-report.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
    },
    onError: (error) => setExportError(getApiErrorMessage(error, 'report export')),
  });

  const incompleteDates = axios.isAxiosError(reportQuery.error)
    && reportQuery.error.response?.status === 409
    && typeof reportQuery.error.response.data === 'object'
    && reportQuery.error.response.data !== null
    && 'incompleteDates' in reportQuery.error.response.data
    ? (reportQuery.error.response.data as { incompleteDates: string[] }).incompleteDates
    : null;

  const report = reportQuery.data;
  const totalEarnings = report
    ? (report.capped ? report.totalCappedEarnings : report.totalUncappedEarnings)
    : 0;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Time &amp; Earnings Reports</h4>
        <Button
          size="sm"
          variant="outline-success"
          disabled={!report || exportMutation.isPending || (!isAdmin && false)}
          onClick={() => exportMutation.mutate()}
        >
          {exportMutation.isPending ? 'Exporting…' : 'Export Excel'}
        </Button>
      </div>

      <Row className="g-3 mb-4">
        {isAdmin && (
          <Col md={4}>
            <Form.Group controlId="reports-employee">
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
                    {employee.firstName} {employee.lastName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        )}
        <Col md={3}>
          <Form.Group controlId="reports-month">
            <Form.Label>Month</Form.Label>
            <Form.Control type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
          </Form.Group>
        </Col>
        {isAdmin && (
          <Col md={3} className="d-flex align-items-end">
            <Form.Check
              type="switch"
              id="reports-uncapped"
              label="Uncapped view (Report B)"
              checked={uncapped}
              onChange={(event) => setUncapped(event.target.checked)}
            />
          </Col>
        )}
      </Row>

      {exportError && <Alert variant="danger">{exportError}</Alert>}

      {isAdmin && employeeId === '' && (
        <p className="text-muted">Select an employee to generate the report.</p>
      )}

      {reportQuery.isLoading && (
        <div className="text-center py-4"><Spinner /></div>
      )}

      {incompleteDates && (
        <Alert variant="warning">
          <Alert.Heading className="h6">Incomplete records block this report</Alert.Heading>
          <p className="mb-0">
            Resolve incomplete records on: {incompleteDates.join(', ')} before generating the report.
          </p>
        </Alert>
      )}

      {reportQuery.isError && !incompleteDates && (
        <ApiErrorAlert error={reportQuery.error} resourceLabel="report" roleName={currentUser?.roleName} />
      )}

      {report && (
        <>
          <p className="text-muted mb-3">
            {report.employeeName} · {uncapped ? 'Uncapped' : 'Capped'} view · Total: {formatMoney(totalEarnings)}
          </p>
          <Table striped hover responsive>
            <thead className="table-dark">
              <tr>
                <th>Date</th>
                <th>Clock in</th>
                <th>Clock out</th>
                <th>Normal (min)</th>
                <th>Daytime OT (min)</th>
                <th>Earnings</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {report.records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">No closed records in this period.</td>
                </tr>
              ) : (
                report.records.map((record) => {
                  const minutes = uncapped ? record.classifiedMinutes : record.cappedMinutes;
                  const earnings = uncapped ? record.uncappedEarnings : record.cappedEarnings;
                  return (
                    <tr key={record.timeRecordId} className={highlightClass(record.highlightLevel)}>
                      <td>{formatWorkDate(record.workDate)}</td>
                      <td>{formatInstant(record.clockIn)}</td>
                      <td>{formatInstant(record.clockOut)}</td>
                      <td>{minutes.normal}</td>
                      <td>{minutes.daytimeOt}</td>
                      <td>{formatMoney(earnings)}</td>
                      <td>
                        {record.corrected && record.correctionReason && (
                          <span className="badge bg-secondary me-1">Corrected</span>
                        )}
                        {record.highlightLevel === 'ALERT' && (
                          <span className="badge bg-danger">Extended hours</span>
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
