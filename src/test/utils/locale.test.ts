import { beforeEach, describe, expect, it } from 'vitest';
import i18n from '../../i18n';
import { menuLabel } from '../../i18n/menuLabel';
import {
  DEFAULT_LOCALE,
  getStoredLocale,
  LOCALE_STORAGE_KEY,
  setStoredLocale,
  SUPPORTED_LOCALES,
} from '../../i18n/locale';

describe('locale', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to es-CO when nothing is stored', () => {
    expect(getStoredLocale()).toBe(DEFAULT_LOCALE);
    expect(DEFAULT_LOCALE).toBe('es-CO');
  });

  it('persists supported locales in localStorage', () => {
    setStoredLocale('en-US');
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('en-US');
    expect(getStoredLocale()).toBe('en-US');
  });

  it('ignores invalid stored values', () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'fr-FR');
    expect(getStoredLocale()).toBe('es-CO');
  });

  it('only allows supported locales', () => {
    expect(SUPPORTED_LOCALES).toEqual(['es-CO', 'en-US']);
  });
});

describe('menuLabel', () => {
  it('returns translated label when menu code exists', () => {
    const label = menuLabel(i18n.t.bind(i18n), 'MY_TIME', 'My Time');
    expect(label).toBe(i18n.t('menu:MY_TIME'));
  });

  it('falls back to API label when code is missing', () => {
    const label = menuLabel(i18n.t.bind(i18n), 'UNKNOWN_CODE_XYZ', 'Custom fallback');
    expect(label).toBe('Custom fallback');
  });
});
