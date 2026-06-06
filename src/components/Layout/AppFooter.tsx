import { useTranslation } from 'react-i18next';
import { APP_VERSION } from '../../config/appMeta';
import styles from './AppFooter.module.css';

export function AppFooter() {
  const { t } = useTranslation('common');
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.left}>
        <span className={styles.copyright}>
          {t('footer.copyright', { year })}
        </span>
        <span className={styles.separator}>·</span>
        <a href="#terms" className={styles.link} onClick={(event) => event.preventDefault()}>
          {t('footer.terms')}
        </a>
        <span className={styles.separator}>·</span>
        <a href="#privacy" className={styles.link} onClick={(event) => event.preventDefault()}>
          {t('footer.privacy')}
        </a>
      </div>
      <div className={styles.right}>
        <span className={styles.madeIn}>{t('footer.madeIn')}</span>
        <span className={styles.separator}>·</span>
        <span className={styles.version}>{t('footer.version', { version: APP_VERSION })}</span>
      </div>
    </footer>
  );
}
