import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminTimeRecordsPage } from '../../pages/time/AdminTimeRecordsPage';

// ── hoisted mocks ──────────────────────────────────────────────────────────

const {
  mockFindAll,
  mockGetByEmployee,
  mockGetIncomplete,
  mockGetCappedReport,
  mockGetUncapped,
  mockGetPending,
  mockDismiss,
} = vi.hoisted(() => ({
  mockFindAll: vi.fn().mockResolvedValue([]),
  mockGetByEmployee: vi.fn().mockResolvedValue([]),
  mockGetIncomplete: vi.fn().mockResolvedValue([]),
  mockGetCappedReport: vi.fn().mockResolvedValue({ records: [], totalCappedEarnings: 0, totalUncappedEarnings: 0, capped: true, employeeId: 1, employeeName: '' }),
  mockGetUncapped: vi.fn().mockResolvedValue({ records: [], totalCappedEarnings: 0, totalUncappedEarnings: 0, capped: false, employeeId: 1, employeeName: '' }),
  mockGetPending: vi.fn().mockResolvedValue([]),
  mockDismiss: vi.fn().mockResolvedValue({ id: 1, status: 'DISMISSED' }),
}));

vi.mock('../../api/employees.service', () => ({
  employeesService: { findAll: mockFindAll },
}));

vi.mock('../../api/time.service', () => ({
  timeService: {
    getByEmployee: mockGetByEmployee,
    getIncomplete: mockGetIncomplete,
    reopen: vi.fn().mockResolvedValue({}),
    resolveIncomplete: vi.fn().mockResolvedValue({}),
    correct: vi.fn().mockResolvedValue({}),
    createRecord: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('../../api/reports.service', () => ({
  reportsService: { getCappedReport: mockGetCappedReport, getUncappedReport: mockGetUncapped },
}));

vi.mock('../../api/correctionRequests.service', () => ({
  correctionRequestsService: {
    getPending: mockGetPending,
    dismiss: mockDismiss,
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
      firstName: 'Admin',
      lastName: 'Test',
      email: 'admin@test.com',
      roleName: 'ADMIN',
      enabled: true,
      mustChangePassword: false,
    },
    hasPermission: () => true,
  }),
}));

// ── helpers ────────────────────────────────────────────────────────────────

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

const pendingRequest = {
  id: 1,
  timeRecordId: 10,
  employeeId: 1,
  employeeName: 'Ana Lopez',
  recordDate: '2025-06-01',
  note: 'Clock-out was wrong',
  status: 'PENDING' as const,
  resolutionNote: null,
  createdAt: new Date().toISOString(),
  resolvedAt: null,
};

// ── tests ──────────────────────────────────────────────────────────────────

describe('AdminTimeRecordsPage – correction requests tab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetPending.mockResolvedValue([]);
    mockFindAll.mockResolvedValue([]);
    mockGetByEmployee.mockResolvedValue([]);
    mockGetIncomplete.mockResolvedValue([]);
  });

  it('8.2a – renders the correction requests tab', async () => {
    render(<AdminTimeRecordsPage />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(screen.queryByText('time:admin.tabs.correctionRequests')).not.toBeNull(),
    );
  });

  it('8.2b – shows count badge when there are pending requests', async () => {
    mockGetPending.mockResolvedValue([pendingRequest]);
    render(<AdminTimeRecordsPage />, { wrapper: createWrapper() });

    await waitFor(() => expect(screen.queryByText('1')).not.toBeNull());
  });

  it('8.2c – clicking the tab shows the pending requests table with dismiss button', async () => {
    mockGetPending.mockResolvedValue([pendingRequest]);
    const user = userEvent.setup();
    render(<AdminTimeRecordsPage />, { wrapper: createWrapper() });

    const tab = await screen.findByText('time:admin.tabs.correctionRequests');
    await user.click(tab);

    await screen.findByText('Ana Lopez');
    expect(screen.queryByText('time:admin.correctionRequests.dismiss')).not.toBeNull();
  });

  it('8.2d – clicking dismiss opens the dismiss modal', async () => {
    mockGetPending.mockResolvedValue([pendingRequest]);
    const user = userEvent.setup();
    render(<AdminTimeRecordsPage />, { wrapper: createWrapper() });

    const tab = await screen.findByText('time:admin.tabs.correctionRequests');
    await user.click(tab);

    const dismissBtn = await screen.findByText('time:admin.correctionRequests.dismiss');
    await user.click(dismissBtn);

    await screen.findByText('time:admin.correctionRequests.dismissModal.title');
  });
});
