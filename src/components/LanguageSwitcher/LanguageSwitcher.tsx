import { Form } from 'react-bootstrap';
import { Globe } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import { type AppLocale, setStoredLocale, SUPPORTED_LOCALES } from '../../i18n/locale';
import styles from './LanguageSwitcher.module.css';

interface LanguageSwitcherProps {
  id?: string;
  size?: 'sm' | 'lg';
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
  size = 'sm',
  className,
  variant = 'light',
  appearance = 'default',
}: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation('common');
  const current = (SUPPORTED_LOCALES.includes(i18n.language as AppLocale)
    ? i18n.language
    : 'es-CO') as AppLocale;

  const labelKeys = appearance === 'compact' ? LOCALE_SHORT_KEYS : LOCALE_LABEL_KEYS;

  return (
    <div
      className={`${styles.wrap} ${appearance === 'compact' ? styles.compactWrap : ''} ${className ?? ''}`.trim()}
    >
      {appearance === 'compact' && <Globe size={14} className={styles.globe} aria-hidden />}
      <Form.Select
        id={id}
        size={size}
        className={`${variant === 'dark' ? styles.dark : styles.light} ${
          appearance === 'compact' ? styles.compact : ''
        }`.trim()}
        aria-label={t('labels.language')}
        value={current}
        onChange={(event) => {
          const next = event.target.value as AppLocale;
          void i18n.changeLanguage(next);
          setStoredLocale(next);
        }}
      >
        {SUPPORTED_LOCALES.map((locale) => (
          <option key={locale} value={locale}>
            {t(labelKeys[locale])}
          </option>
        ))}
      </Form.Select>
    </div>
  );
}
