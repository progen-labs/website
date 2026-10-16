// DevTools, panel by panel. Each card is a panel; the object floating in front
// of it is what that panel shows you — the box model, a waterfall, a flame chart…
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { C, FaceText, Glass, HitBox, Hotspot, Outline, noRaycast } from '../primitives.jsx';

export const pose = { pos: [0, 1.2, 19], tgt: [0, -0.2, 0], span: 19, height: 10 };

function Bar({ p, s, c, o = 1, z = 0.15 }) {
  return (
    <mesh position={p} raycast={noRaycast}>
      <boxGeometry args={[s[0], s[1], z]} />
      <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.35} transparent={o < 1} opacity={o} roughness={0.5} />
    </mesh>
  );
}

function Card({ id, x, y, title, color, children }) {
  return (
    <Hotspot id={id} position={[x, y, 0]} rotation={[0, -x * 0.045, 0]}>
      {(hot, sel) => (
        <>
          <RoundedBox args={[5.2, 3.6, 0.16]} radius={0.12} smoothness={3} raycast={noRaycast}>
            <meshStandardMaterial color="#1d1f24" emissive={color} emissiveIntensity={hot || sel ? 0.22 : 0.04} roughness={0.6} />
          </RoundedBox>
          <mesh position={[0, 1.55, 0.09]} raycast={noRaycast}>
            <planeGeometry args={[5.2, 0.5]} />
            <meshBasicMaterial color="#26282e" />
          </mesh>
          <FaceText position={[-2.35, 1.55, 0.1]} size={0.25} color={color} anchorX="left">
            {title}
          </FaceText>
          <mesh position={[-1.75, 1.31, 0.1]} raycast={noRaycast}>
            <planeGeometry args={[1.25, 0.04]} />
            <meshBasicMaterial color={color} />
          </mesh>
          <group position={[0, -0.25, 0.1]}>{children}</group>
          <HitBox size={[5.3, 3.7, 2]} position={[0, 0, 0.7]} />
          {(hot || sel) && <Outline size={[5.2, 3.6, 0.2]} color={color} />}
        </>
      )}
    </Hotspot>
  );
}

function BoxModel() {
  const layers = [
    { s: [2.3, 1.85], c: '#f9cc9d', t: 'margin' },
    { s: [1.85, 1.42], c: '#fddd9b', t: 'border' },
    { s: [1.42, 1.0], c: '#c3d08b', t: 'padding' },
    { s: [0.95, 0.55], c: '#8cb6c0', t: 'content' },
  ];
  return (
    <group position={[1.15, -0.05, 0.35]}>
      {layers.map((l, i) => (
        <group key={l.t} position={[0, 0, i * 0.22]}>
          <Bar p={[0, 0, 0]} s={l.s} c={l.c} o={0.9} z={0.06} />
          <FaceText position={[-l.s[0] / 2 + 0.06, l.s[1] / 2 - 0.1, 0.04]} size={0.11} color="#2b2015" anchorX="left">
            {l.t}
          </FaceText>
        </group>
      ))}
    </group>
  );
}

const DOM = ['<main class="app">', '  <h1>Todos</h1>', '  <ul>', '    <li>…</li>', '  </ul>'];

function Elements() {
  return (
    <>
      {DOM.map((l, i) => (
        <FaceText key={i} position={[-2.4, 0.85 - i * 0.32, 0.02]} size={0.17} color={i === 1 ? '#ffffff' : '#8ab4f8'} anchorX="left">
          {l}
        </FaceText>
      ))}
      <mesh position={[-1.3, 0.85 - 0.32, 0.01]} raycast={noRaycast}>
        <planeGeometry args={[2.3, 0.28]} />
        <meshBasicMaterial color="#264268" />
      </mesh>
      <BoxModel />
    </>
  );
}

function Console() {
  const caret = useRef();
  useFrame(({ clock }) => {
    if (caret.current) caret.current.visible = Math.floor(clock.getElapsedTime() * 2) % 2 === 0;
  });
  const lines = [
    ['> [1, 2, 3].map(n => n * 2)', '#9fc3ff'],
    ['(3) [2, 4, 6]', '#e8eaed'],
    ['> await fetch("/api/user")', '#9fc3ff'],
    ['Response {status: 200, ok: true}', '#e8eaed'],
    ['Warning: each child needs a "key"', '#fdd663'],
  ];
  return (
    <group position={[0, 0, 0.5]}>
      {lines.map(([t, c], i) => (
        <group key={t} position={[0, 0.9 - i * 0.38, i * 0.04]}>
          {i === 4 && <Bar p={[0, 0, -0.04]} s={[4.9, 0.32]} c="#3a3000" z={0.02} />}
          <FaceText position={[-2.4, 0, 0]} size={0.18} color={c} anchorX="left">
            {t}
          </FaceText>
        </group>
      ))}
      <FaceText position={[-2.4, -1.12, 0.2]} size={0.2} color="#8ab4f8" anchorX="left">
        {'>'}
      </FaceText>
      <mesh ref={caret} position={[-2.1, -1.12, 0.2]} raycast={noRaycast}>
        <planeGeometry args={[0.1, 0.24]} />
        <meshBasicMaterial color="#e8eaed" />
      </mesh>
    </group>
  );
}

function Sources() {
  const code = ['function onClick(e) {', '  const id = e.target.id;', '  setTodo(id);', '  track("click");', '}'];
  return (
    <>
      {code.map((l, i) => (
        <group key={l} position={[0, 0.85 - i * 0.34, 0.02]}>
          {i === 2 && <Bar p={[-0.75, 0, -0.03]} s={[3.3, 0.3]} c="#1a3f8a" z={0.02} />}
          <FaceText position={[-2.25, 0, 0]} size={0.14} color="#6f7378" anchorX="right">
            {String(i + 12)}
          </FaceText>
          <FaceText position={[-2.1, 0, 0]} size={0.17} color={i === 2 ? '#ffffff' : '#c8d0e0'} anchorX="left">
            {l}
          </FaceText>
        </group>
      ))}
      <mesh position={[-2.42, 0.85 - 2 * 0.34, 0.5]} raycast={noRaycast}>
        <sphereGeometry args={[0.11, 16, 16]} />
        <meshBasicMaterial color="#f28b82" />
      </mesh>
      {/* call stack, floating */}
      {['dispatch', 'onClick', 'setTodo'].map((f, i) => (
        <group key={f} position={[1.6, -0.75 + i * 0.42, 0.4 + i * 0.25]}>
          <Bar p={[0, 0, 0]} s={[1.6, 0.34]} c={i === 2 ? '#f28b82' : '#5b6ea8'} z={0.2} />
          <FaceText position={[0, 0, 0.11]} size={0.15} color="#ffffff">
            {f}
          </FaceText>
        </group>
      ))}
    </>
  );
}

function Waterfall() {
  const rows = [
    ['document', 0, [[0.3, '#9aa0a6'], [0.4, '#1e8e3e'], [0.4, '#f29900'], [0.3, '#a142f4'], [0.6, '#1e8e3e'], [0.4, '#4285f4']]],
    ['app.js', 1.6, [[0.3, '#1e8e3e'], [0.9, '#4285f4']]],
    ['style.css', 1.7, [[0.25, '#1e8e3e'], [0.5, '#4285f4']]],
    ['logo.svg', 2.4, [[0.3, '#1e8e3e'], [0.3, '#4285f4']]],
    ['api/user', 2.9, [[0.9, '#1e8e3e'], [0.25, '#4285f4']]],
    ['font.woff2', 2.6, [[0.4, '#1e8e3e'], [0.6, '#4285f4']]],
  ];
  return (
    <>
      {rows.map(([name, start, segs], i) => {
        let x = -1.05 + start * 0.75;
        return (
          <group key={name} position={[0, 0.9 - i * 0.36, 0]}>
            <FaceText position={[-2.4, 0, 0.02]} size={0.15} color="#bdc1c6" anchorX="left">
              {name}
            </FaceText>
            {segs.map(([w, c], k) => {
              const width = w * 0.75;
              const cx = x + width / 2;
              x += width;
              return <Bar key={k} p={[cx, 0, 0.15 + i * 0.05]} s={[width, 0.2]} c={c} z={0.22} />;
            })}
          </group>
        );
      })}
    </>
  );
}

function Flame() {
  const rows = [
    [[-2.2, 4.2, '#f4b400', 'Task']],
    [[-2.2, 2.0, '#f4b400', 'onClick'], [-0.1, 1.2, '#a142f4', 'Recalc style'], [1.15, 0.85, '#a142f4', 'Layout']],
    [[-2.2, 1.1, '#f4b400', 'setTodo'], [-1.0, 0.7, '#f4b400', 'render'], [1.15, 0.5, '#1e8e3e', 'Paint']],
    [[-2.1, 0.6, '#f4b400', 'diff'], [-0.95, 0.45, '#f4b400', 'map']],
  ];
  return (
    <>
      {rows.map((row, r) =>
        row.map(([x0, w, c, label]) => (
          <group key={label} position={[x0 + w / 2, 0.9 - r * 0.42, 0.15 + r * 0.22]}>
            <Bar p={[0, 0, 0]} s={[w, 0.34]} c={c} z={0.2} />
            <FaceText position={[0, 0, 0.11]} size={0.14} color="#1b1b1b">
              {label}
            </FaceText>
          </group>
        )),
      )}
      {/* long-task flag */}
      <mesh position={[1.92, 1.05, 0.3]} rotation={[0, 0, Math.PI]} raycast={noRaycast}>
        <circleGeometry args={[0.16, 3]} />
        <meshBasicMaterial color="#ea4335" />
      </mesh>
    </>
  );
}

function Storage() {
  const items = [
    ['Local', C.amber],
    ['IndexedDB', C.blue],
    ['Cookies', C.pink],
    ['Cache', C.green],
  ];
  return (
    <>
      {items.map(([n, c], i) => (
        <group key={n} position={[-1.8 + i * 1.2, -0.1, 0.6]}>
          <mesh raycast={noRaycast}>
            <cylinderGeometry args={[0.42, 0.42, 1.1, 28]} />
            <Glass color={c} intensity={0.7} />
          </mesh>
          <FaceText position={[0, -0.85, 0.3]} size={0.16} color="#d5dcf0">
            {n}
          </FaceText>
        </group>
      ))}
    </>
  );
}

const PANELS = [
  { id: 'elements', x: -6, y: 2.25, title: 'Elements', color: '#8ab4f8', body: <Elements /> },
  { id: 'console', x: 0, y: 2.25, title: 'Console', color: '#fdd663', body: <Console /> },
  { id: 'sources', x: 6, y: 2.25, title: 'Sources', color: '#f28b82', body: <Sources /> },
  { id: 'network', x: -6, y: -2.1, title: 'Network', color: '#81c995', body: <Waterfall /> },
  { id: 'performance', x: 0, y: -2.1, title: 'Performance', color: '#c58af9', body: <Flame /> },
  { id: 'application', x: 6, y: -2.1, title: 'Application', color: '#78d9ec', body: <Storage /> },
];

export default function DevToolsScene() {
  return (
    <group>
      {PANELS.map(p => (
        <Card key={p.id} id={p.id} x={p.x} y={p.y} title={p.title} color={p.color}>
          {p.body}
        </Card>
      ))}
      <FaceText position={[0, -4.6, 0]} size={0.26} color="#8f9bbb">
        F12 (or Cmd+Option+I) opens DevTools · click a panel for what it reveals
      </FaceText>
    </group>
  );
}
