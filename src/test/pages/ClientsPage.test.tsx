import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClientsPage } from '../../pages/operations/clients/ClientsPage';

const { mockFindAll, mockCreate } = vi.hoisted(() => ({
  mockFindAll: vi.fn().mockResolvedValue([
    {
      id: 1, name: 'Acme Corp', taxId: '123', contactName: 'John',
      contactEmail: 'john@acme.com', contactPhone: '555', internalNotes: null,
      status: 'ACTIVE', createdAt: '2026-01-01T00:00:00Z',
    },
  ]),
  mockCreate: vi.fn().mockResolvedValue({
    id: 2, name: 'New Corp', taxId: null, contactName: null,
    contactEmail: null, contactPhone: null, internalNotes: null,
    status: 'ACTIVE', createdAt: '2026-01-02T00:00:00Z',
  }),
}));

vi.mock('../../api/clients.service', () => ({
  clientsService: { findAll: mockFindAll, create: mockCreate, update: vi.fn() },
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

describe('ClientsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders clients table after data loads', async () => {
    render(<ClientsPage />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.queryByText('Acme Corp')).not.toBeNull());
    expect(screen.queryByText('123')).not.toBeNull();
  });

  it('opens create modal when new button is clicked', async () => {
    render(<ClientsPage />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.queryByText(/clients\.new/)).not.toBeNull());
    await userEvent.click(screen.getByText(/clients\.new/));
    expect(screen.queryByRole('dialog')).not.toBeNull();
  });

  it('save button is disabled when name field is empty', async () => {
    render(<ClientsPage />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.queryByText(/clients\.new/)).not.toBeNull());
    await userEvent.click(screen.getByText(/clients\.new/));
    const saveBtn = screen.getByRole('button', { name: 'Save' }) as HTMLButtonElement;
    expect(saveBtn.disabled).toBe(true);
  });
});
