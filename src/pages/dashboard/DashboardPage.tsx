import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Col, Row, Spinner, Table } from 'react-bootstrap';
import {
  Building,
  Calendar3,
  ClockHistory,
  ExclamationTriangle,
  People,
} from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import { auditService } from '../../api/audit.service';
import { employeesService } from '../../api/employees.service';
import { platformService } from '../../api/platform.service';
import { timeService } from '../../api/time.service';
import { AnnouncementsPanel } from '../../components/dashboard/AnnouncementsPanel';
import { IncompleteTimeRecordsBanner } from '../../components/time/IncompleteTimeRecordsBanner';
import { TimeRecordStatusBadge } from '../../components/time/TimeRecordStatusBadge';
import { StatCard } from '../../components/ui/StatCard';
import { useAuth } from '../../context/AuthContext';
import { menuLabel } from '../../i18n/menuLabel';
import type { MenuTreeNode, TimeRecord } from '../../types';
import { formatAuditAction } from '../../utils/auditDisplay';
import { formatDashboardDate, getGreetingPeriod } from '../../utils/dashboardGreeting';
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

function teamInitials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
}

export function DashboardPage() {
  const { t, i18n } = useTranslation(['dashboard', 'common', 'time']);
  const { currentUser, tenant, isPlatformAdmin, hasPermission, menu } = useAuth();
  const today = toIsoDateString(new Date());
  const firstName = currentUser?.firstName ?? '';
  const greetingPeriod = getGreetingPeriod();

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

  const { data: recentAudit = [], isLoading: auditLoading } = useQuery({
    queryKey: ['audit', 'time-records', 'dashboard'],
    queryFn: () => auditService.listTimeRecords({ limit: 5 }),
    enabled: hasPermission('TIME_RECORD_AUDIT') || hasPermission('TIME_RECORDS_ADMIN'),
    staleTime: 60_000,
  });

  const todayRecord = findTodayRecord(todayRecords, today);
  const quickLinks = flattenMenuItems(menu).filter((node) => node.route !== '/dashboard');
  const activeTenants = tenants.filter((item) => item.status === 'ACTIVE').length;
  const incompleteCount = hasPermission('TIME_RECORDS_ADMIN') ? adminIncomplete.length : myIncomplete.length;

  const kpiCards: ReactNode[] = [];

  if (hasPermission('MY_TIME')) {
    kpiCards.push(
      <Col key="today" xs={12} md={4}>
        <StatCard
          label={t('dashboard:stats.todayRecords')}
          icon={<Calendar3 size={16} />}
          iconTone="navy"
          value={
            todayLoading ? (
              <Spinner size="sm" />
            ) : todayRecord ? (
              <TimeRecordStatusBadge status={todayRecord.status} />
            ) : (
              '—'
            )
          }
          trend={
            todayRecord
              ? { label: t('dashboard:stats.active'), tone: 'up' }
              : { label: t('dashboard:stats.pending'), tone: 'neutral' }
          }
          hint={
            todayRecord?.clockIn
              ? t('dashboard:stats.clockedInAt', { time: formatInstant(todayRecord.clockIn) })
              : t('dashboard:stats.clockHint')
          }
        />
      </Col>,
    );
  }

  if (hasPermission('MY_TIME') || hasPermission('TIME_RECORDS_ADMIN')) {
    kpiCards.push(
      <Col key="incomplete" xs={12} md={4}>
        <StatCard
          label={t('dashboard:stats.incomplete')}
          icon={<ExclamationTriangle size={16} />}
          iconTone="warning"
          accent={incompleteCount > 0 ? 'warning' : 'success'}
          value={incompleteCount}
          trend={
            incompleteCount > 0
              ? { label: t('dashboard:stats.actionNeeded'), tone: 'down' }
              : { label: t('dashboard:stats.allClear'), tone: 'up' }
          }
        />
      </Col>,
    );
  }

  if (hasPermission('EMPLOYEE_CONFIG')) {
    kpiCards.push(
      <Col key="employees" xs={12} md={4}>
        <StatCard
          label={t('dashboard:stats.teamHours')}
          icon={<People size={16} />}
          iconTone="gold"
          accent="gold"
          value={employees.length}
          trend={{ label: t('dashboard:stats.employeesHint'), tone: 'neutral' }}
        />
      </Col>,
    );
  } else if (isPlatformAdmin) {
    kpiCards.push(
      <Col key="tenants" xs={12} md={4}>
        <StatCard
          label={t('dashboard:stats.activeTenants')}
          icon={<Building size={16} />}
          iconTone="gold"
          accent="gold"
          value={activeTenants}
          trend={{ label: t('dashboard:stats.tenantsHint', { total: tenants.length }), tone: 'neutral' }}
        />
      </Col>,
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div>
          <h1 className={styles.greeting}>
            {t(`dashboard:greeting.${greetingPeriod}`, { name: firstName })}
          </h1>
          {!isPlatformAdmin && tenant && (
            <p className={styles.companyLine}>{tenant.name}</p>
          )}
        </div>
        <time className={styles.dateLine} dateTime={today}>
          {formatDashboardDate(new Date(), i18n.language)}
        </time>
      </header>

      {kpiCards.length > 0 && <Row className="g-3 mb-4">{kpiCards.slice(0, 3)}</Row>}

      {hasPermission('MY_TIME') && <IncompleteTimeRecordsBanner />}

      <Row className="g-4">
        <Col lg={8}>
          {quickLinks.length > 0 && (
            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>{t('dashboard:quickActions')}</h2>
              <div className={styles.quickGrid}>
                {quickLinks.slice(0, 8).map((node) => (
                  <QuickActionLink key={node.code} node={node} />
                ))}
              </div>
            </section>
          )}

          {(hasPermission('TIME_RECORD_AUDIT') || hasPermission('TIME_RECORDS_ADMIN')) && (
            <section className={`${styles.panel} mt-4`}>
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>{t('dashboard:recentActivity')}</h2>
                {hasPermission('TIME_RECORD_AUDIT') && (
                  <Link to="/admin/time/audit" className={styles.panelLink}>
                    {t('dashboard:viewAll')}
                  </Link>
                )}
              </div>
              {auditLoading ? (
                <div className="text-center py-4"><Spinner size="sm" /></div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead>
                      <tr>
                        <th>{t('dashboard:activityCol')}</th>
                        <th>{t('dashboard:timeCol')}</th>
                        <th>{t('dashboard:actorCol')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentAudit.map((entry) => (
                        <tr key={entry.id}>
                          <td>{formatAuditAction(entry.action)}</td>
                          <td className="text-muted small">{formatInstant(entry.createdAt)}</td>
                          <td className="text-muted small">{entry.actorEmail ?? '—'}</td>
                        </tr>
                      ))}
                      {recentAudit.length === 0 && (
                        <tr>
                          <td colSpan={3} className="text-center text-muted py-4">
                            {t('dashboard:noActivity')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              )}
            </section>
          )}
        </Col>

        <Col lg={4}>
          <AnnouncementsPanel />

          {hasPermission('EMPLOYEE_CONFIG') && employees.length > 0 && (
            <section className={`${styles.panel} mt-4`}>
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>{t('dashboard:yourTeam')}</h2>
                <Link to="/admin/employees" className={styles.panelLink}>
                  {t('dashboard:viewAll')}
                </Link>
              </div>
              <ul className={styles.teamList}>
                {employees.slice(0, 5).map((employee) => (
                  <li key={employee.id} className={styles.teamMember}>
                    <span className={styles.teamAvatar}>
                      {teamInitials(employee.firstName, employee.lastName)}
                    </span>
                    <span className={styles.teamMeta}>
                      <span className={styles.teamName}>
                        {employee.firstName} {employee.lastName}
                      </span>
                      <span className={styles.teamEmail}>{employee.email}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {hasPermission('TIME_RECORDS_ADMIN') && !hasPermission('EMPLOYEE_CONFIG') && (
            <section className={`${styles.panel} mt-4`}>
              <h2 className={styles.panelTitle}>{t('dashboard:adminTips')}</h2>
              <p className={styles.tipText}>{t('dashboard:adminTipsBody')}</p>
              <Link to="/admin/time" className={styles.panelLink}>
                <ClockHistory size={14} className="me-1" />
                {t('dashboard:goToTimeAdmin')}
              </Link>
            </section>
          )}
        </Col>
      </Row>
    </div>
  );
}
