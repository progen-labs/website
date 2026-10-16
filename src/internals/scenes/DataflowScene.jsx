// The Redux loop: seven stations on a ring. A packet travels one way only —
// a violet action cube until the reducer, a cyan state sphere after it —
// lighting each station as it passes. The three principles sit at the centre.
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { C, Chip, Region, noRaycast } from '../primitives.jsx';

export const pose = { pos: [0, 1.2, 22], tgt: [0, 0.2, 0], span: 17.5, height: 15.5 };

const R = 6.2;
const CY = 0.2;
const STATIONS = [
  { id: 'df-ui', text: 'UI\n<AddTodo /> clicked', color: C.react },
  { id: 'action', text: 'action\n{ type, payload }', color: C.pink },
  { id: 'df-dispatch', text: 'store.dispatch()', color: C.violet },
  { id: 'df-middleware', text: 'middleware\nthunk · listener', color: C.amber },
  { id: 'df-reducer', text: 'rootReducer\n(state, action) → state', color: C.yellow },
  { id: 'df-store', text: 'store\nnew state saved', color: C.violet },
  { id: 'df-subscribe', text: 'subscribers\nnotified → re-render', color: C.green },
];
const angleOf = i => Math.PI + (i / STATIONS.length) * Math.PI * 2;
const posOf = (a, r = R) => [r * Math.cos(a), CY + r * Math.sin(a), 0];
const SPEED = 0.42; // rad/s

export default function DataflowScene() {
  const cube = useRef();
  const ball = useRef();
  const mats = useRef([]);
  const label = useRef();
  const last = useRef(-1);

  useFrame(({ clock }) => {
    const phi = (clock.getElapsedTime() * SPEED) % (Math.PI * 2);
    const a = Math.PI + phi;
    const p = posOf(a, R);
    const reduced = phi > (4 / STATIONS.length) * Math.PI * 2; // past the reducer
    if (cube.current) {
      cube.current.position.set(p[0], p[1], 0.7);
      cube.current.rotation.set(phi * 3, phi * 2, 0);
      cube.current.scale.setScalar(reduced ? 0.001 : 1);
    }
    if (ball.current) {
      ball.current.position.set(p[0], p[1], 0.7);
      ball.current.scale.setScalar(reduced ? 1 : 0.001);
    }
    const near = Math.round(phi / ((Math.PI * 2) / STATIONS.length)) % STATIONS.length;
    mats.current.forEach((m, i) => {
      if (m) m.emissiveIntensity = i === near ? 1.25 : 0.45;
    });
    if (near !== last.current && label.current) {
      last.current = near;
      label.current.text = ['user event', 'action created', 'dispatched', 'middleware sees it', 'reducer computes', 'state replaced', 'UI re-renders'][near];
      label.current.sync();
    }
  });

  return (
    <group>
      {/* the ring */}
      <mesh position={[0, CY, 0]} raycast={noRaycast}>
        <torusGeometry args={[R, 0.07, 10, 120]} />
        <meshStandardMaterial color="#1a1036" emissive={C.violet} emissiveIntensity={0.7} />
      </mesh>
      {STATIONS.map((s, i) => {
        const a = angleOf(i) + Math.PI / STATIONS.length;
        const p = posOf(a);
        return (
          <mesh key={`arrow-${s.id}`} position={[p[0], p[1], 0.05]} rotation={[0, 0, a]} raycast={noRaycast}>
            <coneGeometry args={[0.22, 0.45, 12]} />
            <meshBasicMaterial color={C.violet} />
          </mesh>
        );
      })}

      {STATIONS.map((s, i) => (
        <Region key={s.id} id={s.id} position={posOf(angleOf(i))} size={[3.1, 1.15, 0.7]} color={s.color}>
          {hot => <Chip size={[2.95, 1.0, 0.5]} color={s.color} text={s.text} textSize={0.22} hot={hot} matRef={el => (mats.current[i] = el)} />}
        </Region>
      ))}

      {/* the packet: action until the reducer, state after it */}
      <mesh ref={cube} raycast={noRaycast}>
        <boxGeometry args={[0.55, 0.55, 0.55]} />
        <meshStandardMaterial color="#0b1226" emissive={C.pink} emissiveIntensity={2.2} />
      </mesh>
      <mesh ref={ball} raycast={noRaycast}>
        <sphereGeometry args={[0.36, 20, 20]} />
        <meshStandardMaterial color="#0b1226" emissive={C.cyan} emissiveIntensity={2.2} />
      </mesh>

      <Region id="principles" position={[0, CY + 0.2, 0]} size={[5.6, 3.4, 0.6]} color={C.violet} label="Three principles" labelY={2.0}>
        {hot =>
          ['single source of truth', 'state is read-only', 'changes via pure functions'].map((t, i) => (
            <Chip key={t} position={[0, 1.0 - i * 1.0, 0]} size={[5.2, 0.72, 0.4]} color={C.violet} text={t} textSize={0.26} hot={hot} intensity={0.45} />
          ))
        }
      </Region>
      <Text ref={label} position={[0, CY - 2.55, 0.3]} fontSize={0.3} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.012} outlineColor="#05060e" raycast={noRaycast}>
        user event
      </Text>
    </group>
  );
}
