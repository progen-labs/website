// V8 & the event loop. Calls leave the stack for the Web APIs (violet),
// come back as tasks (amber) or microtasks (green), and the loop feeds them
// to the call stack one at a time. The stack pushes and pops live.
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Arrow, Block, Border, C, CARD, CardMat, FaceText, Flow, Glass, HitBox, Hotspot, INK, INK_DIM, Label, Outline, Wire, noRaycast } from '../primitives.jsx';

export const pose = { pos: [0, 1.5, 22], tgt: [0, 0, 0], span: 24, height: 11.5 };

function V8Pipeline() {
  const stages = [
    ['Parser', 'source → AST', C.blue],
    ['Ignition', 'bytecode', C.green],
    ['TurboFan', 'optimized code', C.amber],
  ];
  return (
    <Hotspot id="v8" position={[-6.2, 4.4, 0]}>
      {(hot, sel) => (
        <>
          {stages.map(([n, s, c], i) => (
            <group key={n} position={[-3.3 + i * 3.3, 0, 0]}>
              <mesh raycast={noRaycast}>
                <boxGeometry args={[2.7, 1.15, 0.8]} />
                <CardMat color={c} level={hot || sel ? CARD.hot : CARD.idle} />
              </mesh>
              <Border size={[2.7, 1.15, 0.8]} color={c} />
              <FaceText position={[0, 0.2, 0.42]} size={0.34}>{n}</FaceText>
              <FaceText position={[0, -0.25, 0.42]} size={0.28} color={INK_DIM}>{s}</FaceText>
            </group>
          ))}
          <Arrow from={[-1.95, 0, 0.3]} to={[-1.35, 0, 0.3]} color="#cfe0ff" head={0.22} />
          <Arrow from={[1.35, 0, 0.3]} to={[1.95, 0, 0.3]} color="#cfe0ff" head={0.22} />
          <Arrow from={[3.0, -0.75, 0.3]} to={[0.4, -0.75, 0.3]} color={C.red} dashed head={0.2} />
          <FaceText position={[1.7, -1.1, 0.3]} size={0.3} color={C.red}>deopt</FaceText>
          <HitBox size={[10, 2.4, 1.2]} position={[0, -0.2, 0]} />
          {(hot || sel) && <Outline size={[9.6, 2.0, 1.0]} position={[0, -0.2, 0]} color={C.green} />}
          <Label position={[0, 0.85, 0]} title="V8 engine" sub="parse → interpret → optimize" subColor={C.green} color={hot || sel ? '#fff' : '#dfe6ff'} />
        </>
      )}
    </Hotspot>
  );
}

function Heap() {
  const dots = useMemo(() => {
    const rnd = (s => () => ((s = (s * 9301 + 49297) % 233280) / 233280))(7);
    return Array.from({ length: 24 }, (_, i) => {
      const young = i < 14;
      return { young, p: [young ? -2.1 + rnd() * 1.8 : 0.4 + rnd() * 1.8, -0.7 + rnd() * 1.4, -0.3 + rnd() * 0.6], r: young ? 0.12 : 0.18 };
    });
  }, []);
  const refs = useRef([]);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    refs.current.forEach((m, i) => {
      if (!m || !dots[i].young) return;
      // young objects are born and collected
      const life = (t * 0.5 + i * 0.37) % 1;
      m.scale.setScalar(life < 0.85 ? 1 : 0.001);
    });
  });
  return (
    <Hotspot id="heap" position={[6.6, 4.3, 0]}>
      {(hot, sel) => (
        <>
          {dots.map((d, i) => (
            <mesh key={i} ref={el => (refs.current[i] = el)} position={d.p} raycast={noRaycast}>
              <sphereGeometry args={[d.r, 14, 14]} />
              <Glass color={d.young ? C.cyan : C.violet} hot={hot || sel} intensity={0.9} />
            </mesh>
          ))}
          <mesh position={[0.1, 0, 0]} raycast={noRaycast}>
            <planeGeometry args={[0.04, 1.8]} />
            <meshBasicMaterial color="#5b6584" />
          </mesh>
          <FaceText position={[-1.2, -1.2, 0]} size={0.3} color={INK}>young gen</FaceText>
          <FaceText position={[1.3, -1.2, 0]} size={0.3} color={INK}>old gen</FaceText>
          <HitBox size={[5, 2.8, 1.6]} />
          {(hot || sel) && <Outline size={[4.8, 2.4, 1.2]} color={C.violet} />}
          <Label position={[0, 1.25, 0]} title="Heap & GC" sub="allocate · scavenge · compact" subColor={C.violet} color={hot || sel ? '#fff' : '#dfe6ff'} />
        </>
      )}
    </Hotspot>
  );
}

const FRAMES = ['main()', 'onClick()', 'render()', 'format()'];
const DEPTH = [1, 2, 3, 4, 4, 3, 2, 1];

function CallStack() {
  const refs = useRef([]);
  useFrame(({ clock }) => {
    const n = DEPTH[Math.floor(clock.getElapsedTime() / 0.9) % DEPTH.length];
    refs.current.forEach((g, i) => {
      if (!g) return;
      const s = THREE.MathUtils.lerp(g.scale.x, i < n ? 1 : 0.001, 0.2);
      g.scale.setScalar(s);
    });
  });
  return (
    <Hotspot id="stack" position={[-7.6, -2.4, 0]}>
      {(hot, sel) => (
        <>
          {FRAMES.map((f, i) => (
            <group key={f} ref={el => (refs.current[i] = el)} position={[0, -0.9 + i * 0.68, 0]}>
              <mesh raycast={noRaycast}>
                <boxGeometry args={[3.0, 0.6, 0.9]} />
                <CardMat color={C.blue} level={(hot || sel ? CARD.hot : 0.16) + i * 0.05} />
              </mesh>
              <Border size={[3.0, 0.6, 0.9]} color={C.blue} />
              <FaceText position={[0, 0, 0.46]} size={0.32}>{f}</FaceText>
            </group>
          ))}
          <mesh position={[0, -1.32, 0]} raycast={noRaycast}>
            <boxGeometry args={[3.6, 0.12, 1.2]} />
            <meshStandardMaterial color="#2a3456" />
          </mesh>
          <HitBox size={[3.6, 3.6, 1.2]} position={[0, 0.3, 0]} />
          {(hot || sel) && <Outline size={[3.4, 3.2, 1.0]} position={[0, 0.3, 0]} color={C.blue} />}
          <Label position={[0, 2.2, 0]} title="Call stack" sub="one frame at a time" subColor={C.blue} color={hot || sel ? '#fff' : '#dfe6ff'} />
        </>
      )}
    </Hotspot>
  );
}

function Conveyor({ id, y, color, round, speed, title, sub }) {
  const refs = useRef([]);
  const N = 5;
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;
    refs.current.forEach((m, i) => {
      if (m) m.position.x = 3.0 - (((t + i / N) % 1) * 6.0);
    });
  });
  return (
    <Hotspot id={id} position={[1.2, y, 0]}>
      {(hot, sel) => (
        <>
          <mesh position={[0, -0.32, 0]} raycast={noRaycast}>
            <boxGeometry args={[6.6, 0.16, 1.1]} />
            <Glass color={color} hot={hot || sel} intensity={0.3} />
          </mesh>
          {Array.from({ length: N }, (_, i) => (
            <mesh key={i} ref={el => (refs.current[i] = el)} raycast={noRaycast}>
              {round ? <sphereGeometry args={[0.24, 16, 16]} /> : <boxGeometry args={[0.55, 0.42, 0.55]} />}
              <Glass color={color} hot={hot || sel} intensity={1.1} />
            </mesh>
          ))}
          <HitBox size={[6.8, 1.0, 1.2]} />
          {(hot || sel) && <Outline size={[6.6, 0.9, 1.1]} color={color} />}
          <Label position={[0, 0.5, 0]} title={title} sub={sub} subColor={color} color={hot || sel ? '#fff' : '#dfe6ff'} size={0.34} />
        </>
      )}
    </Hotspot>
  );
}

function Loop() {
  const ref = useRef();
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.z -= dt * 1.4;
  });
  return (
    <Hotspot id="loop" position={[-3.5, -3.4, 0.6]}>
      {(hot, sel) => (
        <>
          <group ref={ref}>
            <mesh raycast={noRaycast}>
              <torusGeometry args={[0.95, 0.09, 12, 48, Math.PI * 1.7]} />
              <Glass color={C.amber} hot={hot || sel} intensity={1.2} />
            </mesh>
            <mesh position={[0.95, 0, 0]} rotation={[0, 0, Math.PI]} raycast={noRaycast}>
              <coneGeometry args={[0.2, 0.42, 14]} />
              <Glass color={C.amber} hot={hot || sel} intensity={1.2} />
            </mesh>
          </group>
          <HitBox size={[2.4, 2.4, 1]} />
          <Label position={[0, -1.6, 0]} title="Event loop" sub="task → microtasks → render" subColor={C.amber} color={hot || sel ? '#fff' : '#dfe6ff'} size={0.36} />
        </>
      )}
    </Hotspot>
  );
}

export default function RuntimeScene() {
  return (
    <group>
      <V8Pipeline />
      <Heap />
      <Block id="render-steps" position={[0.8, 1.7, 0]} size={[5.8, 0.85, 0.5]} color={C.cyan} text="rAF → style → layout → paint" textSize={0.3} label="Render steps" sub="between tasks, ~every 16.7 ms" labelPos={[0, 0.75, 0]} />
      <CallStack />
      <Block id="webapis" position={[7.8, -1.6, 0]} size={[4.4, 2.6, 1]} color={C.violet} label="Web APIs" sub="handled by the browser" labelPos={[0, 1.55, 0]}>
        {['setTimeout(cb, 0)', 'fetch("/api")', 'click listener'].map((t, i) => (
          <group key={t} position={[0, 0.65 - i * 0.62, 0.52]}>
            <mesh raycast={noRaycast}>
              <boxGeometry args={[3.8, 0.52, 0.06]} />
              <CardMat color={C.violet} level={0.32} />
            </mesh>
            <FaceText position={[0, 0, 0.05]} size={0.3}>{t}</FaceText>
          </group>
        ))}
      </Block>
      <Conveyor id="microtasks" y={-2.2} color={C.green} round speed={0.32} title="Microtask queue" sub="promises — drained fully" />
      <Conveyor id="tasks" y={-4.4} color={C.amber} speed={0.14} title="Task queue" sub="timers, events — one per turn" />
      <Loop />

      {/* flows */}
      <Flow points={[[-6.0, -0.6, 0.5], [0.6, 0.2, 1.0], [5.5, -0.7, 0.5]]} color={C.violet} count={3} speed={0.2} />
      <Flow points={[[6.2, -2.95, 0.6], [5.8, -4.2, 0.9], [4.4, -4.6, 0.6]]} color={C.amber} count={2} speed={0.3} />
      <Flow points={[[5.6, -2.2, 0.6], [4.4, -2.4, 0.6]]} color={C.green} count={2} speed={0.5} />
      <Flow points={[[-2.0, -4.6, 0.6], [-3.5, -4.6, 1.2], [-5.9, -3.2, 0.6]]} color={C.amber} count={2} speed={0.3} />
      <Flow points={[[-2.0, -2.4, 0.6], [-4.0, -2.0, 1.0], [-5.9, -2.0, 0.6]]} color={C.green} count={2} speed={0.45} />
      <Wire points={[[-3.5, -2.3, 0.6], [-2.0, 1.25, 0.2]]} color={C.cyan} dashed opacity={0.5} />
    </group>
  );
}
