// Scheduler & lanes: updates race along priority lanes into the work loop;
// above, a frame bar shows work cut into ~5 ms slices with the browser
// getting a turn between them. Left: batching and the starvation guard.
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { Block, Border, C, CARD, CardMat, FaceText, Flow, Glass, HitBox, Hotspot, INK, Label, Orb, Outline, noRaycast } from '../primitives.jsx';

export const pose = { pos: [-1.2, 1.4, 23], tgt: [-1.2, 1.4, 0], span: 24.5, height: 9 };

const LANES = [
  { name: 'SyncLane', color: C.red, speed: 0.42 },
  { name: 'InputContinuous', color: C.amber, speed: 0.3 },
  { name: 'DefaultLane', color: C.blue, speed: 0.2 },
  { name: 'TransitionLane', color: C.violet, speed: 0.11 },
  { name: 'IdleLane', color: C.grey, speed: 0.05 },
];
const X0 = -6.5;
const X1 = 5.6;

function Lanes() {
  const refs = useRef([]);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    LANES.forEach((l, li) => {
      for (let k = 0; k < 3; k++) {
        const m = refs.current[li * 3 + k];
        if (m) m.position.x = X0 + 0.3 + ((t * l.speed + k / 3 + li * 0.13) % 1) * (X1 - X0 - 0.6);
      }
    });
  });
  return (
    <Hotspot id="lanes">
      {(hot, sel) => (
        <>
          {LANES.map((l, li) => {
            const y = 2.4 - li;
            return (
              <group key={l.name}>
                <mesh position={[(X0 + X1) / 2, y, 0]} raycast={noRaycast}>
                  <boxGeometry args={[X1 - X0, 0.62, 0.16]} />
                  <Glass color={l.color} hot={hot || sel} intensity={0.18} />
                </mesh>
                <FaceText position={[X0 - 0.25, y, 0.1]} size={0.3} color={l.color} anchorX="right">
                  {l.name}
                </FaceText>
                {[0, 1, 2].map(k => (
                  <mesh key={k} ref={el => (refs.current[li * 3 + k] = el)} position={[X0, y, 0.32]} raycast={noRaycast}>
                    <boxGeometry args={[0.42, 0.42, 0.42]} />
                    <Glass color={l.color} hot={hot || sel} intensity={1.1} />
                  </mesh>
                ))}
              </group>
            );
          })}
          <HitBox size={[X1 - X0 + 2.6, 5.2, 0.8]} position={[(X0 + X1) / 2 - 1.3, 0.4, 0]} />
          {(hot || sel) && <Outline size={[X1 - X0, 5.0, 0.5]} position={[(X0 + X1) / 2, 0.4, 0]} color={C.react} />}
        </>
      )}
    </Hotspot>
  );
}

function FrameBar() {
  // two 16.7 ms frames: work slice · yield · work slice · yield · browser turn
  const frame = [
    ['work', 1.7],
    ['gap', 0.25],
    ['work', 1.7],
    ['gap', 0.25],
    ['browser', 2.15],
  ];
  const pieces = [];
  let x = X0;
  for (let f = 0; f < 2; f++) {
    for (const [kind, w] of frame) {
      pieces.push({ kind, cx: x + w / 2, w });
      x += w;
    }
  }
  return (
    <group position={[0, 4.55, 0]}>
      <Hotspot id="slicing">
        {(hot, sel) => (
          <>
            {pieces
              .filter(p => p.kind === 'work')
              .map(p => (
                <group key={p.cx} position={[p.cx, 0, 0]}>
                  <RoundedBox args={[p.w - 0.04, 0.7, 0.45]} radius={0.1} raycast={noRaycast}>
                    <CardMat color={C.violet} level={hot || sel ? CARD.hot : 0.3} />
                  </RoundedBox>
                  <FaceText position={[0, 0, 0.24]} size={0.3}>~5 ms</FaceText>
                </group>
              ))}
            <HitBox size={[X1 - X0, 0.8, 0.5]} position={[(X0 + X1) / 2, 0, 0]} />
            <Label position={[(X0 + X1) / 2, 0.75, 0]} title="Time slicing" sub="two 16.7 ms frames" subColor="#e3dcff" />
          </>
        )}
      </Hotspot>
      <Hotspot id="yield">
        {(hot, sel) => (
          <>
            {pieces
              .filter(p => p.kind === 'browser')
              .map(p => (
                <group key={p.cx} position={[p.cx, 0, 0]}>
                  <RoundedBox args={[p.w - 0.04, 0.7, 0.45]} radius={0.1} raycast={noRaycast}>
                    <CardMat color={C.green} level={hot || sel ? CARD.hot : 0.3} />
                  </RoundedBox>
                  <FaceText position={[0, 0, 0.24]} size={0.28}>input · paint</FaceText>
                </group>
              ))}
            {pieces
              .filter(p => p.kind === 'gap')
              .map(p => (
                <FaceText key={p.cx} position={[p.cx, -0.62, 0.1]} size={0.28} color="#a7f3d0">yield</FaceText>
              ))}
          </>
        )}
      </Hotspot>
    </group>
  );
}

function Batching() {
  const cubes = useRef([]);
  const merged = useRef();
  useFrame(({ clock }) => {
    const u = (clock.getElapsedTime() % 3.2) / 3.2;
    const k = THREE.MathUtils.smoothstep(u, 0.2, 0.65);
    cubes.current.forEach((c, i) => {
      if (!c) return;
      c.position.set(THREE.MathUtils.lerp(-1.1 + i * 1.1, 0, k), THREE.MathUtils.lerp(0.7, -0.5, k), 0);
      c.scale.setScalar(k > 0.97 ? 0.001 : 1);
    });
    if (merged.current) merged.current.scale.setScalar(k > 0.97 ? 1 : 0.001);
  });
  return (
    <Hotspot id="batching" position={[-11.2, 3.3, 0]}>
      {(hot, sel) => (
        <>
          {['setA', 'setB', 'setC'].map((n, i) => (
            <group key={n} ref={el => (cubes.current[i] = el)}>
              <mesh raycast={noRaycast}>
                <boxGeometry args={[0.55, 0.55, 0.55]} />
                <Glass color={C.react} hot={hot || sel} intensity={1} />
              </mesh>
              <FaceText position={[0, 0.55, 0]} size={0.28} color={INK}>{`${n}()`}</FaceText>
            </group>
          ))}
          <group ref={merged} position={[0, -0.5, 0]} scale={0.001}>
            <mesh raycast={noRaycast}>
              <boxGeometry args={[0.95, 0.95, 0.95]} />
              <Glass color={C.green} hot={hot || sel} intensity={1.2} />
            </mesh>
            <FaceText position={[0, -0.8, 0]} size={0.3} color="#a7f3d0">1 render</FaceText>
          </group>
          <HitBox size={[3.2, 2.8, 1]} position={[0, 0, 0]} />
          <Label position={[0, 1.6, 0]} title="Automatic batching" />
        </>
      )}
    </Hotspot>
  );
}

function Expiry() {
  const hand = useRef();
  useFrame((_, dt) => {
    if (hand.current) hand.current.rotation.z -= dt * 1.2;
  });
  return (
    <Hotspot id="expiry" position={[-11.2, -1.3, 0]}>
      {(hot, sel) => (
        <>
          <mesh raycast={noRaycast}>
            <torusGeometry args={[0.85, 0.07, 10, 48]} />
            <Glass color={C.yellow} hot={hot || sel} intensity={0.8} />
          </mesh>
          <group ref={hand}>
            <mesh position={[0, 0.38, 0]} raycast={noRaycast}>
              <boxGeometry args={[0.08, 0.76, 0.08]} />
              <meshBasicMaterial color={C.yellow} />
            </mesh>
          </group>
          <FaceText position={[0, -1.2, 0]} size={0.3} color="#ffe7a3">expires → sync</FaceText>
          <HitBox size={[2.4, 2.6, 0.8]} position={[0, -0.2, 0]} />
          <Label position={[0, 1.0, 0]} title="Starvation guard" />
        </>
      )}
    </Hotspot>
  );
}

export default function SchedulerScene() {
  return (
    <group>
      <Lanes />
      <Block id="preempt" position={[7.3, 0.4, 0]} size={[2.6, 5.0, 1.2]} color={C.react} text={'Scheduler\n\nhighest\nlane first\n\nurgent work\ninterrupts'} textSize={0.3} label="Work loop" labelPos={[0, 2.8, 0]} />
      <FrameBar />
      <Orb id="yield" position={[8.0, 4.55, 0.4]} color={C.green} r={0.35} label="MessageChannel" sub="post → new task" labelPos={[0, 0.65, 0]} />
      <Flow points={[[5.7, 4.75, 0.4], [6.9, 5.2, 0.6], [7.65, 4.75, 0.4]]} color={C.green} count={2} speed={0.6} size={0.08} />
      <Batching />
      <Expiry />
    </group>
  );
}
