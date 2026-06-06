import { Globe } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import { type AppLocale, setStoredLocale, SUPPORTED_LOCALES } from '../../i18n/locale';
import styles from './LanguageSwitcher.module.css';

interface LanguageSwitcherProps {
  id?: string;
  className?: string;
  variant?: 'light' | 'dark';
  appearance?: 'default' | 'compact';
}

const LOCALE_LABEL_KEYS: Record<AppLocale, string> = {
  'es-CO': 'language.esCO',
  'en-US': 'language.enUS',
};

const LOCALE_SHORT_KEYS: Record<AppLocale, string> = {
  'es-CO': 'language.esCOShort',
  'en-US': 'language.enUSShort',
};

export function LanguageSwitcher({
  id = 'app-language',
  className,
  variant = 'light',
  appearance = 'default',
}: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation('common');
  const current = (SUPPORTED_LOCALES.includes(i18n.language as AppLocale)
    ? i18n.language
    : 'es-CO') as AppLocale;

  const changeLocale = (locale: AppLocale) => {
    void i18n.changeLanguage(locale);
    setStoredLocale(locale);
  };

  if (appearance === 'compact') {
    return (
      <div
        id={id}
        className={`${styles.compactToggle} ${variant === 'dark' ? styles.compactDark : ''} ${className ?? ''}`.trim()}
        role="group"
        aria-label={t('labels.language')}
      >
        <Globe size={15} className={styles.globe} aria-hidden />
        <div className={styles.segmented}>
          {SUPPORTED_LOCALES.map((locale) => (
            <button
              key={locale}
              type="button"
              className={`${styles.segment} ${current === locale ? styles.segmentActive : ''}`}
              aria-pressed={current === locale}
              onClick={() => changeLocale(locale)}
            >
              {t(LOCALE_SHORT_KEYS[locale])}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.wrap} ${className ?? ''}`.trim()}>
      <select
        id={id}
        className={`${styles.select} ${variant === 'dark' ? styles.dark : styles.lightSelect}`}
        aria-label={t('labels.language')}
        value={current}
        onChange={(event) => changeLocale(event.target.value as AppLocale)}
      >
        {SUPPORTED_LOCALES.map((locale) => (
          <option key={locale} value={locale}>
            {t(LOCALE_LABEL_KEYS[locale])}
          </option>
        ))}
      </select>
    </div>
  );
}
