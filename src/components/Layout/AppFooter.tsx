import { APP_COPYRIGHT, APP_VERSION } from '../../config/appMeta';
import styles from './AppFooter.module.css';

export function AppFooter() {
  return (
    <footer className={styles.footer}>
      <span className={styles.version}>Version {APP_VERSION}</span>
      <span className={styles.separator}>·</span>
      <span className={styles.copyright}>{APP_COPYRIGHT}</span>
    </footer>
  );
}
