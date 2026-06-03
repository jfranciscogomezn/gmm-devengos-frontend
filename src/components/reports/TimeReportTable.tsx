import { Table } from 'react-bootstrap';
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

function renderNotes(record: TimeReportRecord): JSX.Element {
  return (
    <td>
      {record.corrected && (
        <span className="badge bg-secondary me-1">Corrected</span>
      )}
      {record.correctionReason && (
        <span className="small text-muted d-block mt-1">{record.correctionReason}</span>
      )}
      {record.highlightLevel === 'WARNING' && (
        <span className="badge bg-warning text-dark me-1">Overtime</span>
      )}
      {record.highlightLevel === 'ALERT' && (
        <span className="badge bg-danger">Extended hours</span>
      )}
    </td>
  );
}

export function TimeReportTable({
  records,
  uncapped,
  emptyMessage = 'No closed records in this period.',
}: TimeReportTableProps) {
  return (
    <Table striped hover responsive>
      <thead className="table-dark">
        <tr>
          <th>Date</th>
          <th>Clock in</th>
          <th>Clock out</th>
          <th>Normal (min)</th>
          <th>Daytime OT (min)</th>
          <th>Night (min)</th>
          <th>Nocturnal OT (min)</th>
          <th>Earnings</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        {records.length === 0 ? (
          <tr>
            <td colSpan={9} className="text-center text-muted py-4">
              {emptyMessage}
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
                {renderNotes(record)}
              </tr>
            );
          })
        )}
      </tbody>
    </Table>
  );
}
