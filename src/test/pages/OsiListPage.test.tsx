import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OsiListPage } from '../../pages/operations/osi/OsiListPage';

const { mockList, mockClients } = vi.hoisted(() => ({
  mockList: vi.fn().mockResolvedValue({
    content: [
      {
        id: 1, osiNumber: 'OSI-2-000001', clientId: 1, clientName: 'Acme',
        origin: 'Bogotá', destination: 'Medellín', status: 'ACTIVE',
        createdAt: '2026-01-01T00:00:00Z', vehicleCount: 2,
      },
    ],
    totalElements: 1, totalPages: 1, number: 0, size: 20,
  }),
  mockClients: vi.fn().mockResolvedValue([
    {
      id: 1, name: 'Acme', taxId: null, contactName: null,
      contactEmail: null, contactPhone: null, internalNotes: null,
      status: 'ACTIVE', createdAt: '2026-01-01T00:00:00Z',
    },
  ]),
}));

vi.mock('../../api/osi.service', () => ({
  osiService: { list: mockList, create: vi.fn() },
}));

vi.mock('../../api/clients.service', () => ({
  clientsService: { findAll: mockClients },
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
    <QueryClientProvider client={qc}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('OsiListPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders OSI list with osi number and client name', async () => {
    render(<OsiListPage />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.queryByText('OSI-2-000001')).not.toBeNull());
    expect(screen.queryByText('Acme')).not.toBeNull();
  });

  it('opens create modal when new button is clicked', async () => {
    render(<OsiListPage />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.queryByText(/osi\.new/)).not.toBeNull());
    await userEvent.click(screen.getByText(/osi\.new/));
    expect(screen.queryByRole('dialog')).not.toBeNull();
  });

  it('create button is disabled when client is not selected', async () => {
    render(<OsiListPage />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.queryByText(/osi\.new/)).not.toBeNull());
    await userEvent.click(screen.getByText(/osi\.new/));
    const createBtn = screen.getByRole('button', { name: 'Create' }) as HTMLButtonElement;
    expect(createBtn.disabled).toBe(true);
  });
});
