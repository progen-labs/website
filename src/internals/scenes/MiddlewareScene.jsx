// Middleware: every action passes through a chain of middleware rings before
// it reaches the reducers. A plain object flies straight through; a function
// is caught by the thunk ring, runs async work below, and dispatches a
// `fulfilled` action back into the front of the chain.
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { C, Chip, FaceText, Glass, Region, noRaycast } from '../primitives.jsx';

export const pose = { pos: [0, 1.4, 22], tgt: [-0.6, 0.2, 0], span: 24, height: 11 };

const Y = 0.8;
const ENTRY = -10.3;
const RINGS = [
  { id: 'logger', x: -6.4, color: C.cyan, name: 'logger' },
  { id: 'thunk', x: -2.4, color: C.amber, name: 'thunk' },
  { id: 'listener', x: 1.6, color: C.pink, name: 'listener' },
];
const END = 9.0;
const PERIOD = 7.2;

function Ring({ color, hot }) {
  return (
    <mesh rotation={[0, Math.PI / 2, 0]} raycast={noRaycast}>
      <torusGeometry args={[1.0, 0.13, 12, 48]} />
      <meshStandardMaterial color="#120d26" emissive={color} emissiveIntensity={hot ? 2.4 : 1.1} />
    </mesh>
  );
}

export default function MiddlewareScene() {
  const obj = useRef();
  const fn = useRef();
  const back = useRef();
  const fetcher = useRef();
  const status = useRef();
  const lastStatus = useRef('');
  const backCurve = useMemo(
    () => new THREE.CatmullRomCurve3([new THREE.Vector3(-2.4, -2.4, 0.4), new THREE.Vector3(-7.2, -2.0, 0.8), new THREE.Vector3(ENTRY, Y - 0.6, 0.4)]),
    [],
  );

  useFrame(({ clock }, dt) => {
    const u = clock.getElapsedTime() % PERIOD;
    let text;
    // 1) a plain object action runs the whole chain
    if (obj.current) {
      const k = THREE.MathUtils.clamp(u / 2.6, 0, 1);
      obj.current.position.set(THREE.MathUtils.lerp(ENTRY, END - 1.2, k), Y, 0);
      obj.current.scale.setScalar(u < 2.6 ? 1 : 0.001);
    }
    // 2) a function: caught by thunk, drops to the async work
    if (fn.current) {
      const visible = u > 2.8 && u < 4.8;
      fn.current.scale.setScalar(visible ? 1 : 0.001);
      if (u <= 4.0) fn.current.position.set(THREE.MathUtils.lerp(ENTRY, -2.4, THREE.MathUtils.clamp((u - 2.8) / 1.2, 0, 1)), Y, 0);
      else fn.current.position.set(-2.4, THREE.MathUtils.lerp(Y, -2.3, (u - 4.0) / 0.8), 0);
      fn.current.rotation.y += dt * 4;
    }
    if (fetcher.current) fetcher.current.rotation.z -= dt * (u > 4.6 && u < 5.6 ? 6 : 0.4);
    // 3) the thunk dispatches `fulfilled` back into the chain
    if (back.current) {
      const k = (u - 5.6) / 1.4;
      back.current.scale.setScalar(k > 0 && k < 1 ? 1 : 0.001);
      if (k > 0 && k < 1) backCurve.getPointAt(k, back.current.position);
    }
    if (u < 2.6) text = 'dispatch({ type: "todos/toggled" }) → straight to the reducers';
    else if (u < 4.0) text = 'dispatch(fetchTodos()) — a function!';
    else if (u < 5.6) text = 'thunk calls it: dispatch(pending) · await fetch("/api/todos")';
    else text = 'dispatch(fetchTodos.fulfilled(data)) → back through the chain';
    if (text !== lastStatus.current && status.current) {
      lastStatus.current = text;
      status.current.text = text;
      status.current.sync();
    }
  });

  return (
    <group>
      {/* the pipe */}
      <mesh position={[(ENTRY + END) / 2, Y, -0.1]} rotation={[0, 0, Math.PI / 2]} raycast={noRaycast}>
        <cylinderGeometry args={[0.05, 0.05, END - ENTRY, 8]} />
        <meshBasicMaterial color="#5d6a92" />
      </mesh>

      <Region id="chain" position={[ENTRY, Y, 0]} size={[2.6, 0.9, 0.6]} color={C.violet} label="store => next => action" labelY={0.6}>
        {hot => <Chip size={[2.4, 0.7, 0.4]} color={C.violet} text="dispatch()" hot={hot} />}
      </Region>
      <Region id="chain" position={[-2.4, 4.1, 0]} size={[9.4, 1.3, 0.6]} color={C.violet}>
        {hot => (
          <Chip size={[9.2, 1.1, 0.35]} color={C.violet} text={'const mw = store => next => action => {\n  /* before */  next(action);  /* after */\n}'} textSize={0.29} hot={hot} intensity={0.3} />
        )}
      </Region>

      {RINGS.map(r => (
        <Region key={r.id} id={r.id} position={[r.x, Y, 0]} size={[1.2, 2.4, 2.4]} color={r.color} label={r.name} labelY={1.4}>
          {hot => <Ring color={r.color} hot={hot} />}
        </Region>
      ))}

      <Region id="next" position={[END, Y, 0]} size={[3.0, 1.2, 0.8]} color={C.yellow} label="next(action)" labelY={0.8}>
        {hot => <Chip size={[2.8, 1.0, 0.5]} color={C.yellow} text={'rootReducer'} textSize={0.32} hot={hot} />}
      </Region>

      {/* async work below the thunk ring */}
      <Region id="async" position={[-2.4, -2.7, 0]} size={[3.4, 1.8, 1.2]} color={C.green} label="async work" sub="side effects live here" labelY={-1.25}>
        {hot => (
          <group ref={fetcher}>
            <mesh raycast={noRaycast}>
              <torusGeometry args={[0.55, 0.08, 10, 40, Math.PI * 1.5]} />
              <Glass color={C.green} hot={hot} intensity={1.2} />
            </mesh>
          </group>
        )}
      </Region>
      <FaceText position={[0.4, -2.7, 0.3]} size={0.3} color="#a7f3d0" anchorX="left">fetch("/api/todos")</FaceText>

      {/* packets */}
      <mesh ref={obj} raycast={noRaycast}>
        <boxGeometry args={[0.45, 0.45, 0.45]} />
        <meshStandardMaterial color="#0b1226" emissive={C.pink} emissiveIntensity={2.2} />
      </mesh>
      <mesh ref={fn} raycast={noRaycast}>
        <tetrahedronGeometry args={[0.42, 0]} />
        <meshStandardMaterial color="#0b1226" emissive={C.amber} emissiveIntensity={2.4} />
      </mesh>
      <mesh ref={back} raycast={noRaycast}>
        <boxGeometry args={[0.45, 0.45, 0.45]} />
        <meshStandardMaterial color="#0b1226" emissive={C.green} emissiveIntensity={2.2} />
      </mesh>

      <Text ref={status} position={[-0.6, -0.95, 0.4]} fontSize={0.3} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.04} outlineColor="#05060e" raycast={noRaycast}>
        dispatch
      </Text>
      <FaceText position={[-0.6, -4.95, 0]} size={0.28} color="#c3cbe2">pink cube = object action · amber pyramid = thunk (function) · green = fulfilled</FaceText>
    </group>
  );
}
