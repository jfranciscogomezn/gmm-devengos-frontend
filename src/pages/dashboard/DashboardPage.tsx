import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Col, Row, Spinner } from 'react-bootstrap';
import {
  Building,
  Calendar3,
  ExclamationTriangle,
  People,
  Person,
} from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import { employeesService } from '../../api/employees.service';
import { platformService } from '../../api/platform.service';
import { timeService } from '../../api/time.service';
import { AdminNotificationsBanner } from '../../components/notifications/AdminNotificationsBanner';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { IncompleteTimeRecordsBanner } from '../../components/time/IncompleteTimeRecordsBanner';
import { TimeRecordStatusBadge } from '../../components/time/TimeRecordStatusBadge';
import { useAuth } from '../../context/AuthContext';
import { menuLabel } from '../../i18n/menuLabel';
import type { MenuTreeNode, TimeRecord } from '../../types';
import { flattenMenuItems } from '../../utils/flattenMenuItems';
import { menuNodeIcon } from '../../utils/menuIcons';
import { formatInstant, toIsoDateString } from '../../utils/timeFormat';
import styles from './DashboardPage.module.css';

function findTodayRecord(records: TimeRecord[], today: string): TimeRecord | undefined {
  return records.find((record) => record.workDate === today);
}

function QuickActionLink({ node }: { node: MenuTreeNode }) {
  const { t } = useTranslation('menu');

  if (!node.route) {
    return null;
  }

  return (
    <Link to={node.route} className={styles.quickAction}>
      <span className={styles.quickIcon}>{menuNodeIcon(node.code, 'ITEM')}</span>
      <span className={styles.quickLabel}>{menuLabel(t, node.code, node.label)}</span>
    </Link>
  );
}

export function DashboardPage() {
  const { t } = useTranslation(['dashboard', 'common', 'time']);
  const { currentUser, tenant, isPlatformAdmin, hasPermission, menu } = useAuth();
  const today = toIsoDateString(new Date());
  const firstName = currentUser?.firstName ?? '';

  const { data: todayRecords = [], isLoading: todayLoading } = useQuery({
    queryKey: ['time-records', 'mine', 'today', today],
    queryFn: () => timeService.getMine({ from: today, to: today }),
    enabled: hasPermission('MY_TIME'),
  });

  const { data: myIncomplete = [] } = useQuery({
    queryKey: ['time-records', 'incomplete', 'dashboard-mine'],
    queryFn: () => timeService.getIncomplete(),
    enabled: hasPermission('MY_TIME'),
    staleTime: 60_000,
  });

  const { data: adminIncomplete = [] } = useQuery({
    queryKey: ['time-records', 'incomplete', 'dashboard-admin'],
    queryFn: () => timeService.getIncomplete(),
    enabled: hasPermission('TIME_RECORDS_ADMIN'),
    staleTime: 60_000,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees', 'dashboard-count'],
    queryFn: employeesService.findAll,
    enabled: hasPermission('EMPLOYEE_CONFIG'),
    staleTime: 120_000,
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ['platform-tenants', 'dashboard-count'],
    queryFn: platformService.findAll,
    enabled: isPlatformAdmin,
    staleTime: 120_000,
  });

  const todayRecord = findTodayRecord(todayRecords, today);
  const quickLinks = flattenMenuItems(menu).filter((node) => node.route !== '/dashboard');
  const activeTenants = tenants.filter((item) => item.status === 'ACTIVE').length;

  const welcomeSubtitle = isPlatformAdmin
    ? t('dashboard:platformSubtitle')
    : t('dashboard:welcomeUser', { name: firstName, company: tenant?.name ?? t('common:appName') });

  return (
    <div className={styles.page}>
      <PageHeader title={t('dashboard:title')} subtitle={welcomeSubtitle} />

      <Row className="g-3 mb-4">
        {hasPermission('MY_TIME') && (
          <Col xs={12} sm={6} xl={3}>
            <StatCard
              label={t('dashboard:stats.todayStatus')}
              accent="navy"
              icon={<Calendar3 size={18} />}
              value={
                todayLoading ? (
                  <Spinner size="sm" />
                ) : todayRecord ? (
                  <TimeRecordStatusBadge status={todayRecord.status} />
                ) : (
                  t('dashboard:stats.noRecordToday')
                )
              }
              hint={
                todayRecord?.clockIn
                  ? t('dashboard:stats.clockedInAt', { time: formatInstant(todayRecord.clockIn) })
                  : t('dashboard:stats.clockHint')
              }
            />
          </Col>
        )}

        {hasPermission('MY_TIME') && (
          <Col xs={12} sm={6} xl={3}>
            <StatCard
              label={t('dashboard:stats.myIncomplete')}
              accent={myIncomplete.length > 0 ? 'warning' : 'success'}
              icon={<ExclamationTriangle size={18} />}
              value={myIncomplete.length}
              hint={
                myIncomplete.length > 0
                  ? t('dashboard:stats.incompleteHint')
                  : t('dashboard:stats.allClear')
              }
            />
          </Col>
        )}

        {hasPermission('TIME_RECORDS_ADMIN') && (
          <Col xs={12} sm={6} xl={3}>
            <StatCard
              label={t('dashboard:stats.teamIncomplete')}
              accent={adminIncomplete.length > 0 ? 'warning' : 'success'}
              icon={<ExclamationTriangle size={18} />}
              value={adminIncomplete.length}
              hint={t('dashboard:stats.teamIncompleteHint')}
            />
          </Col>
        )}

        {hasPermission('EMPLOYEE_CONFIG') && (
          <Col xs={12} sm={6} xl={3}>
            <StatCard
              label={t('dashboard:stats.employees')}
              accent="gold"
              icon={<People size={18} />}
              value={employees.length}
              hint={t('dashboard:stats.employeesHint')}
            />
          </Col>
        )}

        {isPlatformAdmin && (
          <Col xs={12} sm={6} xl={3}>
            <StatCard
              label={t('dashboard:stats.activeTenants')}
              accent="gold"
              icon={<Building size={18} />}
              value={activeTenants}
              hint={t('dashboard:stats.tenantsHint', { total: tenants.length })}
            />
          </Col>
        )}
      </Row>

      {hasPermission('TIME_RECORDS_ADMIN') && <AdminNotificationsBanner />}
      {hasPermission('MY_TIME') && <IncompleteTimeRecordsBanner />}

      {quickLinks.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('dashboard:quickActions')}</h2>
          <div className={styles.quickGrid}>
            {quickLinks.map((node) => (
              <QuickActionLink key={node.code} node={node} />
            ))}
          </div>
        </section>
      )}

      {!hasPermission('MY_TIME') && !hasPermission('TIME_RECORDS_ADMIN') && !isPlatformAdmin && (
        <div className={styles.emptyHint}>
          <Person size={28} className="mb-2 text-muted" />
          <p className="mb-0 text-muted">{t('dashboard:emptyModules')}</p>
        </div>
      )}
    </div>
  );
}
