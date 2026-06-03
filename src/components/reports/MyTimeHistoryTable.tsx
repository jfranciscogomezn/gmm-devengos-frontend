import axios from 'axios';
import { Alert, Table } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import type { TimeReportRecord } from '../../api/reports.service';
import type { TimeRecord } from '../../types';
import { TimeRecordStatusBadge } from '../time/TimeRecordStatusBadge';
import {
  computeDurationMinutes,
  formatDuration,
  formatInstant,
  formatWorkDate,
} from '../../utils/timeFormat';
import { formatMoney, highlightRowClass } from '../../utils/reportDisplay';

interface MyTimeHistoryTableProps {
  records: TimeRecord[];
  reportByRecordId: Map<number, TimeReportRecord>;
  reportBlocked: boolean;
  incompleteDates: string[] | null;
}

export function MyTimeHistoryTable({
  records,
  reportByRecordId,
  reportBlocked,
  incompleteDates,
}: MyTimeHistoryTableProps) {
  const { t } = useTranslation(['time', 'common', 'reports']);

  return (
    <>
      {reportBlocked && incompleteDates && (
        <Alert variant="warning" className="mb-3">
          {t('time:history.incompleteBlock', { dates: incompleteDates.join(', ') })}
        </Alert>
      )}

      <Table striped hover responsive>
        <thead className="table-dark">
          <tr>
            <th>{t('common:labels.date')}</th>
            <th>{t('time:admin.table.clockIn')}</th>
            <th>{t('time:admin.table.clockOut')}</th>
            <th>{t('common:labels.duration')}</th>
            <th>{t('common:labels.status')}</th>
            {!reportBlocked && (
              <>
                <th>{t('reports:table.normalMin')}</th>
                <th>{t('reports:table.daytimeOtMin')}</th>
                <th>{t('reports:table.earnings')}</th>
                <th>{t('common:labels.notes')}</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {records.length === 0 ? (
            <tr>
              <td colSpan={reportBlocked ? 5 : 9} className="text-center text-muted py-4">
                {t('time:history.emptyRange')}
              </td>
            </tr>
          ) : (
            records.map((record) => {
              const durationMinutes = computeDurationMinutes(record.clockIn, record.clockOut);
              const report = reportByRecordId.get(record.id);
              const rowClass = report ? highlightRowClass(report.highlightLevel) : '';

              return (
                <tr key={record.id} className={rowClass}>
                  <td>{formatWorkDate(record.workDate)}</td>
                  <td>{formatInstant(record.clockIn)}</td>
                  <td>{record.clockOut ? formatInstant(record.clockOut) : '—'}</td>
                  <td>{durationMinutes !== null ? formatDuration(durationMinutes) : '—'}</td>
                  <td>
                    <TimeRecordStatusBadge status={record.status} />
                    {record.corrected && (
                      <span className="badge bg-secondary ms-2">{t('time:badges.corrected')}</span>
                    )}
                  </td>
                  {!reportBlocked && (
                    <>
                      <td>{report ? report.cappedMinutes.normal : '—'}</td>
                      <td>{report ? report.cappedMinutes.daytimeOt : '—'}</td>
                      <td>{report ? formatMoney(report.cappedEarnings) : '—'}</td>
                      <td>
                        {report?.correctionReason && (
                          <span className="small text-muted">{report.correctionReason}</span>
                        )}
                        {!report && record.status === 'CLOSED' && (
                          <span className="small text-muted">{t('time:history.noEarnings')}</span>
                        )}
                        {report?.highlightLevel === 'WARNING' && (
                          <span className="badge bg-warning text-dark ms-1">{t('time:badges.overtime')}</span>
                        )}
                        {report?.highlightLevel === 'ALERT' && (
                          <span className="badge bg-danger ms-1">{t('time:badges.extendedHours')}</span>
                        )}
                      </td>
                    </>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </Table>
    </>
  );
}

export function parseIncompleteReportError(error: unknown): string[] | null {
  if (
    axios.isAxiosError(error)
    && error.response?.status === 409
    && typeof error.response.data === 'object'
    && error.response.data !== null
    && 'incompleteDates' in error.response.data
  ) {
    return (error.response.data as { incompleteDates: string[] }).incompleteDates;
  }
  return null;
}
