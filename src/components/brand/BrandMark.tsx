import { useId } from 'react';
import styles from './BrandMark.module.css';

interface BrandMarkProps {
  variant?: 'light' | 'dark';
  layout?: 'inline' | 'hero';
  showSubtitle?: boolean;
  subtitle?: string;
}

function BrandIcon({ className, gradientId }: { className?: string; gradientId: string }) {
  return (
    <svg viewBox="0 0 88 96" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <path
        d="M44 4L82 26v44L44 92 6 70V26L44 4z"
        fill={`url(#${gradientId})`}
      />
      <path
        d="M44 4L82 26v44L44 92 6 70V26L44 4z"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="1"
        fill="none"
      />
      <text
        x="44"
        y="58"
        textAnchor="middle"
        fill="#0f172a"
        fontSize="38"
        fontWeight="800"
        fontFamily="Inter, system-ui, sans-serif"
      >
        S
      </text>
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
  showSubtitle = false,
  subtitle,
}: BrandMarkProps) {
  const gradientId = useId().replace(/:/g, '');

  return (
    <div className={`${styles.mark} ${styles[variant]} ${styles[layout]}`}>
      <div className={styles.icon}>
        <BrandIcon gradientId={gradientId} />
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
