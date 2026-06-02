import { Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { timeService } from '../../api/time.service';
import { formatWorkDate } from '../../utils/timeFormat';

export function IncompleteTimeRecordsBanner() {
  const { data: records = [] } = useQuery({
    queryKey: ['time-records', 'incomplete', 'banner'],
    queryFn: () => timeService.getIncomplete(),
    staleTime: 60_000,
  });

  if (records.length === 0) {
    return null;
  }

  const dates = records.map((record) => formatWorkDate(record.workDate)).join(', ');

  return (
    <Alert variant="warning" className="mb-4">
      <Alert.Heading className="h6 mb-2">Incomplete time records</Alert.Heading>
      <p className="mb-2">
        You have {records.length} incomplete record(s) on: {dates}. Contact your administrator to resolve them.
      </p>
      <Link to="/my/time" className="alert-link">
        View my time records
      </Link>
    </Alert>
  );
}
