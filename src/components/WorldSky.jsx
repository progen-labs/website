/** A twilight fantasy sky drawn behind the (transparent) 3D canvas. */
export default function WorldSky() {
  return (
    <div className="world-sky" aria-hidden="true">
      <div className="ws-grad" />
      <div className="ws-aurora a1" />
      <div className="ws-aurora a2" />
      <div className="ws-stars" />
      <div className="ws-moon" />
      <svg className="ws-mtn" viewBox="0 0 1200 300" preserveAspectRatio="xMidYMax slice">
        <defs>
          <linearGradient id="wsFar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5a3f8f" />
            <stop offset="1" stopColor="#2a1a54" />
          </linearGradient>
        </defs>
        <path d="M0,170 L180,70 L340,160 L520,60 L720,170 L920,80 L1120,170 L1200,120 L1200,300 L0,300 Z" fill="url(#wsFar)" opacity="0.7" />
      </svg>
    </div>
  );
}
