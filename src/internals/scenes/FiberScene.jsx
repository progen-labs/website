// Fiber: the workInProgress tree (front) with child / sibling / return
// pointers, the dim `current` tree behind it linked by `alternate`, and the
// work-loop cursor walking the real traversal order.
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Arrow, Block, C, FaceText, Glass, HitBox, Hotspot, Label, Outline, Wire, noRaycast } from '../primitives.jsx';

export const pose = { pos: [5.5, 3.2, 19], tgt: [1.7, 0.5, -1.5], span: 20.5, height: 10 };

const N = {
  App: [0, 3.6],
  Header: [-4, 1.4],
  Main: [0, 1.4],
  Footer: [4, 1.4],
  List: [0, -0.8],
  Item1: [-1.9, -3.0],
  Item2: [1.9, -3.0],
};
const BACK_Z = -4.5;
const HW = 1.1; // half width of a node
const HH = 0.38;

// depth-first: [node, 'begin' | 'complete']
const WALK = [
  ['App', 'begin'],
  ['Header', 'begin'],
  ['Header', 'complete'],
  ['Main', 'begin'],
  ['List', 'begin'],
  ['Item1', 'begin'],
  ['Item1', 'complete'],
  ['Item2', 'begin'],
  ['Item2', 'complete'],
  ['List', 'complete'],
  ['Main', 'complete'],
  ['Footer', 'begin'],
  ['Footer', 'complete'],
  ['App', 'complete'],
];

function FiberBox({ name, z = 0, hot, dim }) {
  const [x, y] = N[name];
  return (
    <group position={[x, y, z]}>
      <RoundedBox args={[HW * 2, HH * 2, 0.5]} radius={0.14} raycast={noRaycast}>
        <Glass color={dim ? C.grey : C.react} hot={hot} intensity={dim ? 0.25 : 0.6} opacity={dim ? 0.6 : 1} />
      </RoundedBox>
      <FaceText position={[0, 0, 0.27]} size={0.28} color={dim ? '#9aa3bd' : '#ffffff'}>
        {name}
      </FaceText>
    </group>
  );
}

function Cursor() {
  const ball = useRef();
  const mat = useRef();
  const label = useRef();
  const last = useRef(-1);
  const pts = useMemo(() => WALK.map(([n, phase]) => new THREE.Vector3(N[n][0] + (phase === 'begin' ? -0.75 : 0.75), N[n][1] + 0.55, 0.55)), []);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() / 0.85;
    const i = Math.floor(t) % WALK.length;
    const j = (i + 1) % WALK.length;
    const f = THREE.MathUtils.smoothstep(t % 1, 0.15, 0.85);
    if (ball.current) ball.current.position.lerpVectors(pts[i], pts[j], f);
    if (i !== last.current) {
      last.current = i;
      const begin = WALK[i][1] === 'begin';
      if (mat.current) mat.current.color.set(begin ? C.blue : C.amber);
      if (label.current) {
        label.current.text = `${begin ? 'beginWork' : 'completeWork'}(${WALK[i][0]})`;
        label.current.color = begin ? '#9db8ff' : '#ffd29a';
        label.current.sync();
      }
    }
  });
  return (
    <Hotspot id="workloop">
      {() => (
        <group ref={ball}>
          <mesh raycast={noRaycast}>
            <sphereGeometry args={[0.26, 20, 20]} />
            <meshBasicMaterial ref={mat} color={C.blue} />
          </mesh>
          <pointLight intensity={10} distance={4} color="#ffffff" />
          <HitBox size={[0.9, 0.9, 0.9]} />
          <Text ref={label} position={[0, 0.45, 0]} fontSize={0.24} color="#9db8ff" anchorX="center" anchorY="bottom" outlineWidth={0.012} outlineColor="#05060e" raycast={noRaycast}>
            beginWork(App)
          </Text>
        </group>
      )}
    </Hotspot>
  );
}

const edge = (a, b, side) => {
  const [ax, ay] = N[a];
  const [bx, by] = N[b];
  if (side === 'down') return [[ax, ay - HH, 0.1], [bx, by + HH, 0.1]];
  return [[ax + HW, ay, 0.1], [bx - HW, by, 0.1]];
};

export default function FiberScene() {
  const names = Object.keys(N);
  return (
    <group>
      {/* current tree (on screen), behind */}
      <Hotspot id="buffers">
        {(hot, sel) => (
          <>
            {names.map(n => (
              <FiberBox key={n} name={n} z={BACK_Z} hot={hot || sel} dim={!(hot || sel)} />
            ))}
            <HitBox size={[11, 8, 0.6]} position={[0, 0.3, BACK_Z]} />
            <Label position={[-6.4, 6.1, BACK_Z]} title="current" sub="the tree on screen" subColor={C.grey} size={0.4} color={hot || sel ? '#fff' : '#b6bfd8'} />
          </>
        )}
      </Hotspot>

      {/* alternate links */}
      {['App', 'Main', 'List', 'Item2'].map(n => (
        <Wire key={n} points={[[N[n][0] + 0.6, N[n][1] - 0.2, -0.25], [N[n][0] + 0.6, N[n][1] - 0.2, BACK_Z + 0.25]]} color={C.violet} dashed opacity={0.75} />
      ))}

      {/* workInProgress tree */}
      <Hotspot id="node">
        {(hot, sel) => (
          <>
            {names.map(n => (
              <FiberBox key={n} name={n} hot={hot || sel} />
            ))}
            {names.map(n => (
              <HitBox key={n} size={[HW * 2, HH * 2, 0.6]} position={[...N[n], 0]} />
            ))}
          </>
        )}
      </Hotspot>
      <Label position={[-6.2, 4.6, 0]} title="workInProgress" sub="being built" subColor={C.react} size={0.4} />

      {/* child (blue) */}
      <Arrow from={edge('App', 'Header', 'down')[0]} to={edge('App', 'Header', 'down')[1]} color={C.blue} head={0.24} />
      <Arrow from={edge('Main', 'List', 'down')[0]} to={edge('Main', 'List', 'down')[1]} color={C.blue} head={0.24} />
      <Arrow from={edge('List', 'Item1', 'down')[0]} to={edge('List', 'Item1', 'down')[1]} color={C.blue} head={0.24} />
      {/* sibling (green) */}
      <Arrow from={edge('Header', 'Main', 'side')[0]} to={edge('Header', 'Main', 'side')[1]} color={C.green} head={0.24} />
      <Arrow from={edge('Main', 'Footer', 'side')[0]} to={edge('Main', 'Footer', 'side')[1]} color={C.green} head={0.24} />
      <Arrow from={edge('Item1', 'Item2', 'side')[0]} to={edge('Item1', 'Item2', 'side')[1]} color={C.green} head={0.24} />
      {/* return (pink, dashed) */}
      {[
        ['Footer', 'App'],
        ['Main', 'App'],
        ['List', 'Main'],
        ['Item2', 'List'],
      ].map(([a, b]) => (
        <Arrow key={a} from={[N[a][0] + 0.45, N[a][1] + HH, 0.2]} to={[N[b][0] + 0.45, N[b][1] - HH, 0.2]} color={C.pink} dashed head={0.2} width={1.2} opacity={0.75} />
      ))}

      <Cursor />

      {/* legend + concepts */}
      <Hotspot id="links" position={[9.2, 3.0, 0]}>
        {(hot, sel) => (
          <>
            {[
              ['child', C.blue],
              ['sibling', C.green],
              ['return', C.pink],
            ].map(([t, c], i) => (
              <group key={t} position={[0, -i * 0.62, 0]}>
                <Arrow from={[-1.3, 0, 0]} to={[-0.4, 0, 0]} color={c} head={0.2} dashed={t === 'return'} />
                <FaceText position={[-0.2, 0, 0]} size={0.28} color={c} anchorX="left">{t}</FaceText>
              </group>
            ))}
            <HitBox size={[3.2, 2.0, 0.5]} position={[0, -0.62, 0]} />
            {(hot || sel) && <Outline size={[3.0, 1.9, 0.3]} position={[0, -0.62, 0]} color={C.blue} />}
          </>
        )}
      </Hotspot>
      <Block id="workloop" position={[9.2, 0.6, 0]} size={[3.2, 0.62, 0.3]} color={C.amber} text="performUnitOfWork()" textSize={0.22} />
      <Block id="alternate" position={[9.2, -0.4, 0]} size={[3.2, 0.62, 0.3]} color={C.violet} text="fiber.alternate" textSize={0.22} />
      <Block id="yield" position={[9.2, -1.4, 0]} size={[3.2, 0.62, 0.3]} color={C.yellow} text="if (shouldYield()) pause" textSize={0.21} />
      <Block id="flags" position={[9.2, -2.4, 0]} size={[3.2, 0.62, 0.3]} color={C.pink} text="flags: Placement | Update" textSize={0.2} />
    </group>
  );
}
