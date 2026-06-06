import { useId } from 'react';
import styles from './BrandMark.module.css';

interface BrandMarkProps {
  variant?: 'light' | 'dark';
  layout?: 'inline' | 'hero';
  size?: 'sidebar' | 'default' | 'hero';
  showSubtitle?: boolean;
  subtitle?: string;
}

function HexLogo({ size, gradientId }: { size: 'sidebar' | 'default' | 'hero'; gradientId: string }) {
  if (size === 'sidebar') {
    return (
      <div className={styles.hexSidebar} aria-hidden>
        <span className={styles.hexLetter}>S</span>
      </div>
    );
  }

  const dimension = size === 'hero' ? styles.hexHero : styles.hexDefault;

  return (
    <svg
      viewBox="0 0 88 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={dimension}
      aria-hidden
    >
      <path d="M44 4L82 26v44L44 92 6 70V26L44 4z" fill={`url(#${gradientId})`} />
      <path
        d="M44 28c-8 0-14 4-14 10s5 9 12 11c5 1.5 8 4 8 8s-4 9-12 9c-5 0-9-2-12-5"
        stroke="#0f172a"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      <defs>
        <linearGradient id={gradientId} x1="12" y1="8" x2="76" y2="88" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e8d48a" />
          <stop offset="1" stopColor="#c9a227" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function BrandMark({
  variant = 'dark',
  layout = 'inline',
  size,
  showSubtitle = false,
  subtitle,
}: BrandMarkProps) {
  const gradientId = useId().replace(/:/g, '');
  const logoSize = size ?? (layout === 'hero' ? 'hero' : 'default');
  const resolvedLogoSize = logoSize === 'hero' ? 'hero' : logoSize === 'sidebar' ? 'sidebar' : 'default';

  return (
    <div
      className={`${styles.mark} ${styles[variant]} ${styles[layout]} ${
        resolvedLogoSize === 'sidebar' ? styles.sidebarMark : ''
      }`}
    >
      <div className={styles.icon}>
        <HexLogo size={resolvedLogoSize} gradientId={gradientId} />
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
