// redux-thunk, step by step. A component dispatches a FUNCTION. The thunk
// middleware's type check (the fork) diverts it to the thunk, which is called
// with (dispatch, getState, api). It dispatches `pending`, calls the server,
// then dispatches `fulfilled` — both plain objects that take the upper path to
// the reducers, moving the status from idle → loading → succeeded.
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';
import { C, CARD, Chip, FaceText, Glass, INK, Region, Wire, noRaycast, paintCard } from '../primitives.jsx';

export const pose = { pos: [0, 1.4, 22], tgt: [-0.4, 0.6, 0], span: 25, height: 11.5 };

const PERIOD = 8;
const v = (x, y, z = 0.4) => new THREE.Vector3(x, y, z);
const seg = (u, a, b) => (u >= a && u <= b ? (u - a) / (b - a) : null);

export default function ThunkScene() {
  const curves = useMemo(
    () => ({
      toFork: new THREE.CatmullRomCurve3([v(-8.2, 2.2), v(-6.9, 2.7, 0.6), v(-5.6, 2.2)]),
      down: new THREE.CatmullRomCurve3([v(-5.0, 1.6), v(-3.7, 0.7, 0.6), v(-2.4, 0.2)]),
      redispatch: new THREE.CatmullRomCurve3([v(-2.6, 0.7, 0.6), v(-3.4, 1.9, 1.1), v(-4.7, 2.5)]),
      up: new THREE.CatmullRomCurve3([v(-4.4, 2.7), v(0.5, 3.5, 0.6), v(7.8, 2.6)]),
      toServer: new THREE.CatmullRomCurve3([v(0.6, -0.2), v(2.6, -1.2, 0.7), v(3.7, -2.1)]),
    }),
    [],
  );
  const pathPts = useMemo(() => Object.values(curves).map(c => c.getPoints(40)), [curves]);

  const fnP = useRef();
  const pendingP = useRef();
  const reqP = useRef();
  const okP = useRef();
  const statusText = useRef();
  const statusMat = useRef();
  const stepText = useRef();
  const last = useRef('');

  useFrame(({ clock }, dt) => {
    const u = clock.getElapsedTime() % PERIOD;
    const place = (ref, curve, k) => {
      if (!ref.current) return;
      ref.current.scale.setScalar(k == null ? 0.001 : 1);
      if (k != null) curve.getPointAt(THREE.MathUtils.clamp(k, 0, 1), ref.current.position);
    };
    // the function
    const f1 = seg(u, 0, 1.0);
    const f2 = seg(u, 1.0, 1.8);
    place(fnP, f1 != null ? curves.toFork : curves.down, f1 ?? f2);
    if (fnP.current) fnP.current.rotation.y += dt * 4;
    // pending
    const p1 = seg(u, 1.8, 2.5);
    const p2 = seg(u, 2.5, 3.4);
    place(pendingP, p1 != null ? curves.redispatch : curves.up, p1 ?? p2);
    // request / response
    const r1 = seg(u, 2.6, 3.4);
    const r2 = seg(u, 3.6, 4.4);
    place(reqP, curves.toServer, r1 ?? (r2 != null ? 1 - r2 : null));
    // fulfilled
    const o1 = seg(u, 4.6, 5.3);
    const o2 = seg(u, 5.3, 6.2);
    place(okP, o1 != null ? curves.redispatch : curves.up, o1 ?? o2);

    const status = u >= 6.2 ? 'succeeded' : u >= 3.4 ? 'loading' : 'idle';
    const step =
      u < 1.0 ? '1 · dispatch(fetchTodos()) — a function'
      : u < 1.8 ? '2 · thunk middleware: typeof action === "function" → call it'
      : u < 3.4 ? '3 · thunk dispatches todos/fetch/pending'
      : u < 4.6 ? '4 · await api.get("/todos")'
      : u < 6.2 ? '5 · thunk dispatches todos/fetch/fulfilled (payload)'
      : '6 · reducers stored the data — UI re-renders';
    const key = status + step;
    if (key !== last.current) {
      last.current = key;
      if (statusText.current) {
        statusText.current.text = `status: '${status}'`;
        statusText.current.sync();
      }
      paintCard(statusMat.current, status === 'succeeded' ? C.green : status === 'loading' ? C.amber : C.grey, CARD.active);
      if (stepText.current) {
        stepText.current.text = step;
        stepText.current.sync();
      }
    }
  });

  return (
    <group>
      {pathPts.map((pts, i) => (
        <Wire key={i} points={pts} color={i === 3 ? '#cfe0ff' : '#7f8bb0'} dashed={i === 2} opacity={0.45} />
      ))}

      {/* the middleware's own source */}
      <Region id="source" position={[-1.8, 5.0, 0]} size={[11.6, 1.6, 0.6]} color={C.amber} label="the whole middleware" labelY={0.95}>
        {hot => (
          <Chip
            size={[11.4, 1.45, 0.35]}
            color={C.amber}
            text={"const thunk = ({ dispatch, getState }) => next => action =>\n  typeof action === 'function'\n    ? action(dispatch, getState, extra) : next(action);"}
            textSize={0.28}
            hot={hot}
          />
        )}
      </Region>

      <Region id="what" position={[-10.1, 2.2, 0]} size={[4.0, 1.2, 0.6]} color={C.react} label="a component" labelY={0.95}>
        {hot => <Chip size={[3.8, 1.0, 0.4]} color={C.react} text={'<TodoPage>\ndispatch(fetchTodos())'} textSize={0.28} hot={hot} />}
      </Region>

      <Region id="fork" position={[-5.0, 2.2, 0]} size={[1.8, 1.8, 1.2]} color={C.yellow} label="function or object?" labelY={-1.3}>
        {hot => (
          <mesh raycast={noRaycast}>
            <octahedronGeometry args={[0.75, 0]} />
            <Glass color={C.yellow} hot={hot} intensity={1.0} />
          </mesh>
        )}
      </Region>
      <FaceText position={[-1.6, 3.65, 0.4]} size={0.29} color="#dbe6ff">object → next(action)</FaceText>
      <FaceText position={[-4.7, 0.75, 0.4]} size={0.29} color="#ffe0b8" anchorX="right">function → call it</FaceText>

      <Region id="args" position={[-0.9, 0.0, 0]} size={[3.8, 1.3, 0.6]} color={C.amber} label="the thunk runs" labelY={-1.0}>
        {hot => <Chip size={[3.6, 1.1, 0.4]} color={C.amber} text={'fetchTodos(dispatch,\n  getState, api)'} textSize={0.29} hot={hot} />}
      </Region>

      <Region id="async-flow" position={[4.4, -2.6, 0]} size={[2.6, 2.4, 1.6]} color={C.green} label="API server" sub="request → response" labelY={1.5}>
        {hot =>
          [0.7, 0, -0.7].map(y => (
            <RoundedBox key={y} args={[2.0, 0.6, 1.2]} radius={0.07} position={[0, y, 0]} raycast={noRaycast}>
              <Glass color={C.green} hot={hot} intensity={0.45} />
            </RoundedBox>
          ))
        }
      </Region>

      <Region id="loading" position={[9.4, 1.1, 0]} size={[3.6, 3.6, 0.6]} color={C.green} label="rootReducer → todos slice" labelY={2.05}>
        {hot => (
          <>
            <Chip position={[0, 1.2, 0]} size={[3.4, 0.7, 0.4]} color={C.yellow} text="extraReducers" textSize={0.3} hot={hot} />
            <Chip position={[0, -0.1, 0]} size={[3.4, 0.9, 0.4]} color={C.grey} hot={hot} matRef={statusMat}>
              <Text ref={statusText} position={[0, 0, 0.21]} fontSize={0.3} color="#ffffff" anchorX="center" anchorY="middle" raycast={noRaycast}>
                status: 'idle'
              </Text>
            </Chip>
            <FaceText position={[0, -1.05, 0.2]} size={0.28} color={INK}>idle → loading → succeeded</FaceText>
          </>
        )}
      </Region>

      <Region id="cat" position={[-8.6, -2.5, 0]} size={[6.0, 1.5, 0.6]} color={C.violet} label="createAsyncThunk" labelY={0.95}>
        {hot => <Chip size={[5.8, 1.3, 0.4]} color={C.violet} text={'createAsyncThunk(type, fn)\n→ pending · fulfilled · rejected'} textSize={0.29} hot={hot} />}
      </Region>
      <Region id="when" position={[9.4, -2.6, 0]} size={[4.4, 1.5, 0.6]} color={C.pink} label="or…" labelY={0.95}>
        {hot => <Chip size={[4.2, 1.3, 0.4]} color={C.pink} text={'listener middleware\nredux-saga · RTK Query'} textSize={0.28} hot={hot} />}
      </Region>

      {/* packets */}
      <mesh ref={fnP} raycast={noRaycast}>
        <tetrahedronGeometry args={[0.42, 0]} />
        <meshStandardMaterial color="#0b1226" emissive={C.amber} emissiveIntensity={2.4} />
      </mesh>
      <mesh ref={pendingP} raycast={noRaycast}>
        <boxGeometry args={[0.42, 0.42, 0.42]} />
        <meshStandardMaterial color="#0b1226" emissive={C.yellow} emissiveIntensity={2.2} />
      </mesh>
      <mesh ref={reqP} raycast={noRaycast}>
        <sphereGeometry args={[0.2, 14, 14]} />
        <meshBasicMaterial color={C.cyan} />
      </mesh>
      <mesh ref={okP} raycast={noRaycast}>
        <boxGeometry args={[0.42, 0.42, 0.42]} />
        <meshStandardMaterial color="#0b1226" emissive={C.green} emissiveIntensity={2.2} />
      </mesh>

      <Text ref={stepText} position={[-0.6, -4.3, 0.3]} fontSize={0.3} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.04} outlineColor="#05060e" raycast={noRaycast}>
        1 · dispatch(fetchTodos())
      </Text>
    </group>
  );
}
