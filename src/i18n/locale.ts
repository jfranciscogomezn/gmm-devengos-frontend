export const LOCALE_STORAGE_KEY = 'stepcore_locale';

export type AppLocale = 'es-CO' | 'en-US';

export const DEFAULT_LOCALE: AppLocale = 'es-CO';

export const SUPPORTED_LOCALES: AppLocale[] = ['es-CO', 'en-US'];

export function getStoredLocale(): AppLocale {
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored === 'es-CO' || stored === 'en-US') {
    return stored;
  }
  return DEFAULT_LOCALE;
}

export function setStoredLocale(locale: AppLocale): void {
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
}

export function localeToIntl(locale: AppLocale): string {
  return locale;
}

export function localeToAcceptLanguage(locale: AppLocale): string {
  return locale;
}
