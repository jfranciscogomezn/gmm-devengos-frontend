import { describe, expect, it } from 'vitest';
import {
  formatAuditAction,
  formatAuditSnapshotSummary,
  parseAuditSnapshot,
  resolveAuditEmployeeId,
} from '../../utils/auditDisplay';

describe('auditDisplay', () => {
  it('parses audit snapshot JSON', () => {
    const snapshot = parseAuditSnapshot(
      '{"employeeId":3,"workDate":"2026-05-20","clockIn":"2026-05-20T13:00:00Z","clockOut":"2026-05-20T22:00:00Z"}'
    );

    expect(snapshot?.employeeId).toBe(3);
    expect(snapshot?.workDate).toBe('2026-05-20');
  });

  it('formats known audit actions', () => {
    expect(formatAuditAction('TIME_RECORD_CREATE')).toBe('Registro creado');
    expect(formatAuditAction('TIME_RECORD_UNKNOWN')).toBe('time record unknown');
  });

  it('summarizes snapshot clock values', () => {
    const summary = formatAuditSnapshotSummary({
      workDate: '2026-05-20',
      clockIn: '2026-05-20T13:00:00Z',
      clockOut: '2026-05-20T22:00:00Z',
    });

    expect(summary).toContain('Entrada');
    expect(summary).toContain('Salida');
  });

  it('resolves employee id from new or old snapshot', () => {
    expect(
      resolveAuditEmployeeId({
        oldValue: null,
        newValue: '{"employeeId":9,"workDate":"2026-05-20"}',
      })
    ).toBe(9);

    expect(
      resolveAuditEmployeeId({
        oldValue: '{"employeeId":4,"workDate":"2026-05-19"}',
        newValue: '{"employeeId":4,"workDate":"2026-05-19","clockOut":"2026-05-19T22:00:00Z"}',
      })
    ).toBe(4);
  });
});
