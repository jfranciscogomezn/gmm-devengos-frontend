import { useTranslation } from 'react-i18next';
import { APP_COPYRIGHT, APP_VERSION } from '../../config/appMeta';
import styles from './AppFooter.module.css';

export function AppFooter() {
  const { t } = useTranslation('common');

  return (
    <footer className={styles.footer}>
      <span className={styles.version}>{t('footer.version', { version: APP_VERSION })}</span>
      <span className={styles.separator}>·</span>
      <span className={styles.copyright}>{APP_COPYRIGHT}</span>
    </footer>
  );
}
