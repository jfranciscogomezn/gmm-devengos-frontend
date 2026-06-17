import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VehiclesPage } from '../../pages/operations/vehicles/VehiclesPage';

const { mockFindAll } = vi.hoisted(() => ({
  mockFindAll: vi.fn().mockResolvedValue([
    {
      id: 1, plate: 'ABC123', type: 'CAMION', brand: 'Kenworth', model: 'T680',
      year: 2020, status: 'ACTIVE', internalNotes: null, createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 2, plate: 'XYZ999', type: 'VAN', brand: null, model: null,
      year: null, status: 'RETIRED', internalNotes: null, createdAt: '2026-01-02T00:00:00Z',
    },
  ]),
}));

vi.mock('../../api/vehicles.service', () => ({
  vehiclesService: { findAll: mockFindAll, create: vi.fn(), update: vi.fn() },
}));

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en-US' } }),
  };
});

vi.mock('../../components/ui/PageHeader', () => ({
  PageHeader: ({ title, actions }: { title: string; actions: React.ReactNode }) => (
    <div><h1>{title}</h1>{actions}</div>
  ),
}));

vi.mock('../../components/ApiErrorAlert/ApiErrorAlert', () => ({
  ApiErrorAlert: () => <div>error</div>,
}));

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe('VehiclesPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders vehicles table with both rows', async () => {
    render(<VehiclesPage />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.queryByText('ABC123')).not.toBeNull());
    expect(screen.queryByText('XYZ999')).not.toBeNull();
  });

  it('plate input normalises to uppercase and removes spaces', async () => {
    render(<VehiclesPage />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.queryByText(/vehicles\.new/)).not.toBeNull());
    await userEvent.click(screen.getByText(/vehicles\.new/));
    // First textbox in the modal is the plate field
    const plateInput = screen.getAllByRole('textbox')[0] as HTMLInputElement;
    await userEvent.type(plateInput, 'abc 123');
    expect(plateInput.value).toBe('ABC123');
  });

  it('save button is disabled when plate is empty', async () => {
    render(<VehiclesPage />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.queryByText(/vehicles\.new/)).not.toBeNull());
    await userEvent.click(screen.getByText(/vehicles\.new/));
    const saveBtn = screen.getByRole('button', { name: 'Save' }) as HTMLButtonElement;
    expect(saveBtn.disabled).toBe(true);
  });
});
