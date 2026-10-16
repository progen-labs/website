// DevTools, panel by panel. Each card is a panel; the object floating in front
// of it is what that panel shows you — the box model, a waterfall, a flame chart…
// Text sizes respect TEXT_MIN; text on coloured bars is dark on light bars and
// white on dark bars so every label clears 4.5:1.
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { Border, C, FaceText, Glass, HitBox, Hotspot, INK, INK_DIM, Outline, noRaycast } from '../primitives.jsx';

export const pose = { pos: [0, 1.2, 19], tgt: [0, -0.2, 0], span: 21, height: 10.6 };

const W = 6.0;
const H = 4.1;

function Bar({ p, s, c, o = 1, z = 0.15 }) {
  return (
    <mesh position={p} raycast={noRaycast}>
      <boxGeometry args={[s[0], s[1], z]} />
      <meshBasicMaterial color={c} transparent={o < 1} opacity={o} />
    </mesh>
  );
}

function Card({ id, x, y, title, color, children }) {
  return (
    <Hotspot id={id} position={[x, y, 0]} rotation={[0, -x * 0.04, 0]}>
      {(hot, sel) => (
        <>
          <RoundedBox args={[W, H, 0.16]} radius={0.12} smoothness={3} raycast={noRaycast}>
            <meshBasicMaterial color={hot || sel ? '#23262e' : '#1b1d22'} />
          </RoundedBox>
          <Border size={[W, H, 0.16]} color={hot || sel ? color : '#3c4150'} width={hot || sel ? 2.4 : 1.2} />
          <mesh position={[0, H / 2 - 0.3, 0.09]} raycast={noRaycast}>
            <planeGeometry args={[W, 0.6]} />
            <meshBasicMaterial color="#282b33" />
          </mesh>
          <FaceText position={[-W / 2 + 0.25, H / 2 - 0.3, 0.1]} size={0.36} color={color} anchorX="left">
            {title}
          </FaceText>
          <group position={[0, -0.3, 0.1]}>{children}</group>
          <HitBox size={[W + 0.1, H + 0.1, 2]} position={[0, 0, 0.7]} />
          {(hot || sel) && <Outline size={[W, H, 0.2]} color={color} />}
        </>
      )}
    </Hotspot>
  );
}

function Elements() {
  const dom = ['<main>', '  <h1>', '  <ul>', '    <li>', '  </ul>'];
  const box = [
    { s: [2.0, 1.7], c: '#f9cc9d', t: 'margin' },
    { s: [1.6, 1.3], c: '#fddd9b', t: 'border' },
    { s: [1.2, 0.9], c: '#c3d08b', t: 'padding' },
    { s: [0.8, 0.5], c: '#8cb6c0', t: 'content' },
  ];
  return (
    <>
      <mesh position={[-1.85, 0.84 - 0.44, 0.01]} raycast={noRaycast}>
        <planeGeometry args={[2.0, 0.4]} />
        <meshBasicMaterial color="#264268" />
      </mesh>
      {dom.map((l, i) => (
        <FaceText key={i} position={[-2.75, 0.84 - i * 0.44, 0.02]} size={0.3} color={i === 1 ? '#ffffff' : '#a8c7fa'} anchorX="left">
          {l}
        </FaceText>
      ))}
      {/* the box model, in 3D, with a legend beside it */}
      <group position={[0.15, -0.05, 0.3]}>
        {box.map((l, i) => (
          <Bar key={l.t} p={[0, 0, i * 0.2]} s={l.s} c={l.c} z={0.05} />
        ))}
      </group>
      {box.map((l, i) => (
        <group key={l.t} position={[1.55, 0.6 - i * 0.44, 0.05]}>
          <Bar p={[0, 0, 0]} s={[0.26, 0.26]} c={l.c} z={0.04} />
          <FaceText position={[0.25, 0, 0.03]} size={0.28} color={INK} anchorX="left">
            {l.t}
          </FaceText>
        </group>
      ))}
    </>
  );
}

function Console() {
  const caret = useRef();
  useFrame(({ clock }) => {
    if (caret.current) caret.current.visible = Math.floor(clock.getElapsedTime() * 2) % 2 === 0;
  });
  const lines = [
    ['> [1,2,3].map(n => n*2)', '#a8c7fa'],
    ['(3) [2, 4, 6]', '#eef0f3'],
    ['> await fetch("/api")', '#a8c7fa'],
    ['Response {status: 200}', '#eef0f3'],
    ['Warning: missing "key"', '#fdd663'],
  ];
  return (
    <group position={[0, 0, 0.4]}>
      {lines.map(([t, c], i) => (
        <group key={t} position={[0, 1.0 - i * 0.44, i * 0.04]}>
          {i === 4 && <Bar p={[0.1, 0, -0.04]} s={[5.6, 0.4]} c="#3a3000" z={0.02} />}
          <FaceText position={[-2.7, 0, 0]} size={0.3} color={c} anchorX="left">
            {t}
          </FaceText>
        </group>
      ))}
      <FaceText position={[-2.7, -1.25, 0.2]} size={0.32} color="#a8c7fa" anchorX="left">
        {'>'}
      </FaceText>
      <mesh ref={caret} position={[-2.35, -1.25, 0.2]} raycast={noRaycast}>
        <planeGeometry args={[0.12, 0.3]} />
        <meshBasicMaterial color="#eef0f3" />
      </mesh>
    </group>
  );
}

function Sources() {
  const code = ['onClick(e) {', '  const id = e.id;', '  setTodo(id);', '  track(id);', '}'];
  return (
    <>
      {code.map((l, i) => (
        <group key={l} position={[0, 1.0 - i * 0.44, 0.02]}>
          {i === 2 && <Bar p={[-1.05, 0, -0.03]} s={[3.6, 0.4]} c="#1a3f8a" z={0.02} />}
          <FaceText position={[-2.55, 0, 0]} size={0.28} color={INK_DIM} anchorX="right">
            {String(i + 12)}
          </FaceText>
          <FaceText position={[-2.4, 0, 0]} size={0.3} color={i === 2 ? '#ffffff' : '#d5dbea'} anchorX="left">
            {l}
          </FaceText>
        </group>
      ))}
      <mesh position={[-2.82, 1.0 - 2 * 0.44, 0.5]} raycast={noRaycast}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color="#f28b82" />
      </mesh>
      {/* call stack, floating */}
      {['dispatch', 'onClick', 'setTodo'].map((f, i) => (
        <group key={f} position={[1.95, -0.85 + i * 0.52, 0.4 + i * 0.25]}>
          <Bar p={[0, 0, 0]} s={[1.8, 0.44]} c={i === 2 ? '#a50e0e' : '#2f3f73'} z={0.2} />
          <FaceText position={[0, 0, 0.11]} size={0.28} color="#ffffff">
            {f}
          </FaceText>
        </group>
      ))}
    </>
  );
}

function Waterfall() {
  // [name, start, segments]; colours darkened so they stay visible, no text on them
  const rows = [
    ['doc', 0, [[0.3, '#9aa0a6'], [0.4, '#1e8e3e'], [0.4, '#f29900'], [0.3, '#a142f4'], [0.6, '#1e8e3e'], [0.4, '#4285f4']]],
    ['app.js', 1.6, [[0.3, '#1e8e3e'], [0.9, '#4285f4']]],
    ['style', 1.7, [[0.25, '#1e8e3e'], [0.5, '#4285f4']]],
    ['logo', 2.4, [[0.3, '#1e8e3e'], [0.3, '#4285f4']]],
    ['api', 2.9, [[0.9, '#1e8e3e'], [0.25, '#4285f4']]],
    ['font', 2.6, [[0.4, '#1e8e3e'], [0.6, '#4285f4']]],
  ];
  return (
    <>
      {rows.map(([name, start, segs], i) => {
        let x = -1.4 + start * 0.72;
        return (
          <group key={name} position={[0, 1.05 - i * 0.42, 0]}>
            <FaceText position={[-2.75, 0, 0.02]} size={0.28} color={INK_DIM} anchorX="left">
              {name}
            </FaceText>
            {segs.map(([w, c], k) => {
              const width = w * 0.72;
              const cx = x + width / 2;
              x += width;
              return <Bar key={k} p={[cx, 0, 0.15 + i * 0.05]} s={[width, 0.24]} c={c} z={0.22} />;
            })}
          </group>
        );
      })}
    </>
  );
}

function Flame() {
  // label colour picked per bar for contrast: dark on yellow, white on purple/green
  const Y = ['#f4b400', '#111111'];
  const P = ['#8430ce', '#ffffff'];
  const G = ['#137333', '#ffffff'];
  const rows = [
    [[-2.6, 5.2, Y, 'Task']],
    [[-2.6, 2.4, Y, 'onClick'], [-0.1, 1.3, P, 'Style'], [1.3, 1.25, P, 'Layout']],
    [[-2.6, 1.3, Y, 'setTodo'], [-1.2, 1.1, Y, 'render'], [1.3, 1.0, G, 'Paint']],
    [[-2.5, 0.75, Y, 'diff'], [-1.65, 0.65, Y, 'map']],
  ];
  return (
    <>
      {rows.map((row, r) =>
        row.map(([x0, w, [bg, fg], label]) => (
          <group key={label} position={[x0 + w / 2, 1.0 - r * 0.55, 0.15 + r * 0.22]}>
            <Bar p={[0, 0, 0]} s={[w - 0.04, 0.46]} c={bg} z={0.2} />
            <FaceText position={[0, 0, 0.11]} size={0.28} color={fg}>
              {label}
            </FaceText>
          </group>
        )),
      )}
      {/* long-task flag */}
      <mesh position={[2.42, 1.18, 0.3]} rotation={[0, 0, Math.PI]} raycast={noRaycast}>
        <circleGeometry args={[0.18, 3]} />
        <meshBasicMaterial color="#ea4335" />
      </mesh>
    </>
  );
}

function Storage() {
  const items = [
    ['Local', C.amber],
    ['IDB', C.blue],
    ['Cookie', C.pink],
    ['Cache', C.green],
  ];
  return (
    <>
      {items.map(([n, c], i) => (
        <group key={n} position={[-2.1 + i * 1.4, 0.0, 0.6]}>
          <mesh raycast={noRaycast}>
            <cylinderGeometry args={[0.45, 0.45, 1.15, 28]} />
            <Glass color={c} intensity={0.7} />
          </mesh>
          <FaceText position={[0, -0.95, 0.3]} size={0.28} color={INK}>
            {n}
          </FaceText>
        </group>
      ))}
    </>
  );
}

const PANELS = [
  { id: 'elements', x: -6.4, y: 2.35, title: 'Elements', color: '#8ab4f8', body: <Elements /> },
  { id: 'console', x: 0, y: 2.35, title: 'Console', color: '#fdd663', body: <Console /> },
  { id: 'sources', x: 6.4, y: 2.35, title: 'Sources', color: '#f28b82', body: <Sources /> },
  { id: 'network', x: -6.4, y: -2.15, title: 'Network', color: '#81c995', body: <Waterfall /> },
  { id: 'performance', x: 0, y: -2.15, title: 'Performance', color: '#c58af9', body: <Flame /> },
  { id: 'application', x: 6.4, y: -2.15, title: 'Application', color: '#78d9ec', body: <Storage /> },
];

export default function DevToolsScene() {
  return (
    <group>
      {PANELS.map(p => (
        <Card key={p.id} id={p.id} x={p.x} y={p.y} title={p.title} color={p.color}>
          {p.body}
        </Card>
      ))}
      <FaceText position={[0, -4.85, 0]} size={0.32} color={INK_DIM}>
        F12 (or Cmd+Option+I) opens DevTools · click a panel for what it reveals
      </FaceText>
    </group>
  );
}
