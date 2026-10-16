// Synthetic events: a click travels down the real DOM (capture, blue) and
// back up (bubble, amber) to the root container, where React's single
// listener builds a SyntheticEvent and replays the handlers in order.
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { C, Chip, Flow, Region, Spin, Wire, noRaycast } from '../primitives.jsx';

export const pose = { pos: [0, 1.4, 22], tgt: [0.4, 1.0, 0], span: 22, height: 10.5 };

const X0 = -4.2;
const DOM = [
  ['window', 4.6],
  ['div#root', 3.3],
  ['div.app', 2.0],
  ['ul.list', 0.7],
  ['li', -0.6],
  ['button', -1.9],
];
const HANDLERS = ['1 · onClickCapture  <App>', '2 · onClick  <button>', '3 · onClick  <li>', '4 · onClick  <App>'];

export default function EventsScene() {
  const mats = useRef([]);
  useFrame(({ clock }) => {
    const step = Math.floor((clock.getElapsedTime() % 4) / 0.7);
    mats.current.forEach((m, i) => {
      if (m) m.emissiveIntensity = i === step ? 1.3 : 0.4;
    });
  });

  return (
    <group>
      {/* the real DOM */}
      {DOM.map(([n, y], i) => i !== 1 && (
        <Chip key={n} position={[X0, y, 0]} size={[2.4, 0.62, 0.4]} color={i === 5 ? C.pink : C.grey} text={`<${n}>`} intensity={i === 0 ? 0.25 : 0.45} />
      ))}
      {DOM.slice(0, -1).map(([n, y], i) => (
        <Wire key={n} points={[[X0, y - 0.31, 0], [X0, DOM[i + 1][1] + 0.31, 0]]} color="#5d6a92" opacity={0.6} />
      ))}

      <Region id="delegation" position={[X0, 3.3, 0]} size={[2.7, 1.3, 1.0]} color={C.yellow} label="React's root listener" labelY={-0.95}>
        {hot => (
          <>
            <Chip size={[2.4, 0.62, 0.4]} color={C.yellow} text="<div#root>" hot={hot} intensity={0.7} />
            <Spin speed={1.4} axis="y">
              <mesh rotation={[Math.PI / 2, 0, 0]} raycast={noRaycast}>
                <torusGeometry args={[1.45, 0.05, 10, 64]} />
                <meshBasicMaterial color={C.yellow} />
              </mesh>
            </Spin>
          </>
        )}
      </Region>

      {/* capture (down) and bubble (up) */}
      <Region id="phases" position={[X0 - 1.75, 1.35, 0]} size={[0.8, 6.2, 0.8]} color={C.blue} label="capture (down)" labelY={3.4}>
        <Flow points={[[0, 3.1, 0.3], [0, -2.9, 0.3]]} color={C.blue} count={4} speed={0.35} size={0.11} opacity={0.5} />
      </Region>
      <Region id="phases" position={[X0 + 1.75, 1.35, 0]} size={[0.8, 6.2, 0.8]} color={C.amber} label="bubble (up)" labelY={3.4}>
        <Flow points={[[0, -2.9, 0.3], [0, 1.95, 0.3]]} color={C.amber} count={4} speed={0.35} size={0.11} opacity={0.5} />
      </Region>

      {/* React takes over */}
      <Flow points={[[X0 + 1.5, 3.3, 0.3], [0.8, 4.1, 0.6], [3.0, 3.6, 0.3]]} color={C.yellow} count={3} speed={0.4} size={0.09} />
      <Region id="synthetic" position={[5.4, 3.5, 0]} size={[4.8, 1.8, 0.6]} color={C.react} label="SyntheticEvent" labelY={1.15}>
        {hot => (
          <Chip size={[4.6, 1.6, 0.35]} color={C.react} text={'{ type: "click", target: <button>,\n  currentTarget, nativeEvent,\n  stopPropagation(), preventDefault() }'} textSize={0.19} hot={hot} intensity={0.35} />
        )}
      </Region>

      <Region id="handlers" position={[5.4, 0.15, 0]} size={[4.8, 3.6, 0.6]} color={C.green} label="Handlers, replayed along the fiber path" labelY={2.05}>
        {hot =>
          HANDLERS.map((h, i) => (
            <Chip key={h} position={[0, 1.2 - i * 0.8, 0]} size={[4.6, 0.62, 0.4]} color={i === 0 ? C.blue : C.green} text={h} textSize={0.21} hot={hot} matRef={el => (mats.current[i] = el)} />
          ))
        }
      </Region>

      <Region id="ev-batching" position={[5.4, -2.6, 0]} size={[4.8, 0.9, 0.6]} color={C.violet}>
        {hot => <Chip size={[4.6, 0.72, 0.4]} color={C.violet} text="setA(); setB(); setC();  →  1 render" textSize={0.22} hot={hot} intensity={0.45} />}
      </Region>
      <Region id="ev-priority" position={[X0, -3.25, 0]} size={[4.6, 0.9, 0.6]} color={C.red}>
        {hot => <Chip size={[4.4, 0.72, 0.4]} color={C.red} text="click = discrete event → SyncLane" textSize={0.22} hot={hot} intensity={0.45} />}
      </Region>
    </group>
  );
}
