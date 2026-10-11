import { useEffect, useRef } from 'react';
import { GATE_MARKERS } from '../game/World.jsx';

/**
 * Edge markers that always point from the player toward each gate (with
 * distance), so a newcomer knows which way to go in the big world. The camera
 * sits directly behind the player looking down -z, so world directions map
 * cleanly to the screen (forward -z = up, +x = right).
 */
export default function GateCompass({ posRef }) {
  const refs = useRef({});

  useEffect(() => {
    let raf;
    const loop = () => {
      const px = posRef.current.x;
      const pz = posRef.current.z;
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const R = Math.min(window.innerWidth, window.innerHeight) * 0.34;
      for (const g of GATE_MARKERS) {
        const el = refs.current[g.id];
        if (!el) continue;
        const dx = g.pos[0] - px;
        const dz = g.pos[2] - pz;
        const dist = Math.hypot(dx, dz);
        if (dist < 9) {
          el.style.opacity = '0';
          continue;
        }
        el.style.opacity = '0.95';
        const a = Math.atan2(dx, -dz); // 0 = up (forward), clockwise +
        const x = cx + Math.sin(a) * R;
        const y = cy - Math.cos(a) * R;
        el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
        const arrow = el.firstChild;
        if (arrow) arrow.style.transform = `rotate(${a}rad)`;
        const distEl = el.querySelector('.compass-dist');
        if (distEl) distEl.textContent = `${Math.round(dist)}m`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [posRef]);

  return (
    <div className="compass">
      {GATE_MARKERS.map(g => (
        <div className="compass-marker" key={g.id} ref={el => (refs.current[g.id] = el)} style={{ color: g.color }}>
          <div className="compass-arrow">▲</div>
          <div className="compass-info">
            <span className="compass-name">{g.name}</span>
            <span className="compass-dist" />
          </div>
        </div>
      ))}
    </div>
  );
}
