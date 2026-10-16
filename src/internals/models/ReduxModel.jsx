// Redux in 3D: a store vault at the centre, the one-way loop as three swirl
// arcs with an action packet riding it (violet = action, cyan = new state),
// the rootReducer gear cluster, middleware tunnels, a selector lens, the
// RTK Query cache cloud and a shelf of the packages a real app ships with.
// `ReduxBridge` is the react-redux connection to the React atom, with the
// redux-thunk relay sitting on its dispatch lane.
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { Border, C, CARD, Cage, Callout, CardMat, FaceText, Flow, Gear, Glass, HitBox, Hotspot, Label, Outline, Spin, noRaycast } from '../primitives.jsx';

const V = C.violet;
const RING = 3.6;
const at = (a, r = RING, z = 0.2) => [r * Math.cos(a), r * Math.sin(a), z];
const deg = d => (d * Math.PI) / 180;

/** Where the bridge meets the Redux model (local coords) — the selector lens. */
export const LENS = [-4.7, 0, 0.3];

const PACKAGES = ['@reduxjs/\ntoolkit', 'react-\nredux', 'redux-\nthunk', 'reselect', 'immer', 'redux-\npersist'];

const CALLOUTS = {
  'store-core': { from: [0, 1.5, 0.8], to: [0, 5.3, 0.9], title: 'Store', sub: 'single state tree' },
  loop: { from: at(deg(140)), to: [-5.9, 4.4, 0.6], title: 'The Redux loop', sub: 'one-way data flow' },
  reducer: { from: [4.5, 0.7, 0.4], to: [7.0, 1.9, 0.6], title: 'rootReducer', sub: 'combineReducers → slices' },
  middleware: { from: [-1.4, -4.0, 0.4], to: [-5.4, -4.9, 0.6], title: 'Middleware', sub: 'thunk · listener · api' },
  selector: { from: [-4.7, -0.65, 0.4], to: [-6.4, -2.6, 0.6], title: 'Selectors', sub: 'reselect' },
  rtkq: { from: [4.7, -3.4, 0.2], to: [7.2, -2.3, 0.5], title: 'RTK Query', sub: 'server cache' },
};

function Part({ id, interactive, children, hit }) {
  if (!interactive) return <group>{typeof children === 'function' ? children(false, false) : children}</group>;
  return (
    <Hotspot id={id}>
      {(hot, sel) => (
        <>
          {typeof children === 'function' ? children(hot, sel) : children}
          {hit && <HitBox size={hit.size} position={hit.pos} />}
          {(hot || sel) && hit && <Outline size={hit.size} position={hit.pos} color={V} pad={0.1} />}
        </>
      )}
    </Hotspot>
  );
}

function arcCurve(a0, a1) {
  const pts = [];
  for (let i = 0; i <= 40; i++) pts.push(new THREE.Vector3(...at(a0 + ((a1 - a0) * i) / 40)));
  return new THREE.CatmullRomCurve3(pts);
}

function Loop({ hot }) {
  // three swirl arcs (the loop), each ending in an arrowhead pointing onward
  const arcs = useMemo(() => [0, 1, 2].map(k => {
    const a0 = deg(200 + k * 120);
    const a1 = a0 + deg(100);
    return { geo: new THREE.TubeGeometry(arcCurve(a0, a1), 60, 0.16, 10, false), end: a1 };
  }), []);
  return (
    <>
      {arcs.map((a, i) => (
        <group key={i}>
          <mesh geometry={a.geo} raycast={noRaycast}>
            <meshStandardMaterial color="#1a1036" emissive={V} emissiveIntensity={hot ? 2.0 : 0.95} roughness={0.3} />
          </mesh>
          <mesh position={at(a.end)} rotation={[0, 0, a.end]} raycast={noRaycast}>
            <coneGeometry args={[0.32, 0.6, 16]} />
            <meshStandardMaterial color="#1a1036" emissive={V} emissiveIntensity={hot ? 2.0 : 0.95} />
          </mesh>
        </group>
      ))}
    </>
  );
}

function Packet({ coreMat }) {
  const ref = useRef();
  const mat = useRef();
  useFrame(({ clock }) => {
    const phi = (clock.getElapsedTime() * 0.55) % (Math.PI * 2); // 0 at the lens (180°), counter-clockwise
    const a = Math.PI + phi;
    if (ref.current) {
      ref.current.position.set(...at(a, RING, 0.45));
      ref.current.rotation.set(phi * 2, phi * 3, 0);
    }
    const reduced = phi > Math.PI; // past the rootReducer at 0°
    if (mat.current) mat.current.emissive.set(reduced ? C.cyan : V);
    if (coreMat.current) coreMat.current.emissiveIntensity = phi > Math.PI && phi < Math.PI + 0.5 ? 2.6 : 1.2;
  });
  return (
    <mesh ref={ref} raycast={noRaycast}>
      <boxGeometry args={[0.42, 0.42, 0.42]} />
      <meshStandardMaterial ref={mat} color="#0b1226" emissive={V} emissiveIntensity={2.2} />
    </mesh>
  );
}

function Tunnel({ a }) {
  return (
    <group position={at(a)} rotation={[0, 0, a + Math.PI / 2]}>
      <mesh rotation={[0, Math.PI / 2, 0]} raycast={noRaycast}>
        <torusGeometry args={[0.52, 0.09, 10, 32]} />
        <meshStandardMaterial color="#1a1036" emissive={C.amber} emissiveIntensity={1.1} />
      </mesh>
    </group>
  );
}

export default function ReduxModel({ position, mode }) {
  const focus = mode === 'focus';
  const coreMat = useRef();

  const body = (
    <group>
      {/* store vault */}
      <Part id="store-core" interactive={focus} hit={{ size: [3.0, 3.0, 3.0], pos: [0, 0, 0] }}>
        {(hot, sel) => (
          <>
            <Spin speed={0.25}>
              <Cage size={[2.7, 2.7, 2.7]} color={hot || sel ? '#ffffff' : '#7c5cff'} />
            </Spin>
            <mesh raycast={noRaycast}>
              <icosahedronGeometry args={[1.15, 1]} />
              <meshStandardMaterial ref={coreMat} color="#170d33" emissive={V} emissiveIntensity={1.2} roughness={0.3} flatShading />
            </mesh>
            <pointLight color={V} intensity={30} distance={14} />
            <FaceText position={[0, 0, 1.4]} size={0.3} color="#ffffff">{'{ state }'}</FaceText>
          </>
        )}
      </Part>

      {/* the loop */}
      <Part id="loop" interactive={focus}>
        {(hot, sel) => (
          <>
            <Loop hot={hot || sel} />
            {focus && (
              <mesh>
                <torusGeometry args={[RING, 0.45, 8, 64]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
              </mesh>
            )}
          </>
        )}
      </Part>
      <Packet coreMat={coreMat} />

      {/* rootReducer + slice reducers, meshing at 0° */}
      <Part id="reducer" interactive={focus} hit={{ size: [2.4, 2.6, 1], pos: [4.2, 0, 0.3] }}>
        {() => (
          <group position={[4.0, 0, 0.35]}>
            <Spin speed={0.9} axis="z">
              <Gear r={0.55} color={C.amber} teeth={9} />
            </Spin>
            {[
              [0.95, 0.75],
              [1.15, -0.1],
              [0.8, -0.85],
            ].map(([x, y], i) => (
              <group key={i} position={[x, y, 0]} scale={0.42}>
                <Spin speed={-1.9} axis="z">
                  <Gear r={0.6} color={C.yellow} teeth={8} />
                </Spin>
              </group>
            ))}
          </group>
        )}
      </Part>

      {/* middleware tunnels at the bottom of the loop */}
      <Part id="middleware" interactive={focus} hit={{ size: [3.2, 1.6, 1.2], pos: [0, -3.55, 0.2] }}>
        {() => [245, 270, 295].map(d => <Tunnel key={d} a={deg(d)} />)}
      </Part>

      {/* selector lens where React reads the state */}
      <Part id="selector" interactive={focus} hit={{ size: [1.4, 1.6, 1.4], pos: LENS }}>
        {(hot, sel) => (
          <group position={LENS}>
            <mesh rotation={[0, 0, Math.PI / 2]} raycast={noRaycast}>
              <cylinderGeometry args={[0.6, 0.6, 0.28, 32]} />
              <meshStandardMaterial color="#bfefff" emissive={C.cyan} emissiveIntensity={hot || sel ? 1.6 : 0.6} transparent opacity={0.75} roughness={0.1} metalness={0.2} />
            </mesh>
          </group>
        )}
      </Part>

      {/* RTK Query cache cloud */}
      <Part id="rtkq" interactive={focus} hit={{ size: [2.2, 2.0, 1.4], pos: [4.9, -3.9, -0.2] }}>
        {(hot, sel) => (
          <group position={[4.9, -3.9, -0.2]}>
            <Spin speed={0.5}>
              {Array.from({ length: 6 }, (_, i) => {
                const a = (i / 6) * Math.PI * 2;
                return (
                  <mesh key={i} position={[Math.cos(a) * 0.75, Math.sin(a * 2) * 0.25, Math.sin(a) * 0.75]} raycast={noRaycast}>
                    <boxGeometry args={[0.3, 0.3, 0.3]} />
                    <Glass color={C.green} hot={hot || sel} intensity={1} />
                  </mesh>
                );
              })}
            </Spin>
            <mesh raycast={noRaycast}>
              <sphereGeometry args={[0.32, 20, 20]} />
              <meshBasicMaterial color={C.green} />
            </mesh>
          </group>
        )}
      </Part>
      <Flow points={[at(deg(295), RING, 0.3), [3.6, -4.4, 0.4], [4.6, -3.9, 0]]} color={C.green} count={2} speed={0.35} size={0.07} />

      {/* package shelf */}
      <Part id="packages" interactive={focus} hit={{ size: [12.6, 1.9, 1.2], pos: [0, -7.05, 0] }}>
        {(hot, sel) => (
          <group position={[0, -7.2, 0]}>
            <mesh position={[0, -0.62, 0]} raycast={noRaycast}>
              <boxGeometry args={[12.4, 0.12, 1.2]} />
              <meshStandardMaterial color="#2a2346" emissive={V} emissiveIntensity={hot || sel ? 0.6 : 0.15} />
            </mesh>
            {PACKAGES.map((p, i) => (
              <group key={p} position={[-5.25 + i * 2.1, 0, 0]}>
                <RoundedBox args={[1.95, 1.15, 0.9]} radius={0.08} raycast={noRaycast}>
                  <CardMat color={V} level={hot || sel ? CARD.hot : i === 0 ? 0.3 : CARD.idle} />
                </RoundedBox>
                <Border size={[1.95, 1.15, 0.9]} color={hot || sel ? V : '#7d6bc0'} />
                <FaceText position={[0, 0, 0.47]} size={0.28}>{p}</FaceText>
              </group>
            ))}
            {focus && <Label position={[0, 0.85, 0]} title="Production packages" sub="the npm dependencies" subColor="#e3dcff" />}
          </group>
        )}
      </Part>

      {focus && Object.values(CALLOUTS).map(c => <Callout key={c.title} from={c.from} to={c.to} title={c.title} sub={c.sub} color={V} />)}
    </group>
  );

  if (focus) return <group position={position}>{body}</group>;

  return (
    <group position={position}>
      <Hotspot id="redux">
        {hot => (
          <>
            {body}
            <HitBox size={[11, 16, 4]} position={[0, -1.5, 0]} />
            <Label position={[0, 6.6, 0]} title="REDUX" sub={hot ? 'click to open the store' : 'store · loop · packages'} color={hot ? '#ffffff' : '#e3dcff'} subColor={V} size={0.95} maxWidth={20} />
          </>
        )}
      </Hotspot>
    </group>
  );
}

/**
 * The react-redux bridge between the React atom's port and the Redux lens.
 * Upper lane: state flowing to React (useSelector). Lower lane: dispatches
 * flowing to the store, through the redux-thunk relay.
 */
export function ReduxBridge({ from, to, focusModel }) {
  const mid = useMemo(() => from.map((v, i) => (v + to[i]) / 2), [from, to]);
  const relay = [mid[0], mid[1] - 0.55, mid[2] + 0.2];
  const bridgeId = focusModel === 'redux' ? 'bridge' : focusModel === 'react' ? 'redux-link' : null;
  const thunkActive = focusModel === 'redux';

  const lanes = (hot, sel) => (
    <>
      <Flow points={[[to[0], to[1] + 0.25, to[2]], [mid[0], mid[1] + 0.75, mid[2] + 0.4], [from[0], from[1] + 0.25, from[2]]]} color={C.cyan} count={4} speed={0.3} size={hot || sel ? 0.12 : 0.09} opacity={0.5} />
      <Flow points={[[from[0], from[1] - 0.2, from[2]], relay, [to[0], to[1] - 0.25, to[2]]]} color={V} count={4} speed={0.3} size={hot || sel ? 0.12 : 0.09} opacity={0.5} offset={0.5} />
      <Label position={[mid[0] - 0.4, mid[1] + 1.25, mid[2]]} title="react-redux" sub={bridgeId ? 'state → React · dispatch → store' : undefined} subColor={C.cyan} size={0.4} color={hot || sel ? '#fff' : '#e3dcff'} />
    </>
  );

  const relayBody = (hot, sel) => (
    <group position={relay}>
      <Spin speed={1.2} axis="x">
        <mesh rotation={[0, Math.PI / 2, 0]} raycast={noRaycast}>
          <torusGeometry args={[0.55, 0.12, 12, 32]} />
          <meshStandardMaterial color="#1a1036" emissive={C.amber} emissiveIntensity={hot || sel ? 2.4 : 1.2} />
        </mesh>
      </Spin>
      <FaceText position={[0, -1.0, 0.2]} size={0.3} color="#ffe0b8">redux-thunk</FaceText>
      <HitBox size={[1.4, 1.6, 1.2]} position={[0, -0.25, 0]} />
      {(hot || sel) && <Outline size={[1.3, 1.3, 1.1]} color={C.amber} />}
    </group>
  );

  return (
    <group>
      {bridgeId ? (
        <Hotspot id={bridgeId}>
          {(hot, sel) => (
            <>
              {lanes(hot, sel)}
              <HitBox size={[Math.abs(to[0] - from[0]) - 1.6, 1.8, 1]} position={[mid[0], mid[1] + 0.6, mid[2]]} />
            </>
          )}
        </Hotspot>
      ) : (
        lanes(false, false)
      )}
      {thunkActive ? <Hotspot id="thunk">{(hot, sel) => relayBody(hot, sel)}</Hotspot> : relayBody(false, false)}
    </group>
  );
}
