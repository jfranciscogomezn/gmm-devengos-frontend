import styles from './LoginSkyline.module.css';

export function LoginSkyline() {
  return (
    <div className={styles.skyline} aria-hidden>
      <svg viewBox="0 0 400 100" preserveAspectRatio="xMidYMax meet" className={styles.svg}>
        <g fill="none" stroke="#c9a227" strokeLinecap="round" strokeLinejoin="round">
          <path
            d="M0 92V68h18V52l8-10v50M26 92V58h22v34M52 92V44h6l4-8 4 8h6v48M74 92V62h20l4 8v22M102 92V50h8l6-14 6 14h8v42M132 92V72h24v20M160 92V38h6l5-12 5 12h6v54M184 92V56h28v36M216 92V48h10l8-16 8 16h10v44M254 92V64h18v28M276 92V42h8l6-10 6 10h8v50M300 92V58h22v34M326 92V52h14l6-10 6 10h14v40M358 92V66h20v26M382 92V54h18v38"
            strokeWidth="1.4"
            opacity="0.9"
          />
          <path
            d="M8 76h10M8 84h10M60 58h8M60 66h8M142 58h10M142 66h10M224 62h8M224 70h8M306 70h10M306 78h10"
            strokeWidth="0.8"
            opacity="0.45"
          />
          <path d="M0 92h400" strokeWidth="1" opacity="0.35" />
        </g>
      </svg>
    </div>
  );
}
