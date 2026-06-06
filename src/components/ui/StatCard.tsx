import type { ReactNode } from 'react';
import styles from './StatCard.module.css';

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  trend?: { label: string; tone: 'up' | 'down' | 'neutral' };
  accent?: 'gold' | 'navy' | 'success' | 'warning';
  icon?: ReactNode;
  iconTone?: 'gold' | 'navy' | 'warning' | 'neutral';
}

export function StatCard({
  label,
  value,
  hint,
  trend,
  accent = 'navy',
  icon,
  iconTone = 'neutral',
}: StatCardProps) {
  return (
    <article className={`${styles.card} ${styles[accent]}`}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        {icon && <span className={`${styles.iconWrap} ${styles[`icon_${iconTone}`]}`}>{icon}</span>}
      </div>
      <div className={styles.body}>
        <div className={styles.value}>{value}</div>
        {trend && (
          <span className={`${styles.trend} ${styles[`trend_${trend.tone}`]}`}>{trend.label}</span>
        )}
      </div>
      {hint && <p className={styles.hint}>{hint}</p>}
    </article>
  );
}
