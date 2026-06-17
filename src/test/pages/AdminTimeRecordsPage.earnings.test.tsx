import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminTimeRecordsPage } from '../../pages/time/AdminTimeRecordsPage';

// --------------------------------------------------------------------------
// Hoisted mock fns – must be defined before vi.mock factory calls
// --------------------------------------------------------------------------
const {
  mockCappedReport,
  mockUncappedReport,
  mockGetByEmployee,
  mockGetIncomplete,
  mockFindAll,
} = vi.hoisted(() => {
  const cappedResponse = {
    employeeId: 1,
    employeeName: 'Ana Lopez',
    capped: true,
    records: [],
    totalUncappedEarnings: 0,
    totalCappedEarnings: 0,
  };
  return {
    mockCappedReport: vi.fn().mockResolvedValue(cappedResponse),
    mockUncappedReport: vi.fn().mockResolvedValue({ ...cappedResponse, capped: false }),
    mockGetByEmployee: vi.fn().mockResolvedValue([]),
    mockGetIncomplete: vi.fn().mockResolvedValue([]),
    mockFindAll: vi.fn().mockResolvedValue([
      {
        id: 1,
        firstName: 'Ana',
        lastName: 'Lopez',
        email: 'ana@test.com',
        idType: 'CC',
        idNumber: '123',
        monthlySalary: 1_000_000,
        phone: null,
        userId: null,
      },
    ]),
  };
});

// --------------------------------------------------------------------------
// Module mocks
// --------------------------------------------------------------------------
vi.mock('../../api/reports.service', () => ({
  reportsService: { getCappedReport: mockCappedReport, getUncappedReport: mockUncappedReport },
}));

vi.mock('../../api/employees.service', () => ({
  employeesService: { findAll: mockFindAll },
}));

vi.mock('../../api/time.service', () => ({
  timeService: {
    getByEmployee: mockGetByEmployee,
    getIncomplete: mockGetIncomplete,
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
  }),
}));

// --------------------------------------------------------------------------
// Test helpers
// --------------------------------------------------------------------------
const cappedResponse = {
  employeeId: 1,
  employeeName: 'Ana Lopez',
  capped: true,
  records: [],
  totalUncappedEarnings: 0,
  totalCappedEarnings: 0,
};

const testEmployee = {
  id: 1,
  firstName: 'Ana',
  lastName: 'Lopez',
  email: 'ana@test.com',
  idType: 'CC',
  idNumber: '123',
  monthlySalary: 1_000_000,
  phone: null,
  userId: null,
};

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

// --------------------------------------------------------------------------
// Tests
// --------------------------------------------------------------------------
describe('AdminTimeRecordsPage – earnings view', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCappedReport.mockResolvedValue(cappedResponse);
    mockUncappedReport.mockResolvedValue({ ...cappedResponse, capped: false });
    mockFindAll.mockResolvedValue([testEmployee]);
    mockGetByEmployee.mockResolvedValue([]);
    mockGetIncomplete.mockResolvedValue([]);
  });

  it('A2.1 – enabling showEarnings fires getCappedReport and renders TimeReportTable; disabling reverts to plain table', async () => {
    const user = userEvent.setup();
    render(<AdminTimeRecordsPage />, { wrapper: createWrapper() });

    // Wait for employees to load, then select Ana Lopez
    const employeeSelect = await screen.findByLabelText('common:labels.employee');
    await user.selectOptions(employeeSelect, '1');

    // Switch appears and becomes enabled once an employee is selected
    const showEarningsSwitch = await screen.findByLabelText('time:admin.showEarnings');
    await waitFor(() =>
      expect((showEarningsSwitch as HTMLInputElement).disabled).toBe(false),
    );

    // ── Toggle ON ──
    await user.click(showEarningsSwitch);

    // Earnings query fires (capped by default)
    await waitFor(() => expect(mockCappedReport).toHaveBeenCalledOnce());

    // TimeReportTable renders: 'reports:table.normalMin' column is exclusive to it
    await screen.findByText('reports:table.normalMin');

    // ── Toggle OFF ──
    await user.click(showEarningsSwitch);

    // TimeReportTable is gone; 'reports:table.normalMin' no longer in the DOM
    await waitFor(() =>
      expect(screen.queryByText('reports:table.normalMin')).toBeNull(),
    );
  });

  it('A2.2 – uncapped toggle calls getUncappedReport; getCappedReport stays at exactly one call', async () => {
    const user = userEvent.setup();
    render(<AdminTimeRecordsPage />, { wrapper: createWrapper() });

    const employeeSelect = await screen.findByLabelText('common:labels.employee');
    await user.selectOptions(employeeSelect, '1');

    // Enable Show earnings → getCappedReport fires
    const showEarningsSwitch = await screen.findByLabelText('time:admin.showEarnings');
    await user.click(showEarningsSwitch);
    await waitFor(() => expect(mockCappedReport).toHaveBeenCalledOnce());

    // Enable Uncapped view → query key changes to getUncappedReport
    const uncappedSwitch = await screen.findByLabelText('time:admin.uncappedView');
    await user.click(uncappedSwitch);

    await waitFor(() => expect(mockUncappedReport).toHaveBeenCalledOnce());
    // getCappedReport was not called again after the switch
    expect(mockCappedReport).toHaveBeenCalledOnce();
  });
});
