import { useId } from 'react';
import styles from './LoginBrandHeader.module.css';

interface LoginBrandHeaderProps {
  productLine: string;
  tagline: string;
  variant?: 'dark' | 'light';
  hideTagline?: boolean;
  centered?: boolean;
}

function HexLogo({ gradientId }: { gradientId: string }) {
  return (
    <svg viewBox="0 0 48 52" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.logo} aria-hidden>
      <path d="M24 2 44 13v26L24 50 4 39V13L24 2z" fill={`url(#${gradientId})`} />
      <path
        d="M24 2 44 13v26L24 50 4 39V13L24 2z"
        stroke="rgba(255,255,255,0.14)"
        strokeWidth="0.75"
        fill="none"
      />
      <g fill="#0f172a">
        <path d="M32.2 13.8 34.4 16 22.8 23.6 20.6 21.4Z" />
        <path d="M20.6 21.4 22.8 23.6 32.2 31.2 30 29Z" />
        <path d="M30 29 32.2 31.2 22.8 38.8 20.6 36.6Z" />
        <path d="M30.6 15.6 32.8 17.8 21.2 25.4 19 23.2Z" />
        <path d="M19 23.2 21.2 25.4 30.6 33 28.4 30.8Z" />
        <path d="M28.4 30.8 30.6 33 21.2 40.6 19 38.4Z" />
        <path d="M29 17.4 31.2 19.6 19.6 27.2 17.4 25Z" />
        <path d="M17.4 25 19.6 27.2 29 34.8 26.8 32.6Z" />
        <path d="M26.8 32.6 29 34.8 19.6 42.4 17.4 40.2Z" />
      </g>
      <defs>
        <linearGradient id={gradientId} x1="6" y1="4" x2="42" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e8d48a" />
          <stop offset="1" stopColor="#c9a227" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function LoginBrandHeader({
  productLine,
  tagline,
  variant = 'dark',
  hideTagline = false,
  centered = false,
}: LoginBrandHeaderProps) {
  const gradientId = useId().replace(/:/g, '');

  return (
    <div className={`${styles.header} ${styles[variant]} ${centered ? styles.centered : ''}`}>
      <HexLogo gradientId={gradientId} />
      <div className={styles.textBlock}>
        <h1 className={styles.name}>
          Step<span className={styles.accent}>Core</span>
        </h1>
        <p className={styles.productLine}>{productLine}</p>
        {!hideTagline && <p className={styles.tagline}>{tagline}</p>}
      </div>
    </div>
  );
}
