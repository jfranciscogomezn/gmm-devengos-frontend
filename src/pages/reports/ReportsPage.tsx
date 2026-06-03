import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Alert, Button, Col, Form, Row, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { employeesService } from '../../api/employees.service';
import { reportsService } from '../../api/reports.service';
import { ReportPeriodFilters, ReportPeriodPresets } from '../../components/reports/ReportPeriodFilters';
import { parseIncompleteReportError } from '../../components/reports/MyTimeHistoryTable';
import { TimeReportTable } from '../../components/reports/TimeReportTable';
import { ApiErrorAlert } from '../../components/ApiErrorAlert/ApiErrorAlert';
import { useAuth } from '../../context/AuthContext';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatMoney } from '../../utils/reportDisplay';
import {
  buildReportQueryParams,
  defaultReportPeriodState,
  reportPeriodLabel,
} from '../../utils/reportPeriod';
import { toIsoDateString } from '../../utils/timeFormat';

export function ReportsPage() {
  const { t } = useTranslation(['reports', 'common']);
  const { currentUser, hasPermission } = useAuth();
  const isAdmin = hasPermission('REPORTS');
  const today = toIsoDateString(new Date());
  const [employeeId, setEmployeeId] = useState<number | ''>('');
  const [period, setPeriod] = useState(() => defaultReportPeriodState(today));
  const [uncapped, setUncapped] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: employeesService.findAll,
    enabled: isAdmin,
  });

  const queryParams = useMemo(
    () => ({
      ...buildReportQueryParams(period),
      ...(isAdmin && employeeId !== '' ? { employeeId } : {}),
    }),
    [period, isAdmin, employeeId]
  );

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

  const incompleteDates = parseIncompleteReportError(reportQuery.error);
  const report = reportQuery.data;
  const totalEarnings = report
    ? (report.capped ? report.totalCappedEarnings : report.totalUncappedEarnings)
    : 0;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">{t('reports:title')}</h4>
        <Button
          size="sm"
          variant="outline-success"
          disabled={!report || exportMutation.isPending}
          onClick={() => exportMutation.mutate()}
        >
          {exportMutation.isPending ? t('common:actions.exporting') : t('common:actions.exportExcel')}
        </Button>
      </div>

      <ReportPeriodPresets today={today} onApply={setPeriod} />

      <Row className="g-3 mb-4">
        {isAdmin && (
          <Col md={4}>
            <Form.Group controlId="reports-employee">
              <Form.Label>{t('common:labels.employee')}</Form.Label>
              <Form.Select
                value={employeeId}
                onChange={(event) => {
                  const value = event.target.value;
                  setEmployeeId(value === '' ? '' : Number(value));
                }}
              >
                <option value="">{t('common:placeholders.selectEmployee')}</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        )}
        <ReportPeriodFilters
          idPrefix="reports"
          today={today}
          period={period}
          onChange={setPeriod}
        />
        {isAdmin && (
          <Col md={3} className="d-flex align-items-end">
            <Form.Check
              type="switch"
              id="reports-uncapped"
              label={t('reports:uncappedView')}
              checked={uncapped}
              onChange={(event) => setUncapped(event.target.checked)}
            />
          </Col>
        )}
      </Row>

      {exportError && <Alert variant="danger">{exportError}</Alert>}

      {isAdmin && employeeId === '' && (
        <p className="text-muted">{t('reports:selectEmployeeHint')}</p>
      )}

      {reportQuery.isLoading && (
        <div className="text-center py-4"><Spinner /></div>
      )}

      {incompleteDates && (
        <Alert variant="warning">
          <Alert.Heading className="h6">{t('reports:incompleteHeading')}</Alert.Heading>
          <p className="mb-0">
            {t('reports:incompleteBody', { dates: incompleteDates.join(', ') })}
          </p>
        </Alert>
      )}

      {reportQuery.isError && !incompleteDates && (
        <ApiErrorAlert error={reportQuery.error} resourceLabel="report" roleName={currentUser?.roleName} />
      )}

      {report && (
        <>
          <p className="text-muted mb-3">
            {t('reports:summary', {
              name: report.employeeName,
              period: reportPeriodLabel(period),
              view: uncapped ? t('reports:viewUncapped') : t('reports:viewCapped'),
              total: formatMoney(totalEarnings),
            })}
          </p>
          <TimeReportTable records={report.records} uncapped={uncapped} />
        </>
      )}
    </div>
  );
}
