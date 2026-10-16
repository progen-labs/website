// Concurrent rendering & Suspense. Left: typing stays instant while the heavy
// list renders in the background (ghosted) and commits; the deferred value
// lags a step behind. Middle: a Suspense boundary waiting on a promise.
// Right: server HTML streams in as chunks that then hydrate one by one.
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';
import { C, Cage, FaceText, Glass, HitBox, Hotspot, Label, Outline, noRaycast } from '../primitives.jsx';

export const pose = { pos: [0.8, 1.4, 22.5], tgt: [0.8, 0, 0], span: 24, height: 9.5 };

const WORDS = ['r', 're', 'rea', 'reac', 'react', 'react', 'react'];
const typedAt = t => Math.floor(t / 0.7) % WORDS.length;

function Transition() {
  const input = useRef();
  const status = useRef();
  const bars = useRef([]);
  const last = useRef(-1);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const i = typedAt(t);
    const settled = i >= 4 && (t % 0.7) > 0.35;
    if (i !== last.current && input.current) {
      last.current = i;
      input.current.text = `${WORDS[i]}|`;
      input.current.sync();
    }
    const o = settled ? 1 : 0.22 + 0.1 * Math.sin(t * 8);
    bars.current.forEach(b => {
      if (b) b.material.opacity = o;
    });
    if (status.current) {
      const s = settled ? 'committed' : 'rendering in background…';
      if (status.current.text !== s) {
        status.current.text = s;
        status.current.sync();
      }
    }
  });
  return (
    <Hotspot id="transition" position={[-8.2, 0.6, 0]}>
      {(hot, sel) => (
        <>
          <group position={[0, 2.1, 0]}>
            <RoundedBox args={[4.2, 0.75, 0.3]} radius={0.12} raycast={noRaycast}>
              <Glass color={C.green} hot={hot || sel} intensity={0.45} />
            </RoundedBox>
            <Text ref={input} position={[-1.85, 0, 0.17]} fontSize={0.32} color="#ffffff" anchorX="left" anchorY="middle" raycast={noRaycast}>
              r|
            </Text>
            <FaceText position={[2.3, 0, 0.17]} size={0.17} color="#a7f3d0" anchorX="left">urgent</FaceText>
          </group>
          <group position={[0, -0.5, 0]}>
            <RoundedBox args={[4.2, 3.4, 0.15]} radius={0.12} raycast={noRaycast}>
              <Glass color={C.violet} hot={hot || sel} intensity={0.2} />
            </RoundedBox>
            {Array.from({ length: 7 }, (_, i) => (
              <mesh key={i} ref={el => (bars.current[i] = el)} position={[-0.2 - (i % 3) * 0.25, 1.2 - i * 0.38, 0.1]} raycast={noRaycast}>
                <boxGeometry args={[3.2 - (i % 3) * 0.5, 0.24, 0.06]} />
                <meshStandardMaterial color="#1a1530" emissive={C.violet} emissiveIntensity={0.9} transparent opacity={0.3} />
              </mesh>
            ))}
            <Text ref={status} position={[0, -1.55, 0.12]} fontSize={0.2} color="#d9ccff" anchorX="center" anchorY="middle" raycast={noRaycast}>
              rendering in background…
            </Text>
            <FaceText position={[2.3, 1.3, 0.1]} size={0.17} color="#d9ccff" anchorX="left">transition</FaceText>
          </group>
          <HitBox size={[4.6, 5.4, 0.6]} position={[0, 0.2, 0]} />
          {(hot || sel) && <Outline size={[4.6, 5.2, 0.4]} position={[0, 0.25, 0]} color={C.violet} />}
          <Label position={[0, 2.8, 0]} title="startTransition" sub="input stays snappy" subColor={C.green} size={0.38} color={hot || sel ? '#fff' : '#dfe6ff'} />
        </>
      )}
    </Hotspot>
  );
}

function Deferred() {
  const now = useRef();
  const lag = useRef();
  const last = useRef(-1);
  useFrame(({ clock }) => {
    const i = typedAt(clock.getElapsedTime());
    if (i === last.current) return;
    last.current = i;
    if (now.current) {
      now.current.text = `query = "${WORDS[i]}"`;
      now.current.sync();
    }
    if (lag.current) {
      lag.current.text = `deferred = "${WORDS[Math.max(0, i - 1)]}"`;
      lag.current.sync();
    }
  });
  return (
    <Hotspot id="deferred" position={[-8.2, -4.1, 0]}>
      {(hot, sel) => (
        <>
          {[
            [-1.15, now, C.green, 'query = "r"'],
            [1.15, lag, C.violet, 'deferred = "r"'],
          ].map(([x, ref, c, init]) => (
            <group key={x} position={[x, 0, 0]}>
              <RoundedBox args={[2.2, 0.7, 0.25]} radius={0.12} raycast={noRaycast}>
                <Glass color={c} hot={hot || sel} intensity={0.5} />
              </RoundedBox>
              <Text ref={ref} position={[0, 0, 0.14]} fontSize={0.18} color="#ffffff" anchorX="center" anchorY="middle" raycast={noRaycast}>
                {init}
              </Text>
            </group>
          ))}
          <HitBox size={[4.8, 0.9, 0.5]} />
          <Label position={[0, 0.6, 0]} title="useDeferredValue" sub="lags one step behind" subColor={C.violet} size={0.34} color={hot || sel ? '#fff' : '#dfe6ff'} />
        </>
      )}
    </Hotspot>
  );
}

const SUSPEND_PERIOD = 6;

function SuspenseBoundary() {
  const spinner = useRef();
  const cards = useRef([]);
  const orb = useRef();
  const orbText = useRef();
  const last = useRef(null);
  useFrame(({ clock }, dt) => {
    const u = clock.getElapsedTime() % SUSPEND_PERIOD;
    const resolved = u > 3.2;
    if (spinner.current) {
      spinner.current.rotation.z -= dt * 4;
      spinner.current.scale.setScalar(resolved ? 0.001 : 1);
    }
    cards.current.forEach((c, i) => {
      if (!c) return;
      const k = resolved ? THREE.MathUtils.clamp((u - 3.2 - i * 0.2) / 0.4, 0, 1) : 0;
      c.scale.setScalar(Math.max(0.001, k));
    });
    if (orb.current) {
      orb.current.color.set(resolved ? C.green : C.amber);
      orb.current.emissive.set(resolved ? C.green : C.amber);
    }
    if (last.current !== resolved && orbText.current) {
      last.current = resolved;
      orbText.current.text = resolved ? 'Promise · fulfilled' : 'Promise · pending';
      orbText.current.sync();
    }
  });
  return (
    <>
      <Hotspot id="suspense" position={[0.4, 0.2, 0]}>
        {(hot, sel) => (
          <>
            <Cage size={[5.0, 4.2, 2.0]} color={hot || sel ? '#ffffff' : C.violet} />
            <group ref={spinner}>
              <mesh raycast={noRaycast}>
                <torusGeometry args={[0.6, 0.09, 10, 40, Math.PI * 1.4]} />
                <meshBasicMaterial color={C.violet} />
              </mesh>
            </group>
            {[1.1, 0, -1.1].map((y, i) => (
              <group key={y} ref={el => (cards.current[i] = el)} position={[0, y, 0]} scale={0.001}>
                <RoundedBox args={[3.8, 0.85, 0.3]} radius={0.12} raycast={noRaycast}>
                  <Glass color={C.react} hot={hot || sel} intensity={0.6} />
                </RoundedBox>
                <FaceText position={[0, 0, 0.17]} size={0.22}>{['<Profile />', '<Posts />', '<Friends />'][i]}</FaceText>
              </group>
            ))}
            <FaceText position={[0, -2.45, 0]} size={0.2} color="#d9ccff">fallback → content</FaceText>
            <HitBox size={[5.0, 4.2, 2.0]} />
            <Label position={[0, 2.15, 0]} title="<Suspense fallback>" subColor={C.violet} size={0.38} color={hot || sel ? '#fff' : '#dfe6ff'} />
          </>
        )}
      </Hotspot>
      <Hotspot id="promise" position={[0.4, 3.75, 0.9]}>
        {(hot, sel) => (
          <>
            <mesh scale={hot || sel ? 1.2 : 1} raycast={noRaycast}>
              <icosahedronGeometry args={[0.42, 2]} />
              <meshStandardMaterial ref={orb} color={C.amber} emissive={C.amber} emissiveIntensity={1.4} />
            </mesh>
            <Text ref={orbText} position={[0.65, 0, 0]} fontSize={0.24} color="#ffffff" anchorX="left" anchorY="middle" outlineWidth={0.012} outlineColor="#05060e" raycast={noRaycast}>
              Promise · pending
            </Text>
            <HitBox size={[1.2, 1.2, 1.2]} />
          </>
        )}
      </Hotspot>
    </>
  );
}

const STREAM_PERIOD = 7;
const SLOTS = [1.9, 0.9, -0.1, -1.1];
const HYDRATE_AT = [5.0, 5.9, 4.6, 6.3]; // the section the user touches (#3) hydrates first
const PAGE_X = 6.5;
const SERVER_X = 11.0;

function Streaming() {
  const chunks = useRef([]);
  const mats = useRef([]);
  useFrame(({ clock }) => {
    const u = clock.getElapsedTime() % STREAM_PERIOD;
    chunks.current.forEach((c, i) => {
      if (!c) return;
      const start = 0.3 + i * 0.9;
      const k = THREE.MathUtils.clamp((u - start) / 0.8, 0, 1);
      c.scale.setScalar(u < start ? 0.001 : 1);
      const e = THREE.MathUtils.smoothstep(k, 0, 1);
      c.position.set(THREE.MathUtils.lerp(SERVER_X, PAGE_X, e), THREE.MathUtils.lerp(0.2, SLOTS[i], e) + Math.sin(e * Math.PI) * 1.4, 0.15 + Math.sin(e * Math.PI) * 1.2);
      const m = mats.current[i];
      if (m) {
        const hydrated = u > HYDRATE_AT[i];
        m.emissive.set(hydrated ? C.cyan : '#7d87a6');
        m.emissiveIntensity = hydrated ? 1.1 : 0.35;
      }
    });
  });
  return (
    <>
      <Hotspot id="streaming" position={[SERVER_X, 0.2, 0]}>
        {(hot, sel) => (
          <>
            {[0.9, 0, -0.9].map(y => (
              <RoundedBox key={y} args={[2.0, 0.72, 1.4]} radius={0.08} position={[0, y, 0]} raycast={noRaycast}>
                <Glass color={C.amber} hot={hot || sel} intensity={0.45} />
              </RoundedBox>
            ))}
            <HitBox size={[2.2, 2.6, 1.6]} />
            <Label position={[0, 1.5, 0]} title="Streaming SSR" sub="shell first, then boundaries" subColor={C.amber} size={0.34} color={hot || sel ? '#fff' : '#dfe6ff'} />
          </>
        )}
      </Hotspot>
      {SLOTS.map((y, i) => (
        <group key={y} ref={el => (chunks.current[i] = el)} scale={0.001}>
          <mesh raycast={noRaycast}>
            <boxGeometry args={[2.6, 0.72, 0.16]} />
            <meshStandardMaterial ref={el => (mats.current[i] = el)} color="#0b1226" emissive="#7d87a6" emissiveIntensity={0.35} />
          </mesh>
          <FaceText position={[0, 0, 0.1]} size={0.18}>{['<html> shell', '<Nav />', '<Comments />', '<Footer />'][i]}</FaceText>
        </group>
      ))}
      <Hotspot id="hydration" position={[PAGE_X, 0.4, 0]}>
        {(hot, sel) => (
          <>
            <Cage size={[3.1, 4.4, 0.4]} color={hot || sel ? '#ffffff' : C.cyan} />
            <HitBox size={[3.1, 4.4, 0.6]} position={[0, 0, 0.1]} />
            <FaceText position={[0, -2.55, 0]} size={0.18} color="#bdefff">grey = HTML · cyan = hydrated</FaceText>
            <Label position={[0, 2.4, 0]} title="Selective hydration" sub="interactive piece by piece" subColor={C.cyan} size={0.34} color={hot || sel ? '#fff' : '#dfe6ff'} />
          </>
        )}
      </Hotspot>
    </>
  );
}

export default function ConcurrentScene() {
  return (
    <group>
      <Transition />
      <Deferred />
      <SuspenseBoundary />
      <Streaming />
    </group>
  );
}
