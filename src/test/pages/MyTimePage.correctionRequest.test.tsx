import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MyTimePage } from '../../pages/time/MyTimePage';

// ── hoisted mocks ──────────────────────────────────────────────────────────

const {
  mockGetMine,
  mockClockIn,
  mockClockOut,
  mockGetCappedReport,
  mockListMineRequests,
  mockCreate,
} = vi.hoisted(() => ({
  mockGetMine: vi.fn().mockResolvedValue([]),
  mockClockIn: vi.fn().mockResolvedValue({ id: 99, status: 'OPEN', workDate: '2026-06-17', clockIn: new Date().toISOString(), clockOut: null, employeeId: 1, corrected: false }),
  mockClockOut: vi.fn().mockResolvedValue({}),
  mockGetCappedReport: vi.fn().mockResolvedValue({ records: [], totalCappedEarnings: 0, totalUncappedEarnings: 0, capped: true, employeeId: 1, employeeName: 'Me' }),
  mockListMineRequests: vi.fn().mockResolvedValue([]),
  mockCreate: vi.fn().mockResolvedValue({ id: 1, timeRecordId: 10, status: 'PENDING' }),
}));

vi.mock('../../api/time.service', () => ({
  timeService: {
    getMine: mockGetMine,
    clockIn: mockClockIn,
    clockOut: mockClockOut,
  },
}));

vi.mock('../../api/reports.service', () => ({
  reportsService: { getCappedReport: mockGetCappedReport },
}));

vi.mock('../../api/correctionRequests.service', () => ({
  correctionRequestsService: {
    listMine: mockListMineRequests,
    create: mockCreate,
  },
}));

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en-US' } }),
    Trans: ({ i18nKey }: { i18nKey: string }) => i18nKey,
  };
});

vi.mock('react-router-dom', () => ({
  Link: ({ children, to }: { children: unknown; to: string }) =>
    (<a href={to}>{children as React.ReactNode}</a>),
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    currentUser: {
      id: 1,
      firstName: 'Ana',
      lastName: 'Employee',
      email: 'ana@test.com',
      roleName: 'EMPLOYEE',
      enabled: true,
      mustChangePassword: false,
    },
    hasPermission: () => false,
  }),
}));

// ── helpers ────────────────────────────────────────────────────────────────

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

const closedRecord = {
  id: 10,
  employeeId: 1,
  workDate: '2025-06-01',
  clockIn: '2025-06-01T08:00:00Z',
  clockOut: '2025-06-01T17:00:00Z',
  status: 'CLOSED',
  corrected: false,
};

// ── tests ──────────────────────────────────────────────────────────────────

describe('MyTimePage – correction request', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetMine.mockResolvedValue([closedRecord]);
    mockListMineRequests.mockResolvedValue([]);
    mockGetCappedReport.mockResolvedValue({
      records: [],
      totalCappedEarnings: 0,
      totalUncappedEarnings: 0,
      capped: true,
      employeeId: 1,
      employeeName: 'Ana Employee',
    });
  });

  it('8.1a – shows "Request correction" button on CLOSED records', async () => {
    render(<MyTimePage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(screen.queryByText('time:myTime.requestCorrection')).not.toBeNull(),
    );
  });

  it('8.1b – shows "Correction pending" badge when record has a pending request', async () => {
    mockListMineRequests.mockResolvedValue([
      { id: 1, timeRecordId: 10, status: 'PENDING', note: 'Fix it', employeeId: 1, employeeName: 'Ana', recordDate: '2025-06-01', createdAt: new Date().toISOString(), resolvedAt: null, resolutionNote: null },
    ]);

    render(<MyTimePage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(screen.queryByText('time:myTime.correctionPending')).not.toBeNull(),
    );
    expect(screen.queryByText('time:myTime.requestCorrection')).toBeNull();
  });

  it('8.1c – clicking the button opens the correction request modal', async () => {
    const user = userEvent.setup();
    render(<MyTimePage />, { wrapper: createWrapper() });

    const btn = await screen.findByText('time:myTime.requestCorrection');
    await user.click(btn);

    // t('myTime.correctionRequestModal.title', ...) => key without namespace prefix
    await screen.findByText('myTime.correctionRequestModal.title');
  });
});
