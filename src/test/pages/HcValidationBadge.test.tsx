import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HcValidationBadge } from '../../components/operations/HcValidationBadge';

const { mockUpdateHc, mockHasPermission } = vi.hoisted(() => ({
  mockUpdateHc: vi.fn(),
  mockHasPermission: vi.fn().mockReturnValue(false),
}));

vi.mock('../../api/osiVehicleAssignments.service', () => ({
  osiVehicleAssignmentsService: { updateHcValidation: mockUpdateHc },
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ hasPermission: mockHasPermission }),
}));

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({ t: (key: string) => key }),
  };
});

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe('HcValidationBadge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHasPermission.mockReturnValue(false);
  });

  it('renders PENDIENTE badge without update button for non-HC_VALIDADOR', () => {
    render(
      <HcValidationBadge osiId={1} assignmentId={2} status="PENDIENTE" notes={null} />,
      { wrapper: createWrapper() },
    );
    expect(screen.getByText('hc.PENDIENTE')).toBeTruthy();
    expect(screen.queryByText('hc.update')).toBeNull();
  });

  it('shows update button for HC_VALIDADOR', () => {
    mockHasPermission.mockReturnValue(true);
    render(
      <HcValidationBadge osiId={1} assignmentId={2} status="PENDIENTE" notes={null} />,
      { wrapper: createWrapper() },
    );
    expect(screen.getByText('hc.update')).toBeTruthy();
  });

  it('hides update button when already VALIDADO', () => {
    mockHasPermission.mockReturnValue(true);
    render(
      <HcValidationBadge osiId={1} assignmentId={2} status="VALIDADO" notes={null} />,
      { wrapper: createWrapper() },
    );
    expect(screen.queryByText('hc.update')).toBeNull();
  });

  it('shows form and calls updateHcValidation on save', async () => {
    mockHasPermission.mockReturnValue(true);
    mockUpdateHc.mockResolvedValue({ hcValidationStatus: 'VALIDADO', hcValidatedAt: new Date().toISOString() });

    render(
      <HcValidationBadge osiId={1} assignmentId={2} status="RECHAZADO" notes="prev note" />,
      { wrapper: createWrapper() },
    );

    await userEvent.click(screen.getByText('hc.update'));
    expect(screen.getByText('hc.save')).toBeTruthy();

    await userEvent.click(screen.getByText('hc.save'));

    await waitFor(() => expect(mockUpdateHc).toHaveBeenCalledWith(
      1, 2, 'VALIDADO', expect.anything(),
    ));
  });
});
