import type { TFunction } from 'i18next';

export function menuLabel(t: TFunction, code: string, fallbackLabel: string): string {
  return t(`menu:${code}`, { defaultValue: fallbackLabel });
}
