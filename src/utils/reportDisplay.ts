import i18n from '../i18n';
import { type AppLocale } from '../i18n/locale';
import type { HighlightLevel } from '../api/reports.service';

function activeIntlLocale(): AppLocale {
  return (i18n.language ?? 'es-CO') as AppLocale;
}

export function formatMoney(value: number): string {
  const locale = activeIntlLocale();
  const currency = locale === 'es-CO' ? 'COP' : 'USD';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function highlightRowClass(level: HighlightLevel | undefined): string {
  if (level === 'WARNING') return 'table-warning';
  if (level === 'ALERT') return 'table-danger';
  return '';
}
