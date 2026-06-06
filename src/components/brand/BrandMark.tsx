import styles from './BrandMark.module.css';

interface BrandMarkProps {
  variant?: 'light' | 'dark';
  showSubtitle?: boolean;
  subtitle?: string;
}

export function BrandMark({ variant = 'dark', showSubtitle = false, subtitle }: BrandMarkProps) {
  return (
    <div className={`${styles.mark} ${styles[variant]}`}>
      <div className={styles.icon} aria-hidden>
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="8" fill="url(#sc-gold)" />
          <path
            d="M9 22V10h3.2l3.4 7.2L19 10h3v12h-2.6v-7.1L16.2 22h-2.1l-3.2-7.1V22H9z"
            fill="#0f172a"
          />
          <defs>
            <linearGradient id="sc-gold" x1="4" y1="4" x2="28" y2="28">
              <stop stopColor="#e8d48a" />
              <stop offset="1" stopColor="#c9a227" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className={styles.text}>
        <span className={styles.name}>
          Step<span className={styles.accent}>Core</span>
        </span>
        {showSubtitle && subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </div>
    </div>
  );
}
