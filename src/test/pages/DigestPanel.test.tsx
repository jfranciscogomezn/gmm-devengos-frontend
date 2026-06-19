import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DigestPanel } from '../../components/operations/DigestPanel';

const PROPOSED = 'Seguimiento OSI #OSI-2026-000001\nCliente: Acme S.A.\n';

const { mockGetDigest } = vi.hoisted(() => {
  const text = 'Seguimiento OSI #OSI-2026-000001\nCliente: Acme S.A.\n';
  return { mockGetDigest: vi.fn().mockResolvedValue(text) };
});

vi.mock('../../api/digest.service', () => ({
  digestService: { getDigest: mockGetDigest },
}));

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'es-CO' } }),
  };
});

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe('DigestPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it('renders proposed text in textarea after fetch', async () => {
    render(<DigestPanel osiId={1} />, { wrapper: createWrapper() });
    await waitFor(() =>
      expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe(PROPOSED),
    );
  });

  it('copies textarea content to clipboard when copy button is clicked', async () => {
    render(<DigestPanel osiId={1} />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByRole('textbox')).toBeDefined());

    await userEvent.click(screen.getByText('digest.copy'));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(PROPOSED);
  });

  it('shows copied feedback after clipboard write', async () => {
    render(<DigestPanel osiId={1} />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByRole('textbox')).toBeDefined());

    await userEvent.click(screen.getByText('digest.copy'));

    await waitFor(() => expect(screen.queryByText('digest.copied')).not.toBeNull());
  });

  it('user edits are reflected in the textarea', async () => {
    render(<DigestPanel osiId={1} />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByRole('textbox')).toBeDefined());

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    await userEvent.clear(textarea);
    await userEvent.type(textarea, 'Custom text');

    expect(textarea.value).toBe('Custom text');
  });
});
