import { Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { timeService } from '../../api/time.service';
import { formatWorkDate } from '../../utils/timeFormat';

export function IncompleteTimeRecordsBanner() {
  const { t } = useTranslation('time');
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
      <Alert.Heading className="h6 mb-2">{t('incompleteBanner.heading')}</Alert.Heading>
      <p className="mb-2">
        {t('incompleteBanner.body', { count: records.length, dates })}
      </p>
      <Link to="/my/time" className="alert-link">
        {t('incompleteBanner.link')}
      </Link>
    </Alert>
  );
}
