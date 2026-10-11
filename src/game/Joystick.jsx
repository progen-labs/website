import { useRef, useState } from 'react';

const RADIUS = 54;

/** On-screen virtual joystick. Writes a normalized vector to moveRef {x,z}. */
export default function Joystick({ moveRef }) {
  const base = useRef();
  const active = useRef(false);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  const update = (cx, cy) => {
    const b = base.current.getBoundingClientRect();
    let dx = cx - (b.left + b.width / 2);
    let dy = cy - (b.top + b.height / 2);
    const len = Math.hypot(dx, dy);
    if (len > RADIUS) {
      dx = (dx / len) * RADIUS;
      dy = (dy / len) * RADIUS;
    }
    setKnob({ x: dx, y: dy });
    moveRef.current.x = dx / RADIUS; // right = +x (D)
    moveRef.current.z = dy / RADIUS; // up = -y = forward (-z)
  };

  const start = e => {
    active.current = true;
    const t = e.touches ? e.touches[0] : e;
    update(t.clientX, t.clientY);
  };
  const move = e => {
    if (!active.current) return;
    const t = e.touches ? e.touches[0] : e;
    update(t.clientX, t.clientY);
  };
  const end = () => {
    active.current = false;
    setKnob({ x: 0, y: 0 });
    moveRef.current.x = 0;
    moveRef.current.z = 0;
  };

  return (
    <div
      className="joystick"
      ref={base}
      onTouchStart={start}
      onTouchMove={move}
      onTouchEnd={end}
      onTouchCancel={end}
      onMouseDown={start}
      onMouseMove={move}
      onMouseUp={end}
      onMouseLeave={end}
    >
      <div className="joystick-ring" />
      <div className="joystick-knob" style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }} />
    </div>
  );
}
