import type { ReactNode } from 'react';
import styles from './StatCard.module.css';

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  accent?: 'gold' | 'navy' | 'success' | 'warning';
  icon?: ReactNode;
}

export function StatCard({ label, value, hint, accent = 'gold', icon }: StatCardProps) {
  return (
    <article className={`${styles.card} ${styles[accent]}`}>
      <div className={styles.top}>
        <span className={styles.label}>{label}</span>
        {icon && <span className={styles.icon}>{icon}</span>}
      </div>
      <div className={styles.value}>{value}</div>
      {hint && <p className={styles.hint}>{hint}</p>}
    </article>
  );
}
