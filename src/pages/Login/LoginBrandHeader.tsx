import { useId } from 'react';
import styles from './LoginBrandHeader.module.css';

interface LoginBrandHeaderProps {
  productLine: string;
  tagline: string;
  variant?: 'dark' | 'light';
  hideTagline?: boolean;
}

function HexLogo({ gradientId }: { gradientId: string }) {
  return (
    <svg viewBox="0 0 88 96" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.logo} aria-hidden>
      <path d="M44 4L82 26v44L44 92 6 70V26L44 4z" fill={`url(#${gradientId})`} />
      <path
        d="M44 4L82 26v44L44 92 6 70V26L44 4z"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M54 31C44 29 34 34 32 42C30 48 34 53 42 55C50 57 56 61 56 68C56 76 48 83 36 83C31 83 27 81 24 77"
        stroke="#0f172a"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M34 31C44 29 54 34 56 42C58 48 54 53 46 55C38 57 32 61 32 68C32 76 40 83 52 83C57 83 61 81 64 77"
        stroke="#0f172a"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.35"
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

export function LoginBrandHeader({
  productLine,
  tagline,
  variant = 'dark',
  hideTagline = false,
}: LoginBrandHeaderProps) {
  const gradientId = useId().replace(/:/g, '');

  return (
    <div className={`${styles.header} ${styles[variant]}`}>
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
