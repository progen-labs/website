// The store & state tree: one tree of plain data split into slices, with a
// normalized todos slice. Right: the immutable snapshots every dispatch
// creates — the glowing one is "current"; DevTools can jump between them.
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import { C, Chip, FaceText, INK, Region, Wire, noRaycast } from '../primitives.jsx';

export const pose = { pos: [0, 1.4, 22], tgt: [-0.3, 0.6, 0], span: 23, height: 10.5 };

const T = {
  root: [-5.5, 3.6],
  todos: [-8.4, 2.0],
  user: [-5.0, 2.0],
  filter: [-2.4, 2.0],
  ids: [-9.6, 0.4],
  entities: [-7.2, 0.4],
  e1: [-8.85, -1.1],
  e2: [-6.15, -1.1],
  userLeaf: [-5.0, 0.4],
  filterLeaf: [-2.4, 0.4],
};
const EDGES = [
  ['root', 'todos'],
  ['root', 'user'],
  ['root', 'filter'],
  ['todos', 'ids'],
  ['todos', 'entities'],
  ['entities', 'e1'],
  ['entities', 'e2'],
  ['user', 'userLeaf'],
  ['filter', 'filterLeaf'],
];
const P = k => [...T[k], 0];
const SNAPS = ['@@INIT', 'todos/added', 'todos/toggled', 'user/loggedIn', 'todos/added'];

export default function StoreScene() {
  const snaps = useRef([]);
  useFrame(({ clock }) => {
    // the "current" snapshot walks forward, then time-travels back
    const seq = [0, 1, 2, 3, 4, 4, 2, 4];
    const cur = seq[Math.floor(clock.getElapsedTime() / 1.1) % seq.length];
    snaps.current.forEach((m, i) => {
      if (m) m.opacity = i === cur ? 0.5 : 0.1;
    });
  });

  return (
    <group>
      {EDGES.map(([a, b]) => (
        <Wire key={a + b} points={[P(a), P(b)]} color="#5d6a92" opacity={0.6} />
      ))}

      <Region id="tree" position={P('root')} size={[2.4, 0.8, 0.6]} color={C.violet} label="state (root)" labelY={0.55}>
        {hot => <Chip size={[2.2, 0.62, 0.4]} color={C.violet} text="{ }" textSize={0.32} hot={hot} />}
      </Region>
      <Region id="slices" position={[-5.4, 2.0, 0]} size={[8.2, 0.85, 0.6]} color={C.violet}>
        {hot =>
          ['todos', 'user', 'filter'].map(k => (
            <Chip key={k} position={[T[k][0] + 5.4, 0, 0]} size={[2.1, 0.62, 0.4]} color={C.violet} text={k} hot={hot} />
          ))
        }
      </Region>
      <Region id="normalized" position={[-7.9, -0.35, 0]} size={[5.9, 2.6, 0.6]} center={[0.2, 0, 0]} color={C.cyan} label="normalized: { ids, entities }" labelY={-1.75}>
        {hot => (
          <>
            <Chip position={[-1.7, 0.75, 0]} size={[2.1, 0.62, 0.4]} color={C.cyan} text="ids: [1, 2]" textSize={0.29} hot={hot} />
            <Chip position={[0.7, 0.75, 0]} size={[2.1, 0.62, 0.4]} color={C.cyan} text="entities" hot={hot} />
            <Chip position={[-0.95, -0.75, 0]} size={[2.6, 0.62, 0.4]} color={C.cyan} text={'1: {text, done}'} textSize={0.28} hot={hot} />
            <Chip position={[1.75, -0.75, 0]} size={[2.6, 0.62, 0.4]} color={C.cyan} text={'2: {text, done}'} textSize={0.28} hot={hot} />
          </>
        )}
      </Region>
      <Chip position={P('userLeaf')} size={[2.1, 0.62, 0.4]} color={C.violet} text="{ id, name }" textSize={0.28} />
      <Chip position={P('filterLeaf')} size={[2.1, 0.62, 0.4]} color={C.violet} text={"'all'"} textSize={0.3} />

      {/* immutable snapshots */}
      <Region id="snapshots" position={[5.2, 1.9, 0]} size={[5.6, 3.8, 3.0]} color={C.violet} label="Immutable snapshots" sub="one per dispatch" labelY={2.5}>
        {() => (
          <group rotation={[0, -0.55, 0]}>
            {SNAPS.map((a, i) => (
              <group key={i} position={[-1.2 + i * 0.55, -0.6 + i * 0.25, 1.2 - i * 0.6]}>
                <mesh raycast={noRaycast}>
                  <planeGeometry args={[3.2, 2.0]} />
                  <meshBasicMaterial ref={el => (snaps.current[i] = el)} color={C.violet} transparent opacity={0.1} side={2} depthWrite={false} />
                  <Edges color="#b9a6ff" />
                </mesh>
                <FaceText position={[-1.5, 0.75, 0.02]} size={0.28} color="#eee9ff" anchorX="left">{`v${i} · ${a}`}</FaceText>
              </group>
            ))}
          </group>
        )}
      </Region>

      <Region id="devtools" position={[5.2, -2.1, 0]} size={[5.6, 2.0, 0.6]} color={C.amber} label="Redux DevTools" labelY={1.25}>
        {hot => (
          <Chip size={[5.4, 1.8, 0.3]} color={C.amber} hot={hot}>
            {SNAPS.slice(2).map((a, i) => (
              <FaceText key={i} position={[-2.5, 0.45 - i * 0.42, 0.17]} size={0.28} color={i === 2 ? '#ffe0b8' : INK} anchorX="left">{`› ${a}`}</FaceText>
            ))}
            <FaceText position={[1.45, 0.4, 0.17]} size={0.28} color="#ffe0b8">time travel</FaceText>
            <mesh position={[1.45, -0.15, 0.17]} raycast={noRaycast}>
              <planeGeometry args={[2.0, 0.08]} />
              <meshBasicMaterial color="#c3cbe2" />
            </mesh>
            <mesh position={[1.95, -0.15, 0.18]} raycast={noRaycast}>
              <circleGeometry args={[0.14, 16]} />
              <meshBasicMaterial color={C.amber} />
            </mesh>
          </Chip>
        )}
      </Region>

      <Region id="api" position={[-5.4, -3.15, 0]} size={[10.4, 0.85, 0.6]} color={C.green} label="store API" labelY={0.6}>
        {hot =>
          ['getState()', 'dispatch(action)', 'subscribe(listener)'].map((t, i) => (
            <Chip key={t} position={[-3.35 + i * 3.35, 0, 0]} size={[3.2, 0.66, 0.4]} color={C.green} text={t} textSize={0.28} hot={hot} />
          ))
        }
      </Region>
    </group>
  );
}
