import { formatInstant, formatWorkDate } from './timeFormat';

export interface AuditSnapshot {
  employeeId?: number | null;
  workDate?: string | null;
  clockIn?: string | null;
  clockOut?: string | null;
}

const AUDIT_ACTION_LABELS: Record<string, string> = {
  TIME_RECORD_REOPEN: 'Reopened',
  TIME_RECORD_RESOLVE_INCOMPLETE: 'Resolved incomplete',
  TIME_RECORD_CORRECT: 'Corrected timestamps',
  TIME_RECORD_CREATE: 'Created record',
};

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
  return AUDIT_ACTION_LABELS[action] ?? action.replace(/_/g, ' ').toLowerCase();
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
    parts.push(`In ${formatInstant(snapshot.clockIn)}`);
  }
  if (snapshot.clockOut) {
    parts.push(`Out ${formatInstant(snapshot.clockOut)}`);
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
