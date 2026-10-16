// React-Redux: Provider puts the store into context; components subscribe
// with useSelector (dashed wires). The Add button dispatches → the store
// updates → every subscriber is notified and re-runs its selector → only the
// ones whose selected value changed re-render (green); the rest bail out (grey).
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { C, Cage, Chip, FaceText, Region, Spin, Wire, noRaycast } from '../primitives.jsx';

export const pose = { pos: [0, 1.6, 22], tgt: [-0.8, 0.8, 0], span: 24, height: 10.5 };

const GOLD = '#ffd166';
const STORE = [6.2, 1.2, 0];
const SUBS = [
  { id: 'Header', at: [-9.6, 0.9], label: '<Header>', sel: 'state.user', changes: false },
  { id: 'TodoList', at: [-6.5, 0.9], label: '<TodoList>', sel: 'state.todos', changes: true },
  { id: 'Footer', at: [-3.4, 0.9], label: '<Footer>', sel: 'todos.length', changes: true },
  { id: 'TodoItem', at: [-5.0, -0.7], label: '<TodoItem id=1>', sel: 'todos[1]', changes: false },
];
const PERIOD = 6.5;

const curveFor = (a, b, lift) =>
  new THREE.CatmullRomCurve3([new THREE.Vector3(...a), new THREE.Vector3((a[0] + b[0]) / 2, Math.max(a[1], b[1]) + lift, 0.8), new THREE.Vector3(...b)]);

export default function ReactReduxScene() {
  const subCurves = useMemo(() => SUBS.map((s, i) => curveFor([s.at[0] + 1.0, s.at[1] + 0.3, 0.3], [STORE[0] - 1.4, STORE[1] - 0.3 + i * 0.25, 0.3], 1.6 + i * 0.35)), []);
  const actionCurve = useMemo(
    () => new THREE.CatmullRomCurve3([new THREE.Vector3(-8.0, -1.1, 0.4), new THREE.Vector3(-1.0, -2.6, 1.0), new THREE.Vector3(STORE[0] - 0.4, STORE[1] - 1.3, 0.4)]),
    [],
  );
  const wirePts = useMemo(() => subCurves.map(c => c.getPoints(40)), [subCurves]);

  const packet = useRef();
  const pings = useRef([]);
  const mats = useRef([]);
  const tags = useRef([]);
  const core = useRef();
  const status = useRef();
  const lastPhase = useRef('');

  useFrame(({ clock }) => {
    const u = clock.getElapsedTime() % PERIOD;
    // 1) the action travels to the store
    if (packet.current) {
      const k = THREE.MathUtils.clamp(u / 1.3, 0, 1);
      actionCurve.getPointAt(k, packet.current.position);
      packet.current.scale.setScalar(u < 1.3 ? 1 : 0.001);
    }
    // 2) the store updates
    if (core.current) core.current.emissiveIntensity = u > 1.3 && u < 1.8 ? 2.8 : 1.1;
    // 3) every subscriber is notified
    pings.current.forEach((p, i) => {
      if (!p) return;
      const k = (u - 1.8) / 0.9;
      p.scale.setScalar(k > 0 && k < 1 ? 1 : 0.001);
      if (k > 0 && k < 1) subCurves[i].getPointAt(1 - k, p.position);
    });
    // 4) selectors compare: changed → re-render, equal → bail out
    const judged = u > 2.7 && u < 5.6;
    SUBS.forEach((s, i) => {
      const m = mats.current[i];
      if (m) {
        m.emissive.set(judged ? (s.changes ? C.green : C.grey) : C.react);
        m.emissiveIntensity = judged ? (s.changes ? 1.25 : 0.3) : 0.6;
      }
      const t = tags.current[i];
      if (t) t.visible = judged;
    });
    const phase = u < 1.3 ? 'dispatch(todoAdded("Ship it"))' : u < 1.8 ? 'reducer → new state' : u < 2.7 ? 'store notifies subscribers' : 'selectors compare: === ?';
    if (phase !== lastPhase.current && status.current) {
      lastPhase.current = phase;
      status.current.text = phase;
      status.current.sync();
    }
  });

  return (
    <group>
      {/* React tree */}
      <Wire points={[[-6.5, 3.39, 0], [-6.5, 2.71, 0]]} color="#5d6a92" opacity={0.6} />
      {[...SUBS.slice(0, 3).map(s => s.at), [-8.0, -0.7]].map(([x, y]) => (
        <Wire key={`${x}${y}`} points={[[-6.5, 2.09, 0], [x, y + 0.31, 0]]} color="#5d6a92" opacity={0.6} />
      ))}
      <Wire points={[[-6.5, 0.59, 0], [-5.0, -0.39, 0]]} color="#5d6a92" opacity={0.6} />
      <Chip position={[-6.5, 2.4, 0]} text="<App>" color={C.react} intensity={0.45} />

      <Region id="rr-provider" position={[-6.5, 3.7, 0]} size={[3.2, 0.8, 0.6]} color={GOLD} label="context holds the store" labelY={0.55}>
        {hot => <Chip size={[3.0, 0.62, 0.4]} color={GOLD} text="<Provider store={store}>" textSize={0.2} hot={hot} intensity={0.8} />}
      </Region>
      <Wire points={[[-4.9, 3.7, 0], [STORE[0] - 0.4, STORE[1] + 1.4, 0]]} color={GOLD} dashed opacity={0.6} />

      {SUBS.map((s, i) => (
        <Region key={s.id} id="useselector" position={[...s.at, 0]} size={[2.6, 0.8, 0.6]} color={C.violet}>
          {hot => (
            <Chip size={[2.4, 0.62, 0.4]} color={C.react} text={s.label} textSize={0.2} hot={hot} matRef={el => (mats.current[i] = el)}>
              <FaceText position={[0, -0.48, 0.2]} size={0.15} color="#d9ccff">{`useSelector(${s.sel})`}</FaceText>
              <group ref={el => (tags.current[i] = el)} visible={false}>
                <FaceText position={[0, 0.52, 0.2]} size={0.17} color={s.changes ? '#a7f3d0' : '#b6bfd8'}>{s.changes ? 'changed → re-render' : 'equal → skip'}</FaceText>
              </group>
            </Chip>
          )}
        </Region>
      ))}

      <Region id="usedispatch" position={[-8.0, -0.7, 0]} size={[2.6, 0.8, 0.6]} color={C.pink}>
        {hot => (
          <Chip size={[2.4, 0.62, 0.4]} color={C.pink} text="<AddButton>" textSize={0.2} hot={hot}>
            <FaceText position={[0, -0.48, 0.2]} size={0.15} color="#ffc2ef">useDispatch()</FaceText>
          </Chip>
        )}
      </Region>

      {/* subscription wires, notify pings, the action packet */}
      {wirePts.map((pts, i) => (
        <Wire key={i} points={pts} color={C.violet} dashed opacity={0.45} />
      ))}
      {SUBS.map((s, i) => (
        <mesh key={s.id} ref={el => (pings.current[i] = el)} raycast={noRaycast}>
          <sphereGeometry args={[0.13, 12, 12]} />
          <meshBasicMaterial color={C.violet} />
        </mesh>
      ))}
      <mesh ref={packet} raycast={noRaycast}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#0b1226" emissive={C.pink} emissiveIntensity={2} />
      </mesh>

      {/* the store */}
      <Region id="rr-store" position={STORE} size={[3.4, 3.4, 2.6]} color={C.violet} label="Redux store" sub="lives outside React" labelY={2.0}>
        {() => (
          <>
            <Spin speed={0.3}>
              <Cage size={[2.4, 2.4, 2.4]} color="#7c5cff" />
            </Spin>
            <mesh raycast={noRaycast}>
              <icosahedronGeometry args={[0.95, 1]} />
              <meshStandardMaterial ref={core} color="#170d33" emissive={C.violet} emissiveIntensity={1.1} flatShading />
            </mesh>
            <FaceText position={[0, -1.6, 0.3]} size={0.18} color="#e3dcff">{'todos: [4] · user · filter'}</FaceText>
          </>
        )}
      </Region>

      <Region id="equality" position={[1.6, 3.6, 0]} size={[4.2, 0.9, 0.6]} color={C.green}>
        {hot => <Chip size={[4.0, 0.72, 0.4]} color={C.green} text="selector(next) === selector(prev) ?" textSize={0.2} hot={hot} intensity={0.45} />}
      </Region>
      <Region id="tearing" position={[-0.4, -3.4, 0]} size={[9.4, 0.9, 0.6]} color={C.cyan}>
        {hot => <Chip size={[9.2, 0.72, 0.4]} color={C.cyan} text="useSyncExternalStore → one consistent snapshot per render (no tearing)" textSize={0.21} hot={hot} intensity={0.4} />}
      </Region>

      <Text ref={status} position={[1.0, -2.25, 0.3]} fontSize={0.28} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.012} outlineColor="#05060e" raycast={noRaycast}>
        dispatch(todoAdded("Ship it"))
      </Text>
    </group>
  );
}
