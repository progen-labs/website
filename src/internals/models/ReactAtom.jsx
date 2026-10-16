// The React atom in 3D: a nucleus, three tilted elliptical orbits and an
// electron riding each one. Nucleus → components, orbits → the phases of a
// render, electrons → the machinery (hooks, scheduler, concurrency).
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { C, Callout, HitBox, Hotspot, Label, noRaycast, usePick } from '../primitives.jsx';

/** Where the react-redux bridge plugs into the atom (local coords). */
export const PORT = [7.4, -2.4, 0];

const RX = 6.2;
const RY = 2.3;
const ORBITS = [
  { id: 'orbit-a', electron: 'electron-a', rot: 0, tilt: 0.32, title: 'Reconciliation', eTitle: 'Hooks', phase: 0.0 },
  { id: 'orbit-b', electron: 'electron-b', rot: Math.PI / 3, tilt: -0.32, title: 'Fiber', eTitle: 'Scheduler', phase: 0.36 },
  { id: 'orbit-c', electron: 'electron-c', rot: (2 * Math.PI) / 3, tilt: 0.32, title: 'Commit & effects', eTitle: 'Concurrent', phase: 0.7 },
];

function orbitPoint(a, rot, tilt) {
  const px = RX * Math.cos(a);
  const py = RY * Math.sin(a) * Math.cos(tilt);
  const pz = RY * Math.sin(a) * Math.sin(tilt);
  return new THREE.Vector3(px * Math.cos(rot) - py * Math.sin(rot), px * Math.sin(rot) + py * Math.cos(rot), pz);
}

function useOrbitCurve(rot, tilt) {
  return useMemo(() => {
    const pts = [];
    for (let i = 0; i < 160; i++) pts.push(orbitPoint((i / 160) * Math.PI * 2, rot, tilt));
    return new THREE.CatmullRomCurve3(pts, true);
  }, [rot, tilt]);
}

function Orbit({ o, interactive, clock }) {
  const curve = useOrbitCurve(o.rot, o.tilt);
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 260, 0.13, 10, true), [curve]);
  const hit = useMemo(() => new THREE.TubeGeometry(curve, 120, 0.5, 6, true), [curve]);
  const electron = useRef();

  useFrame(() => {
    if (electron.current) curve.getPointAt((o.phase + clock.current * 0.06) % 1, electron.current.position);
  });

  const end = orbitPoint(0, o.rot, o.tilt);
  const callTo = end.clone().multiplyScalar(o.rot === 0 ? 1.32 : 1.24).add(new THREE.Vector3(0, o.rot === 0 ? 0.4 : 0.6, 0.4));

  const ring = (hot, sel) => (
    <>
      <mesh geometry={tube} raycast={noRaycast}>
        <meshStandardMaterial color="#0d2a36" emissive={C.react} emissiveIntensity={hot || sel ? 2.2 : 0.95} roughness={0.25} metalness={0.4} />
      </mesh>
      {interactive && (
        <mesh geometry={hit}>
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
    </>
  );

  const ball = (hot, sel) => (
    <>
      <mesh scale={hot || sel ? 1.35 : 1} raycast={noRaycast}>
        <sphereGeometry args={[0.42, 24, 24]} />
        <meshStandardMaterial color="#e9fbff" emissive={C.react} emissiveIntensity={hot || sel ? 2.6 : 1.5} roughness={0.2} />
      </mesh>
      <pointLight color={C.react} intensity={hot ? 14 : 6} distance={6} />
      {interactive && <HitBox size={[1.9, 1.9, 1.9]} />}
      {interactive && <Label position={[0, 0.75, 0]} title={o.eTitle} color={hot || sel ? '#ffffff' : '#bdefff'} size={0.42} />}
    </>
  );

  if (!interactive) {
    return (
      <group>
        {ring(false, false)}
        <group ref={electron}>{ball(false, false)}</group>
      </group>
    );
  }
  return (
    <group>
      <Hotspot id={o.id}>{(hot, sel) => ring(hot, sel)}</Hotspot>
      <Callout from={end.toArray()} to={callTo.toArray()} title={o.title} sub="orbit" color={C.react} />
      <group ref={electron}>
        <Hotspot id={o.electron}>{(hot, sel) => ball(hot, sel)}</Hotspot>
      </group>
    </group>
  );
}

// ---- satellites: concepts that orbit React itself -----------------------
const MOON_R = 9.2;
const MOONS = [
  { id: 'moon-context', title: 'Context', color: '#ffd166', shape: 0, phase: 0.3 },
  { id: 'moon-rerender', title: 'Re-render triggers', color: '#ff9f5a', shape: 1, phase: 0.3 + Math.PI / 2 },
  { id: 'moon-events', title: 'Synthetic events', color: '#ff6ad5', shape: 2, phase: 0.3 + Math.PI },
  { id: 'moon-rsc', title: 'Server Components', color: '#46e2a0', shape: 3, phase: 0.3 + (3 * Math.PI) / 2 },
];

// a ring in the XZ plane, tilted so satellites pass above and below the atom
function moonPoint(a, out = new THREE.Vector3()) {
  const x = MOON_R * Math.cos(a);
  const z = MOON_R * Math.sin(a);
  const x1 = x * Math.cos(0.28);
  const y1 = x * Math.sin(0.28);
  return out.set(x1, y1 * Math.cos(0.3) - z * Math.sin(0.3), y1 * Math.sin(0.3) + z * Math.cos(0.3));
}

function MoonShape({ shape }) {
  if (shape === 0) return <octahedronGeometry args={[0.6, 0]} />;
  if (shape === 1) return <boxGeometry args={[0.85, 0.85, 0.85]} />;
  if (shape === 2) return <tetrahedronGeometry args={[0.7, 0]} />;
  return <dodecahedronGeometry args={[0.6, 0]} />;
}

function Moons({ interactive, clock }) {
  const refs = useRef([]);
  const ring = useMemo(() => Array.from({ length: 129 }, (_, i) => moonPoint((i / 128) * Math.PI * 2, new THREE.Vector3())), []);
  useFrame(() => {
    MOONS.forEach((m, i) => {
      const g = refs.current[i];
      if (g) {
        moonPoint(m.phase + clock.current * 0.07, g.position);
        g.rotation.y = clock.current * 0.8;
      }
    });
  });
  return (
    <group>
      <Line points={ring} color="#8fb8d8" lineWidth={1} transparent opacity={0.22} dashed dashSize={0.4} gapSize={0.3} raycast={noRaycast} />
      {MOONS.map((m, i) => {
        const body = (hot, sel) => (
          <>
            <mesh scale={hot || sel ? 1.3 : 1} raycast={noRaycast}>
              <MoonShape shape={m.shape} />
              <meshStandardMaterial color="#0b1226" emissive={m.color} emissiveIntensity={hot || sel ? 2.2 : 1.1} roughness={0.3} flatShading />
            </mesh>
            {interactive && <HitBox size={[1.8, 1.8, 1.8]} />}
            {interactive && <Label position={[0, 0.85, 0]} title={m.title} sub="satellite" subColor={m.color} color={hot || sel ? '#ffffff' : '#e8ecff'} size={0.38} />}
          </>
        );
        return (
          <group key={m.id} ref={el => (refs.current[i] = el)}>
            {interactive ? <Hotspot id={m.id}>{(hot, sel) => body(hot, sel)}</Hotspot> : body(false, false)}
          </group>
        );
      })}
    </group>
  );
}

/** The socket the react-redux bridge plugs into. */
function ReduxPort({ interactive }) {
  const body = (hot, sel) => (
    <>
      <mesh rotation={[0, Math.PI / 2, 0]} raycast={noRaycast}>
        <torusGeometry args={[0.5, 0.11, 12, 32]} />
        <meshStandardMaterial color="#160f2e" emissive={C.violet} emissiveIntensity={hot || sel ? 2.4 : 1.2} />
      </mesh>
      <mesh raycast={noRaycast}>
        <sphereGeometry args={[0.24, 16, 16]} />
        <meshBasicMaterial color={C.violet} />
      </mesh>
      {interactive && <HitBox size={[1.4, 1.4, 1.4]} />}
      {interactive && <Label position={[0, 0.75, 0]} title="Redux bridge" sub="react-redux" subColor={C.violet} color={hot || sel ? '#fff' : '#e3dcff'} size={0.38} />}
    </>
  );
  return (
    <group position={PORT}>
      {interactive ? <Hotspot id="redux-link">{(hot, sel) => body(hot, sel)}</Hotspot> : body(false, false)}
    </group>
  );
}

function Nucleus({ interactive }) {
  const ref = useRef();
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.4;
  });
  const core = (hot, sel) => (
    <>
      <mesh ref={ref} scale={hot || sel ? 1.15 : 1} raycast={noRaycast}>
        <icosahedronGeometry args={[1.25, 3]} />
        <meshStandardMaterial color="#0e3140" emissive={C.react} emissiveIntensity={hot || sel ? 2.2 : 1.1} roughness={0.3} metalness={0.3} />
      </mesh>
      <mesh raycast={noRaycast}>
        <sphereGeometry args={[1.75, 32, 32]} />
        <meshBasicMaterial color={C.react} transparent opacity={0.09} depthWrite={false} />
      </mesh>
      <pointLight color={C.react} intensity={30} distance={14} />
      {interactive && <HitBox size={[2.6, 2.6, 2.6]} />}
    </>
  );
  if (!interactive) return core(false, false);
  return (
    <>
      <Hotspot id="nucleus">{(hot, sel) => core(hot, sel)}</Hotspot>
      <Callout from={[0, -1.3, 0.6]} to={[0, -3.6, 0.9]} title="Components & JSX" sub="nucleus" color={C.react} />
    </>
  );
}

export default function ReactAtom({ position, mode }) {
  const ctx = usePick();
  const focus = mode === 'focus';
  const spinRef = useRef();
  const clock = useRef(0);
  // electrons pause while you are aiming at any part, so they are easy to click
  const paused = focus && ctx.hovered != null;

  useFrame((_, dt) => {
    if (!paused) clock.current += dt;
    if (spinRef.current) {
      const r = spinRef.current.rotation.y;
      const turn = Math.PI * 2;
      spinRef.current.rotation.y = focus ? THREE.MathUtils.lerp(r, Math.round(r / turn) * turn, 0.08) : r + dt * 0.25;
    }
  });

  const atom = (
    <group ref={spinRef}>
      <Nucleus interactive={focus} />
      {ORBITS.map(o => (
        <Orbit key={o.id} o={o} interactive={focus} clock={clock} />
      ))}
      <Moons interactive={focus} clock={clock} />
    </group>
  );

  if (focus)
    return (
      <group position={position}>
        {atom}
        <ReduxPort interactive />
      </group>
    );

  return (
    <group position={position}>
      <ReduxPort />
      <Hotspot id="react">
        {hot => (
          <>
            {atom}
            <HitBox size={[15, 12.5, 6]} />
            <Label position={[0, 7.0, 0]} title="REACT" sub={hot ? 'click to split the atom' : 'the atom · 7 concepts'} color={hot ? '#ffffff' : '#c9f3ff'} subColor={C.react} size={0.95} maxWidth={20} />
          </>
        )}
      </Hotspot>
    </group>
  );
}
