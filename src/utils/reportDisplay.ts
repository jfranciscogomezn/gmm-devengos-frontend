import type { HighlightLevel } from '../api/reports.service';

export function highlightRowClass(level: HighlightLevel): string {
  if (level === 'WARNING') {
    return 'table-warning';
  }
  if (level === 'ALERT') {
    return 'table-danger';
  }
  return '';
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}
