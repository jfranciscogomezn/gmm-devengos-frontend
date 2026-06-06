import { Table } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import type { ClassifiedMinutes, TimeReportRecord } from '../../api/reports.service';
import { formatInstant, formatWorkDate } from '../../utils/timeFormat';
import { formatMoney, highlightRowClass } from '../../utils/reportDisplay';

interface TimeReportTableProps {
  records: TimeReportRecord[];
  uncapped: boolean;
  emptyMessage?: string;
}

function renderMinutes(minutes: ClassifiedMinutes): JSX.Element {
  return (
    <>
      <td>{minutes.normal}</td>
      <td>{minutes.daytimeOt}</td>
      <td>{minutes.nightSurcharge}</td>
      <td>{minutes.nocturnalOt}</td>
    </>
  );
}

function ReportNotes({ record }: { record: TimeReportRecord }) {
  const { t } = useTranslation(['time', 'common']);

  return (
    <td>
      {record.corrected && (
        <span className="badge bg-secondary me-1">{t('time:badges.corrected')}</span>
      )}
      {record.correctionReason && (
        <span className="small text-muted d-block mt-1">{record.correctionReason}</span>
      )}
      {record.highlightLevel === 'WARNING' && (
        <span className="badge bg-warning text-dark me-1">{t('time:badges.overtime')}</span>
      )}
      {record.highlightLevel === 'ALERT' && (
        <span className="badge bg-danger">{t('time:badges.extendedHours')}</span>
      )}
    </td>
  );
}

export function TimeReportTable({
  records,
  uncapped,
  emptyMessage,
}: TimeReportTableProps) {
  const { t } = useTranslation(['reports', 'common', 'time']);

  return (
    <Table striped hover responsive>
      <thead>
        <tr>
          <th>{t('common:labels.date')}</th>
          <th>{t('time:admin.table.clockIn')}</th>
          <th>{t('time:admin.table.clockOut')}</th>
          <th>{t('reports:table.normalMin')}</th>
          <th>{t('reports:table.daytimeOtMin')}</th>
          <th>{t('reports:table.nightMin')}</th>
          <th>{t('reports:table.nocturnalOtMin')}</th>
          <th>{t('reports:table.earnings')}</th>
          <th>{t('common:labels.notes')}</th>
        </tr>
      </thead>
      <tbody>
        {records.length === 0 ? (
          <tr>
            <td colSpan={9} className="text-center text-muted py-4">
              {emptyMessage ?? t('reports:table.empty')}
            </td>
          </tr>
        ) : (
          records.map((record) => {
            const minutes = uncapped ? record.classifiedMinutes : record.cappedMinutes;
            const earnings = uncapped ? record.uncappedEarnings : record.cappedEarnings;
            return (
              <tr key={record.timeRecordId} className={highlightRowClass(record.highlightLevel)}>
                <td>{formatWorkDate(record.workDate)}</td>
                <td>{formatInstant(record.clockIn)}</td>
                <td>{formatInstant(record.clockOut)}</td>
                {renderMinutes(minutes)}
                <td>{formatMoney(earnings)}</td>
                <ReportNotes record={record} />
              </tr>
            );
          })
        )}
      </tbody>
    </Table>
  );
}
