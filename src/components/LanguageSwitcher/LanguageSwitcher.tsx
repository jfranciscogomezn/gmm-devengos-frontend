import { Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { type AppLocale, setStoredLocale, SUPPORTED_LOCALES } from '../../i18n/locale';

interface LanguageSwitcherProps {
  id?: string;
  size?: 'sm' | 'lg';
  className?: string;
}

const LOCALE_LABEL_KEYS: Record<AppLocale, string> = {
  'es-CO': 'language.esCO',
  'en-US': 'language.enUS',
};

export function LanguageSwitcher({ id = 'app-language', size = 'sm', className }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation('common');
  const current = (SUPPORTED_LOCALES.includes(i18n.language as AppLocale)
    ? i18n.language
    : 'es-CO') as AppLocale;

  return (
    <Form.Select
      id={id}
      size={size}
      className={className}
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
          {t(LOCALE_LABEL_KEYS[locale])}
        </option>
      ))}
    </Form.Select>
  );
}
