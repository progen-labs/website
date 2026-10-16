// Commit & effects: a timeline with a playhead. Above it, each phase acts out
// what it does — render wobbles (it may restart), mutation swaps DOM boxes,
// layout effects measure, the screen flashes on paint, effects pop after.
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Block, Border, C, CARD, Cage, CardMat, FaceText, Glass, HitBox, Hotspot, INK, Label, Outline, Wire, noRaycast } from '../primitives.jsx';

export const pose = { pos: [0, 1.4, 21], tgt: [0, -0.3, 0], span: 22, height: 9.6 };

const START = -10.5;
const END = 10.5;
const PERIOD = 10;
const SEGS = [
  { id: 'render', from: -10.5, to: -3.2, color: C.blue, label: 'render (interruptible)' },
  { id: 'before', from: -3.1, to: -1.7, color: C.violet, label: 'before' },
  { id: 'mutation', from: -1.6, to: 1.6, color: C.pink, label: 'mutation' },
  { id: 'layout', from: 1.7, to: 3.9, color: C.amber, label: 'layout fx' },
  { id: 'paint', from: 4.0, to: 6.0, color: C.green, label: 'paint' },
  { id: 'passive', from: 6.1, to: 10.5, color: C.cyan, label: 'passive fx (useEffect)' },
];
const TRACK_Y = -2.6;

const phaseAt = x => SEGS.find(s => x >= s.from && x <= s.to + 0.1)?.id;

function Segment({ s }) {
  const w = s.to - s.from;
  const cx = (s.from + s.to) / 2;
  // the render phase is drawn as slices with gaps: it yields and can restart
  const slices = s.id === 'render' ? [[-10.5, -8.3], [-8.0, -5.8], [-5.5, -3.2]] : [[s.from, s.to]];
  return (
    <Hotspot id={s.id}>
      {(hot, sel) => (
        <>
          {slices.map(([a, b]) => (
            <RoundedBox key={a} args={[b - a, 0.8, 0.6]} radius={0.12} position={[(a + b) / 2, TRACK_Y, 0]} raycast={noRaycast}>
              <CardMat color={s.color} level={hot || sel ? CARD.hot : 0.26} />
            </RoundedBox>
          ))}
          <FaceText position={[cx, TRACK_Y, 0.32]} size={w < 2 ? 0.28 : 0.3}>
            {s.label}
          </FaceText>
          <HitBox size={[w, 0.9, 0.7]} position={[cx, TRACK_Y, 0]} />
          {(hot || sel) && <Outline size={[w, 0.8, 0.6]} position={[cx, TRACK_Y, 0]} color={s.color} />}
        </>
      )}
    </Hotspot>
  );
}

function Stage() {
  const head = useRef();
  const headLabel = useRef();
  const fn = useRef();
  const dom = useRef([]);
  const ruler = useRef();
  const screen = useRef();
  const bubbles = useRef([]);
  const snap = useRef();
  const last = useRef('');

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const u = (t % PERIOD) / PERIOD;
    const x = START + u * (END - START);
    const ph = phaseAt(x) || 'render';
    if (head.current) head.current.position.x = x;
    if (ph !== last.current && headLabel.current) {
      last.current = ph;
      headLabel.current.text = SEGS.find(s => s.id === ph).label.split(' (')[0];
      headLabel.current.sync();
    }
    // render: the component function wobbles while it runs
    if (fn.current) fn.current.rotation.z = ph === 'render' ? Math.sin(t * 9) * 0.05 : 0;
    // before mutation: camera "snapshot" blinks
    if (snap.current) snap.current.scale.setScalar(ph === 'before' ? 1.25 : 1);
    // mutation: DOM boxes change
    const m = ph === 'mutation' ? THREE.MathUtils.clamp((x + 1.6) / 3.2, 0, 1) : x > 1.6 ? 1 : 0;
    dom.current.forEach((g, i) => {
      if (!g) return;
      if (i === 1) g.scale.setScalar(1 - m * 0.999); // removed
      if (i === 4) g.scale.setScalar(0.001 + m); // inserted
      if (i === 2) g.children[0].material.emissive.set(m > 0.5 ? C.yellow : C.react); // updated
    });
    // layout effect: ruler measures
    if (ruler.current) ruler.current.scale.x = ph === 'layout' ? THREE.MathUtils.clamp((x - 1.7) / 2.2, 0.02, 1) : x > 3.9 ? 1 : 0.02;
    // paint: screen flashes
    if (screen.current) screen.current.material.opacity = ph === 'paint' ? 0.55 : 0.06;
    // passive: effect bubbles rise
    bubbles.current.forEach((b, i) => {
      if (!b) return;
      const k = ph === 'passive' ? THREE.MathUtils.clamp((x - 6.1 - i * 0.6) / 1.6, 0, 1) : 0;
      b.position.y = -0.7 + k * 1.5;
      b.scale.setScalar(k > 0 ? 1 : 0.001);
    });
  });

  return (
    <>
      {/* playhead */}
      <group ref={head} position={[START, 0, 0.5]}>
        <mesh position={[0, TRACK_Y + 0.3, 0]} raycast={noRaycast}>
          <boxGeometry args={[0.06, 2.2, 0.06]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <Text ref={headLabel} position={[0, TRACK_Y - 0.95, 0]} fontSize={0.32} color="#ffffff" anchorX="center" anchorY="top" outlineWidth={0.04} outlineColor="#05060e" raycast={noRaycast}>
          render
        </Text>
      </group>

      {/* render: the component function */}
      <Hotspot id="render" position={[-7, 1.4, 0]}>
        {(hot, sel) => (
          <>
            <group ref={fn}>
              <RoundedBox args={[4.4, 1.3, 0.3]} radius={0.12} raycast={noRaycast}>
                <CardMat color={C.blue} level={hot || sel ? CARD.hot : CARD.idle} />
              </RoundedBox>
              <Border size={[4.4, 1.3, 0.3]} color={C.blue} width={hot || sel ? 2.4 : 1.4} />
              <FaceText position={[0, 0, 0.17]} size={0.34}>{'App(props) → <JSX />'}</FaceText>
            </group>
            <HitBox size={[4.6, 1.5, 0.5]} />
            <Label position={[0, 0.85, 0]} title="Calls your components" sub="pure · may run twice" subColor="#b9cbff" />
          </>
        )}
      </Hotspot>

      {/* before mutation: snapshot */}
      <Hotspot id="before" position={[-2.4, 1.4, 0]}>
        {(hot, sel) => (
          <>
            <group ref={snap}>
              <mesh raycast={noRaycast}>
                <boxGeometry args={[1.0, 0.7, 0.5]} />
                <Glass color={C.violet} hot={hot || sel} intensity={0.7} />
              </mesh>
              <mesh position={[0, 0, 0.3]} rotation={[Math.PI / 2, 0, 0]} raycast={noRaycast}>
                <cylinderGeometry args={[0.22, 0.22, 0.2, 24]} />
                <meshStandardMaterial color="#0b1226" metalness={0.8} roughness={0.2} />
              </mesh>
            </group>
            <HitBox size={[1.4, 1.2, 0.8]} />
            <Label position={[0, 0.55, 0]} title="snapshot" />
          </>
        )}
      </Hotspot>

      {/* mutation: a little DOM */}
      <Hotspot id="mutation" position={[0, 1.4, 0]}>
        {(hot, sel) => (
          <>
            {[
              [-0.7, 0.4],
              [0.7, 0.4],
              [-0.7, -0.4],
              [0.7, -0.4],
              [0, -1.2],
            ].map(([x, y], i) => (
              <group key={i} ref={el => (dom.current[i] = el)} position={[x, y, 0]} scale={i === 4 ? 0.001 : 1}>
                <mesh raycast={noRaycast}>
                  <boxGeometry args={[1.2, 0.6, 0.3]} />
                  <meshStandardMaterial color="#0b1226" emissive={i === 4 ? C.green : i === 1 ? C.red : C.react} emissiveIntensity={hot || sel ? 1.2 : 0.6} />
                </mesh>
              </group>
            ))}
            <HitBox size={[3, 2.8, 0.6]} position={[0, -0.3, 0]} />
            <Label position={[0, 0.8, 0]} title="DOM changes" />
          </>
        )}
      </Hotspot>

      {/* layout effect: ruler */}
      <Hotspot id="layout" position={[2.8, 1.4, 0]}>
        {(hot, sel) => (
          <>
            <group ref={ruler} position={[-1, 0, 0]}>
              <mesh position={[1, 0, 0]} raycast={noRaycast}>
                <boxGeometry args={[2, 0.24, 0.24]} />
                <Glass color={C.amber} hot={hot || sel} intensity={1} />
              </mesh>
            </group>
            <FaceText position={[0, -0.5, 0]} size={0.3} color="#ffe0b8">measure DOM</FaceText>
            <HitBox size={[2.4, 1.2, 0.6]} />
            <Label position={[0, 0.45, 0]} title="layout fx" />
          </>
        )}
      </Hotspot>

      {/* paint: the screen */}
      <Hotspot id="paint" position={[5.2, 1.4, 0]}>
        {(hot, sel) => (
          <>
            <Cage size={[2.0, 1.4, 0.2]} color={C.green} />
            <mesh ref={screen} raycast={noRaycast}>
              <planeGeometry args={[1.9, 1.3]} />
              <meshBasicMaterial color={C.green} transparent opacity={0.06} />
            </mesh>
            <HitBox size={[2.2, 1.6, 0.4]} />
            <Label position={[0, 0.85, 0]} title="frame" />
          </>
        )}
      </Hotspot>

      {/* passive effects: bubbles */}
      <Hotspot id="passive" position={[8.3, 1.4, 0]}>
        {(hot, sel) => (
          <>
            {['subscribe', 'log', 'fetch'].map((t, i) => (
              <group key={t} ref={el => (bubbles.current[i] = el)} position={[-1.35 + i * 1.35, -0.7, 0]} scale={0.001}>
                <mesh raycast={noRaycast}>
                  <sphereGeometry args={[0.38, 20, 20]} />
                  <Glass color={C.cyan} hot={hot || sel} intensity={1} />
                </mesh>
                <FaceText position={[0, -0.65, 0]} size={0.28} color={INK}>{t}</FaceText>
              </group>
            ))}
            <HitBox size={[3.4, 2.6, 0.8]} position={[0, 0, 0]} />
            <Label position={[0, 1.25, 0]} title="effects run" />
          </>
        )}
      </Hotspot>
    </>
  );
}

export default function CommitScene() {
  return (
    <group>
      {SEGS.map(s => (
        <Segment key={s.id} s={s} />
      ))}
      {/* commit bracket */}
      <Wire points={[[-3.1, -1.85, 0], [-3.1, -1.65, 0], [3.9, -1.65, 0], [3.9, -1.85, 0]]} color={C.pink} opacity={0.6} />
      <FaceText position={[0.4, -1.4, 0]} size={0.3} color="#ffc8f0">commit — synchronous, uninterruptible</FaceText>
      <FaceText position={[-6.85, -1.5, 0]} size={0.3} color="#c8d6ff">yields between slices</FaceText>
      <Block id="strict" position={[-6.9, -4.55, 0]} size={[8.0, 0.78, 0.3]} color={C.yellow} text="Strict Mode (dev): render ×2, effects re-run" textSize={0.3} />
      <Stage />
    </group>
  );
}
