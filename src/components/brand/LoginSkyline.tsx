import styles from './LoginSkyline.module.css';

export function LoginSkyline() {
  return (
    <div className={styles.skyline} aria-hidden>
      <svg viewBox="0 0 400 120" preserveAspectRatio="xMidYMax meet" className={styles.svg}>
        <rect x="0" y="80" width="400" height="40" fill="rgba(15, 23, 42, 0.4)" />
        <rect x="20" y="55" width="28" height="65" fill="rgba(201, 162, 39, 0.35)" rx="2" />
        <rect x="55" y="40" width="22" height="80" fill="rgba(255, 255, 255, 0.08)" rx="2" />
        <rect x="85" y="62" width="35" height="58" fill="rgba(201, 162, 39, 0.2)" rx="2" />
        <rect x="130" y="30" width="30" height="90" fill="rgba(255, 255, 255, 0.1)" rx="2" />
        <rect x="170" y="50" width="25" height="70" fill="rgba(201, 162, 39, 0.28)" rx="2" />
        <rect x="205" y="35" width="32" height="85" fill="rgba(255, 255, 255, 0.07)" rx="2" />
        <rect x="250" y="58" width="28" height="62" fill="rgba(201, 162, 39, 0.22)" rx="2" />
        <rect x="290" y="42" width="24" height="78" fill="rgba(255, 255, 255, 0.09)" rx="2" />
        <rect x="325" y="52" width="30" height="68" fill="rgba(201, 162, 39, 0.3)" rx="2" />
        <rect x="360" y="38" width="26" height="82" fill="rgba(255, 255, 255, 0.06)" rx="2" />
      </svg>
    </div>
  );
}
