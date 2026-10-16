// What triggers a re-render: setState in Counter cascades down its subtree
// (orange), the memoized Chart and its children are skipped (grey), and the
// parents and siblings are untouched (dark).
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { C, Chip, FaceText, Region, Wire, paintCard } from '../primitives.jsx';

export const pose = { pos: [0, 1.5, 22], tgt: [0.2, 0.5, 0], span: 24.5, height: 10.5 };

const OX = 2.6;
const ORANGE = '#ff9f5a';
const N = {
  App: [0, 3.8],
  Dashboard: [-3.4, 2.3],
  Counter: [3.4, 2.3],
  Stats: [-4.6, 0.8],
  Feed: [-2.2, 0.8],
  Display: [2.0, 0.8],
  Chart: [5.3, 0.8],
  Digit1: [1.0, -0.7],
  Digit2: [3.0, -0.7],
  Bar: [5.3, -0.7],
};
const EDGES = [
  ['App', 'Dashboard'],
  ['App', 'Counter'],
  ['Dashboard', 'Stats'],
  ['Dashboard', 'Feed'],
  ['Counter', 'Display'],
  ['Counter', 'Chart'],
  ['Display', 'Digit1'],
  ['Display', 'Digit2'],
  ['Chart', 'Bar'],
];
const P = n => [OX + N[n][0], N[n][1], 0];
const CASCADE = [
  ['Counter', 0, '<Counter> setState'],
  ['Display', 0.45, '<Display>'],
  ['Digit1', 0.9, '<Digit>'],
  ['Digit2', 0.9, '<Digit>'],
];
const PERIOD = 4.5;

const TRIGGERS = ['setState / dispatch', 'parent re-rendered', 'context value changed', 'key changed → remount'];

export default function RerenderScene() {
  const mats = useRef([]);
  useFrame(({ clock }) => {
    const u = clock.getElapsedTime() % PERIOD;
    CASCADE.forEach(([, delay], i) => {
      const m = mats.current[i];
      if (!m) return;
      const on = u > delay && u < delay + 1.6;
      const k = on ? 1 - (u - delay) / 1.6 : 0;
      paintCard(m, ORANGE, 0.16 + k * 0.26);
    });
  });

  return (
    <group>
      {EDGES.map(([a, b]) => (
        <Wire key={a + b} points={[P(a), P(b)]} color="#5d6a92" opacity={0.6} />
      ))}

      <Region id="unaffected" position={[OX - 2.6, 2.3, 0]} size={[5.8, 4.4, 0.6]} center={[0, 0, 0]} color={C.grey} label="Untouched" sub="parents & siblings" labelY={2.9}>
        {hot =>
          ['App', 'Dashboard', 'Stats', 'Feed'].map(n => (
            <Chip key={n} position={[N[n][0] + 2.6, N[n][1] - 2.3, 0]} color={C.grey} text={`<${n}>`} hot={hot} dim={!hot} intensity={0.5} />
          ))
        }
      </Region>

      <Region id="cascade" position={[OX + 2.4, 0.8, 0]} size={[3.7, 4.0, 0.6]} center={[-0.55, 0, 0]} color={ORANGE} label="Re-render cascade" sub="down the subtree" labelY={2.3}>
        {hot =>
          CASCADE.map(([n, , label], i) => (
            <Chip
              key={n}
              position={[N[n][0] - 2.4, N[n][1] - 0.8, 0]}
              size={i === 0 ? [3.3, 0.62, 0.4] : [1.9, 0.62, 0.4]}
              color={ORANGE}
              text={label}
              textSize={0.29}
              hot={hot}
              matRef={el => (mats.current[i] = el)}
            />
          ))
        }
      </Region>

      <Region id="memo" position={[OX + 5.3, 0.05, 0]} size={[2.6, 2.6, 0.6]} color={C.grey} label="memo → skipped" labelY={-1.75}>
        {hot => (
          <>
            <Chip position={[0, 0.75, 0]} size={[2.45, 0.62, 0.4]} color={C.grey} text="<Chart> memo" textSize={0.29} hot={hot} dim={!hot} />
            <Chip position={[0, -0.75, 0]} size={[2.45, 0.62, 0.4]} color={C.grey} text="<Bar>" hot={hot} dim={!hot} />
          </>
        )}
      </Region>

      <Region id="triggers" position={[-9.6, 0.9, 0]} size={[4.4, 4.2, 0.6]} color={ORANGE} label="What starts a render" labelY={2.4}>
        {hot =>
          TRIGGERS.map((t, i) => (
            <Chip key={t} position={[0, 1.5 - i * 1.0, 0]} size={[4.1, 0.72, 0.4]} color={i === 3 ? C.pink : ORANGE} text={t} textSize={0.29} hot={hot} />
          ))
        }
      </Region>

      <Region id="render-vs-dom" position={[OX, -2.7, 0]} size={[8.6, 0.9, 0.6]} color={C.green}>
        {hot => <Chip size={[8.4, 0.75, 0.4]} color={C.green} text="re-render → same output → zero DOM writes" textSize={0.3} hot={hot} />}
      </Region>
      <FaceText position={[OX, -3.7, 0]} size={0.28} color="#c3cbe2">orange pulse = rendering · grey = skipped · dark = untouched</FaceText>
    </group>
  );
}
