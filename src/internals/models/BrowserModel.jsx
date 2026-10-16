// A Chromium-style browser window built from primitives: tab strip, toolbar
// with omnibox, a page in the viewport, DevTools docked on the right, and the
// V8 engine chip underneath. In the hub the whole window is one hotspot; when
// focused, each part becomes its own hotspot with a callout.
import { RoundedBox } from '@react-three/drei';
import { Bob, C, Callout, FaceText, Flow, Glass, HitBox, Hotspot, Label, Outline, Padlock, noRaycast } from '../primitives.jsx';

const FRAME = '#1b1c20';
const TOOLBAR = '#35363a';
const TAB_IDLE = '#28292d';
const OMNI = '#202124';
const ICON = '#c4c7c5';
const TEXT = '#e8eaed';

const PARTS = {
  tabs: { center: [-1.3, 5.06, 0.06], size: [12.3, 0.92, 0.14], color: C.blue, from: [-5.1, 5.5, 0.06], to: [-5.1, 7.0, 0.4], title: 'Tabs', sub: 'process model' },
  omnibox: { center: [0, 4.12, 0.06], size: [18.2, 0.92, 0.16], color: C.amber, from: [1.5, 4.43, 0.1], to: [3.2, 7.0, 0.4], title: 'Omnibox', sub: 'navigation & network' },
  viewport: { center: [-3, -0.97, 0.06], size: [12.2, 9.26, 0.16], color: C.cyan, from: [-9.1, 1.0, 0.06], to: [-11.8, 1.0, 0.4], title: 'Viewport', sub: 'rendering pipeline' },
  devtools: { center: [6.1, -0.97, 0.06], size: [6.0, 9.26, 0.16], color: C.pink, from: [9.1, 1.0, 0.06], to: [11.8, 1.0, 0.4], title: 'DevTools', sub: 'inspector panels' },
  v8: { center: [-3, -7.75, 0.15], size: [4.8, 1.6, 0.6], color: C.green, from: [-0.6, -7.75, 0.42], to: [3.6, -7.3, 0.42], title: 'V8 + event loop', sub: 'JavaScript runtime' },
};

function Flat({ p, s, c, o = 1 }) {
  return (
    <mesh position={p} raycast={noRaycast}>
      <boxGeometry args={[s[0], s[1], s[2] ?? 0.02]} />
      <meshBasicMaterial color={c} transparent={o < 1} opacity={o} toneMapped={false} />
    </mesh>
  );
}

function Disc({ p, r, c }) {
  return (
    <mesh position={p} raycast={noRaycast}>
      <circleGeometry args={[r, 24]} />
      <meshBasicMaterial color={c} toneMapped={false} />
    </mesh>
  );
}

function Part({ id, interactive, children }) {
  if (!interactive) return <group>{children}</group>;
  const part = PARTS[id];
  const front = part.center[2] + part.size[2] / 2 + 0.03;
  return (
    <Hotspot id={id}>
      {(hot, sel) => (
        <>
          {children}
          <HitBox size={part.size} position={part.center} />
          {(hot || sel) && (
            <>
              <Outline size={part.size} color={part.color} position={part.center} pad={0.2} />
              <mesh position={[part.center[0], part.center[1], front]} raycast={noRaycast}>
                <planeGeometry args={[part.size[0], part.size[1]]} />
                <meshBasicMaterial color={part.color} transparent opacity={0.13} depthWrite={false} />
              </mesh>
            </>
          )}
        </>
      )}
    </Hotspot>
  );
}

function TabStrip() {
  const tabs = [
    { x: -5.1, title: 'Progen Labs', fav: C.cyan, active: true },
    { x: -1.3, title: 'React Docs', fav: C.react },
    { x: 2.5, title: 'New Tab', fav: C.grey },
  ];
  return (
    <group>
      <Disc p={[-8.55, 5.08, 0.02]} r={0.12} c="#ff5f57" />
      <Disc p={[-8.1, 5.08, 0.02]} r={0.12} c="#febc2e" />
      <Disc p={[-7.65, 5.08, 0.02]} r={0.12} c="#28c840" />
      {tabs.map(t => (
        <group key={t.title}>
          <Flat p={[t.x, 5.06, 0.02]} s={[3.7, 0.82]} c={t.active ? TOOLBAR : TAB_IDLE} />
          <Disc p={[t.x - 1.5, 5.06, 0.035]} r={0.13} c={t.fav} />
          <FaceText position={[t.x - 1.25, 5.06, 0.04]} size={0.24} color={t.active ? TEXT : '#bdc1c6'} anchorX="left">
            {t.title}
          </FaceText>
          <FaceText position={[t.x + 1.5, 5.06, 0.04]} size={0.26} color="#9aa0a6">
            ×
          </FaceText>
        </group>
      ))}
      <FaceText position={[4.8, 5.06, 0.04]} size={0.44} color="#9aa0a6">
        +
      </FaceText>
    </group>
  );
}

function Toolbar() {
  return (
    <group>
      <Flat p={[0, 4.12, 0.012]} s={[18.2, 0.92]} c={TOOLBAR} />
      {/* back / forward / reload */}
      <mesh position={[-8.45, 4.12, 0.05]} rotation={[0, 0, Math.PI / 2]} raycast={noRaycast}>
        <coneGeometry args={[0.13, 0.26, 3]} />
        <meshBasicMaterial color={ICON} />
      </mesh>
      <mesh position={[-7.75, 4.12, 0.05]} rotation={[0, 0, -Math.PI / 2]} raycast={noRaycast}>
        <coneGeometry args={[0.13, 0.26, 3]} />
        <meshBasicMaterial color="#6f7378" />
      </mesh>
      <mesh position={[-7.05, 4.12, 0.05]} rotation={[0, 0, 0.6]} raycast={noRaycast}>
        <torusGeometry args={[0.15, 0.032, 8, 24, Math.PI * 1.6]} />
        <meshBasicMaterial color={ICON} />
      </mesh>
      {/* omnibox */}
      <RoundedBox args={[11.4, 0.62, 0.06]} radius={0.028} smoothness={2} position={[-0.6, 4.12, 0.04]} raycast={noRaycast}>
        <meshBasicMaterial color={OMNI} toneMapped={false} />
      </RoundedBox>
      <group position={[-5.95, 4.1, 0.1]}>
        <Padlock color={C.grey} scale={0.36} />
      </group>
      <FaceText position={[-5.7, 4.12, 0.08]} size={0.26} color={TEXT} anchorX="left">
        progenlabs.dev/internals
      </FaceText>
      {/* extensions, profile, menu */}
      <Flat p={[6.1, 4.12, 0.04]} s={[0.28, 0.28]} c={ICON} />
      <Disc p={[6.8, 4.12, 0.04]} r={0.19} c={C.amber} />
      {[0.12, 0, -0.12].map(dy => (
        <Disc key={dy} p={[7.45, 4.12 + dy, 0.04]} r={0.04} c={ICON} />
      ))}
    </group>
  );
}

function Page() {
  const cards = [
    { x: -6.9, c: C.cyan },
    { x: -3.0, c: C.pink },
    { x: 0.9, c: C.amber },
  ];
  return (
    <group>
      <Flat p={[-3, -0.97, 0.012]} s={[12.2, 9.26]} c="#f4f6fb" />
      {/* nav */}
      <Flat p={[-3, 3.26, 0.03]} s={[12.2, 0.8]} c="#0d1430" />
      <FaceText position={[-8.6, 3.26, 0.05]} size={0.26} color="#ffffff" anchorX="left">
        PROGEN LABS
      </FaceText>
      <FaceText position={[2.6, 3.26, 0.05]} size={0.2} color="#9fb0d8" anchorX="right">
        Spectra    Docs    GitHub
      </FaceText>
      {/* hero */}
      <Flat p={[-3, 1.25, 0.03]} s={[11.2, 2.9]} c="#2f5bff" />
      <Flat p={[0.4, 1.25, 0.035]} s={[4.4, 2.9]} c="#5a83ff" o={0.55} />
      <FaceText position={[-8.1, 1.85, 0.05]} size={0.48} color="#ffffff" anchorX="left">
        Build fast. Ship faster.
      </FaceText>
      <FaceText position={[-8.1, 1.2, 0.05]} size={0.22} color="#dbe4ff" anchorX="left">
        Open-source developer tooling, always free.
      </FaceText>
      <Flat p={[-7.05, 0.45, 0.05]} s={[2.1, 0.5]} c="#ffffff" />
      <FaceText position={[-7.05, 0.45, 0.07]} size={0.19} color="#2f5bff">
        Get started
      </FaceText>
      {/* cards */}
      {cards.map(k => (
        <group key={k.x}>
          <Flat p={[k.x, -2.15, 0.03]} s={[3.5, 2.7]} c="#ffffff" />
          <Flat p={[k.x - 1.25, -1.15, 0.05]} s={[0.5, 0.5]} c={k.c} />
          <Flat p={[k.x - 0.35, -1.95, 0.05]} s={[2.3, 0.13]} c="#d5dbea" />
          <Flat p={[k.x - 0.6, -2.3, 0.05]} s={[1.8, 0.13]} c="#d5dbea" />
          <Flat p={[k.x - 0.45, -2.65, 0.05]} s={[2.1, 0.13]} c="#d5dbea" />
        </group>
      ))}
      {/* footer */}
      <Flat p={[-3, -5.2, 0.03]} s={[12.2, 0.6]} c="#e3e7f1" />
      <FaceText position={[-3, -5.2, 0.05]} size={0.17} color="#6b7489">
        © Progen Labs · MIT licensed
      </FaceText>
    </group>
  );
}

const DOM_LINES = [
  '<!DOCTYPE html>',
  '<html lang="en">',
  '  <head>…</head>',
  '  <body>',
  '    <section id="hero">',
  '      <h1>Build fast…</h1>',
  '    </section>',
  '    <main class="cards">…</main>',
  '  </body>',
];

function DevTools() {
  return (
    <group>
      <Flat p={[6.1, -0.97, 0.012]} s={[6.0, 9.26]} c="#202124" />
      <Flat p={[3.12, -0.97, 0.02]} s={[0.04, 9.26]} c="#3c4043" />
      <Flat p={[6.1, 3.38, 0.02]} s={[6.0, 0.55]} c="#292a2d" />
      <FaceText position={[3.35, 3.38, 0.04]} size={0.2} color="#8ab4f8" anchorX="left">
        Elements
      </FaceText>
      <FaceText position={[4.6, 3.38, 0.04]} size={0.2} color="#9aa0a6" anchorX="left">
        Console   Sources   Network
      </FaceText>
      <Flat p={[3.87, 3.13, 0.03]} s={[1.05, 0.04]} c="#8ab4f8" />
      {/* DOM tree */}
      <Flat p={[6.1, 2.75 - 4 * 0.34, 0.02]} s={[5.96, 0.32]} c="#264268" />
      {DOM_LINES.map((l, i) => (
        <FaceText key={i} position={[3.4, 2.75 - i * 0.34, 0.04]} size={0.19} color={i === 4 ? '#ffffff' : '#8ab4f8'} anchorX="left">
          {l}
        </FaceText>
      ))}
      {/* styles pane */}
      <Flat p={[6.1, -0.35, 0.02]} s={[6.0, 0.03]} c="#3c4043" />
      <FaceText position={[3.35, -0.62, 0.04]} size={0.18} color={TEXT} anchorX="left">
        Styles    Computed    Layout
      </FaceText>
      {['#hero {', '  padding: 48px;', '  background: #2f5bff;', '}'].map((l, i) => (
        <FaceText key={l} position={[3.4, -1.05 - i * 0.3, 0.04]} size={0.18} color={i === 0 || i === 3 ? TEXT : '#81c995'} anchorX="left">
          {l}
        </FaceText>
      ))}
      {/* box model */}
      <Flat p={[6.6, -3.6, 0.03]} s={[3.6, 2.2]} c="#f9cc9d" />
      <Flat p={[6.6, -3.6, 0.036]} s={[2.9, 1.65]} c="#fddd9b" />
      <Flat p={[6.6, -3.6, 0.042]} s={[2.3, 1.15]} c="#c3d08b" />
      <Flat p={[6.6, -3.6, 0.048]} s={[1.4, 0.6]} c="#8cb6c0" />
      <FaceText position={[4.95, -2.65, 0.06]} size={0.13} color="#5a3b16" anchorX="left">
        margin
      </FaceText>
      <FaceText position={[6.6, -3.6, 0.06]} size={0.13} color="#10303a">
        1180 × 320
      </FaceText>
    </group>
  );
}

function V8Chip() {
  return (
    <group>
      <RoundedBox args={[4.6, 1.3, 0.5]} radius={0.12} smoothness={3} position={[-3, -7.75, 0.15]}>
        <Glass color={C.green} intensity={0.5} />
      </RoundedBox>
      {Array.from({ length: 8 }, (_, i) => (
        <group key={i}>
          <mesh position={[-4.75 + i * 0.5, -6.98, 0.15]} raycast={noRaycast}>
            <boxGeometry args={[0.14, 0.26, 0.1]} />
            <meshStandardMaterial color="#9aa4b8" metalness={0.9} roughness={0.3} />
          </mesh>
          <mesh position={[-4.75 + i * 0.5, -8.52, 0.15]} raycast={noRaycast}>
            <boxGeometry args={[0.14, 0.26, 0.1]} />
            <meshStandardMaterial color="#9aa4b8" metalness={0.9} roughness={0.3} />
          </mesh>
        </group>
      ))}
      <FaceText position={[-3, -7.75, 0.42]} size={0.36} color="#eafff2">
        V8 · JS engine
      </FaceText>
      <Flow points={[[-3, -6.9, 0.3], [-2.6, -6.25, 0.7], [-3, -5.62, 0.3]]} color={C.green} count={3} speed={0.45} size={0.09} opacity={0.5} />
    </group>
  );
}

export default function BrowserModel({ position, mode }) {
  const focus = mode === 'focus';
  const body = (
    <group>
      {/* window frame */}
      <RoundedBox args={[18.4, 11.4, 0.6]} radius={0.32} smoothness={4} position={[0, 0, -0.3]} raycast={noRaycast}>
        <meshStandardMaterial color={FRAME} metalness={0.35} roughness={0.55} />
      </RoundedBox>
      <mesh position={[0, -0.6, -0.7]} raycast={noRaycast}>
        <planeGeometry args={[21, 16]} />
        <meshBasicMaterial color={C.amber} transparent opacity={0.05} depthWrite={false} />
      </mesh>

      <Part id="tabs" interactive={focus}>
        <TabStrip />
      </Part>
      <Part id="omnibox" interactive={focus}>
        <Toolbar />
      </Part>
      <Part id="viewport" interactive={focus}>
        <Page />
      </Part>
      <Part id="devtools" interactive={focus}>
        <DevTools />
      </Part>
      <Part id="v8" interactive={focus}>
        <V8Chip />
      </Part>

      {focus &&
        Object.values(PARTS).map(p => <Callout key={p.title} from={p.from} to={p.to} title={p.title} sub={p.sub} color={p.color} />)}
    </group>
  );

  if (focus) return <group position={position}>{body}</group>;

  return (
    <Bob amp={0.14} speed={0.8} position={position}>
      <Hotspot id="browser">
        {hot => (
          <>
            {body}
            <HitBox size={[19, 15.4, 1.4]} position={[0, -1.4, 0]} />
            {hot && <Outline size={[18.6, 11.6, 0.8]} position={[0, 0, -0.2]} color={C.amber} pad={0.3} />}
            <Label position={[0, 7.3, 0]} title="THE BROWSER" sub={hot ? 'click to take it apart' : 'Chromium-style · 5 subsystems'} color={hot ? '#ffffff' : '#ffd8ab'} subColor={C.amber} size={0.95} maxWidth={20} />
          </>
        )}
      </Hotspot>
    </Bob>
  );
}
