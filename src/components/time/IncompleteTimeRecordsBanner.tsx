import { Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { timeService } from '../../api/time.service';
import { addDays, formatWorkDate, toIsoDateString } from '../../utils/timeFormat';

export function IncompleteTimeRecordsBanner() {
  const today = new Date();
  const from = toIsoDateString(addDays(today, -90));

  const { data: records = [] } = useQuery({
    queryKey: ['time-records', 'mine', 'incomplete-banner', from],
    queryFn: () => timeService.getMine({ from }),
    staleTime: 60_000,
  });

  const incompleteRecords = records.filter((record) => record.status === 'INCOMPLETE');
  if (incompleteRecords.length === 0) {
    return null;
  }

  const dates = incompleteRecords.map((record) => formatWorkDate(record.workDate)).join(', ');

  return (
    <Alert variant="warning" className="mb-4">
      <Alert.Heading className="h6 mb-2">Incomplete time records</Alert.Heading>
      <p className="mb-2">
        You have {incompleteRecords.length} incomplete record(s) on: {dates}. Contact your administrator to resolve them.
      </p>
      <Link to="/my/time" className="alert-link">
        View my time records
      </Link>
    </Alert>
  );
}
