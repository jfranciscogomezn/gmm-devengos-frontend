import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OsiNotificationsBanner } from '../../components/operations/OsiNotificationsBanner';
import type { OsiNotificationItem } from '../../types';

const { mockListRecent, mockHasPermission } = vi.hoisted(() => ({
  mockListRecent: vi.fn(),
  mockHasPermission: vi.fn().mockReturnValue(true),
}));

vi.mock('../../api/operationsNotifications.service', () => ({
  operationsNotificationsService: { listRecent: mockListRecent },
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ hasPermission: mockHasPermission }),
}));

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return { ...actual, useTranslation: () => ({ t: (key: string) => key }) };
});

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

const sampleNotifications: OsiNotificationItem[] = [
  {
    id: 1,
    notificationType: 'OSI_APPROVAL_PENDING',
    title: 'Evento pendiente — OSI-2026-000001',
    message: 'Requiere aprobación',
    osiId: 42,
    osiNumber: 'OSI-2026-000001',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    notificationType: 'OSI_HC_REJECTED',
    title: 'HC rechazada — OSI-2026-000002',
    message: 'Documentación rechazada',
    osiId: 99,
    osiNumber: 'OSI-2026-000002',
    createdAt: new Date().toISOString(),
  },
];

describe('OsiNotificationsBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHasPermission.mockReturnValue(true);
  });

  it('renders nothing when user lacks OPS_OSI', async () => {
    mockHasPermission.mockReturnValue(false);
    mockListRecent.mockResolvedValue([]);

    const { container } = render(<OsiNotificationsBanner />, { wrapper: createWrapper() });
    expect(container.firstChild).toBeNull();
  });

  it('renders notifications with links to OSI detail', async () => {
    mockListRecent.mockResolvedValue(sampleNotifications);

    render(<OsiNotificationsBanner />, { wrapper: createWrapper() });

    await screen.findByText('Evento pendiente — OSI-2026-000001');
    expect(screen.getByText('HC rechazada — OSI-2026-000002')).toBeTruthy();

    const links = screen.getAllByText('notifications.viewOsi →');
    expect(links).toHaveLength(2);
    expect(links[0].closest('a')?.getAttribute('href')).toBe('/operations/osi/42');
  });

  it('renders nothing when list is empty', async () => {
    mockListRecent.mockResolvedValue([]);

    render(<OsiNotificationsBanner />, { wrapper: createWrapper() });
    await new Promise(r => setTimeout(r, 100));

    expect(screen.queryByText('notifications.viewOsi →')).toBeNull();
  });
});
