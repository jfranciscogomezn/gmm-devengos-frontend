import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { notificationsService, type AdminNotification } from '../../api/notifications.service';
import { useAuth } from '../../context/AuthContext';
import { formatInstant } from '../../utils/timeFormat';
import styles from './AnnouncementsPanel.module.css';

interface StaticAnnouncement {
  id: string;
  title: string;
  body: string;
  dateLabel: string;
}

function mapNotification(item: AdminNotification) {
  return {
    id: `api-${item.id}`,
    title: item.title,
    body: item.message,
    dateLabel: formatInstant(item.createdAt),
  };
}

export function AnnouncementsPanel() {
  const { t } = useTranslation('dashboard');
  const { hasPermission } = useAuth();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', 'announcements-panel'],
    queryFn: notificationsService.listRecent,
    enabled: hasPermission('TIME_RECORDS_ADMIN'),
    staleTime: 60_000,
  });

  const staticItems = t('announcements.items', { returnObjects: true }) as StaticAnnouncement[];
  const apiItems = notifications.slice(0, 3).map(mapNotification);
  const items = apiItems.length > 0 ? apiItems : staticItems;

  return (
    <section className={styles.panel}>
      <h2 className={styles.title}>{t('announcements.title')}</h2>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id} className={styles.item}>
            <span className={styles.bullet} aria-hidden />
            <div className={styles.content}>
              <span className={styles.itemTitle}>{item.title}</span>
              <p className={styles.itemBody}>{item.body}</p>
              <span className={styles.itemDate}>{item.dateLabel}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
