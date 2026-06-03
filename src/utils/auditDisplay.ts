import i18n from '../i18n';
import { formatInstant, formatWorkDate } from './timeFormat';

export interface AuditSnapshot {
  employeeId?: number | null;
  workDate?: string | null;
  clockIn?: string | null;
  clockOut?: string | null;
}

export function parseAuditSnapshot(json: string | null | undefined): AuditSnapshot | null {
  if (!json) {
    return null;
  }
  try {
    return JSON.parse(json) as AuditSnapshot;
  } catch {
    return null;
  }
}

export function formatAuditAction(action: string): string {
  const key = `time:audit.actions.${action}`;
  if (i18n.exists(key)) {
    return i18n.t(key);
  }
  return action.replace(/_/g, ' ').toLowerCase();
}

export function formatAuditSnapshotSummary(snapshot: AuditSnapshot | null): string {
  if (!snapshot) {
    return '—';
  }

  const parts: string[] = [];
  if (snapshot.workDate) {
    parts.push(formatWorkDate(snapshot.workDate));
  }
  if (snapshot.clockIn) {
    parts.push(i18n.t('time:audit.snapshot.in', { value: formatInstant(snapshot.clockIn) }));
  }
  if (snapshot.clockOut) {
    parts.push(i18n.t('time:audit.snapshot.out', { value: formatInstant(snapshot.clockOut) }));
  }

  return parts.length > 0 ? parts.join(' · ') : '—';
}

export function resolveAuditEmployeeId(entry: {
  oldValue: string | null;
  newValue: string | null;
}): number | null {
  const fromNew = parseAuditSnapshot(entry.newValue)?.employeeId;
  if (fromNew != null) {
    return fromNew;
  }
  const fromOld = parseAuditSnapshot(entry.oldValue)?.employeeId;
  return fromOld ?? null;
}
