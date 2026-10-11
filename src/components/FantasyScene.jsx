import { useMemo } from 'react';

/** A layered, animated fantasy realm backdrop (pure CSS + SVG, no assets). */
export default function FantasyScene() {
  const fireflies = useMemo(
    () =>
      Array.from({ length: 16 }, () => ({
        left: Math.random() * 100,
        top: 30 + Math.random() * 55,
        delay: Math.random() * 6,
        dur: 5 + Math.random() * 6,
        size: 2 + Math.random() * 3,
      })),
    [],
  );

  return (
    <div className="fantasy" aria-hidden="true">
      <div className="fy-sky" />
      <div className="fy-aurora a1" />
      <div className="fy-aurora a2" />
      <div className="fy-stars" />
      <div className="fy-moon" />

      {/* floating islands */}
      <div className="fy-island i1">
        <div className="fy-rock" />
        <div className="fy-tree" />
      </div>
      <div className="fy-island i2">
        <div className="fy-rock" />
        <div className="fy-tree small" />
      </div>

      {/* mountains + enchanted forest */}
      <svg className="fy-scape" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMax slice">
        <defs>
          <linearGradient id="mtnFar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4a3d8c" />
            <stop offset="1" stopColor="#241a52" />
          </linearGradient>
          <linearGradient id="mtnNear" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a2060" />
            <stop offset="1" stopColor="#120c33" />
          </linearGradient>
        </defs>
        <path d="M0,330 L160,210 L300,320 L460,180 L640,330 L820,220 L1000,340 L1200,250 L1200,600 L0,600 Z" fill="url(#mtnFar)" opacity="0.85" />
        <path d="M0,420 L220,300 L420,430 L620,320 L860,450 L1080,340 L1200,420 L1200,600 L0,600 Z" fill="url(#mtnNear)" />
        {/* treeline */}
        <g fill="#0b0820">
          {Array.from({ length: 40 }).map((_, i) => {
            const x = i * 32 + 8;
            const h = 60 + ((i * 37) % 60);
            return <polygon key={i} points={`${x},600 ${x + 16},${600 - h} ${x + 32},600`} />;
          })}
        </g>
        <rect x="0" y="560" width="1200" height="40" fill="#0b0820" />
      </svg>

      <div className="fy-mist" />
      {fireflies.map((f, i) => (
        <span
          key={i}
          className="fy-fly"
          style={{ left: `${f.left}%`, top: `${f.top}%`, width: f.size, height: f.size, animationDelay: `${f.delay}s`, animationDuration: `${f.dur}s` }}
        />
      ))}
    </div>
  );
}
