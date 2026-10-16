// Reconciliation: the previous tree (left) and the next tree (right).
// Keys match list items across renders (green particles), `b` is removed,
// `d` inserted, the heading's text changed, and the memoized Sidebar is skipped.
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { Block, C, FaceText, Flow, Glass, HitBox, Hotspot, Label, Wire, noRaycast } from '../primitives.jsx';
export const pose = { pos: [0, 1.5, 22], tgt: [0, 0.6, 0], span: 21, height: 9.5 };

const L = -6.5;
const R = 6.5;
const POS = { root: [0, 3.0], h1: [-2.6, 1.4], ul: [0, 1.4], side: [2.6, 1.4], li0: [-1.5, -0.4], li1: [0, -0.4], li2: [1.5, -0.4] };

function TNode({ at, label, color, hot, pulse, dim }) {
  const mat = useRef();
  useFrame(({ clock }) => {
    if (mat.current && pulse) mat.current.opacity = 0.45 + 0.5 * (0.5 + 0.5 * Math.sin(clock.getElapsedTime() * 3));
  });
  return (
    <group position={[at[0], at[1], 0]}>
      <RoundedBox args={[1.95, 0.66, 0.45]} radius={0.12} raycast={noRaycast}>
        <meshStandardMaterial
          ref={mat}
          color="#0b1226"
          emissive={color}
          emissiveIntensity={hot ? 1.4 : dim ? 0.25 : 0.65}
          roughness={0.35}
          transparent={!!pulse || dim}
          opacity={dim ? 0.55 : 1}
        />
      </RoundedBox>
      <FaceText position={[0, 0, 0.24]} size={0.22} color={dim ? '#9aa3bd' : '#ffffff'}>
        {label}
      </FaceText>
    </group>
  );
}

const at = (base, key) => [base + POS[key][0], POS[key][1]];

function Edges3({ base }) {
  const e = [
    ['root', 'h1'],
    ['root', 'ul'],
    ['root', 'side'],
    ['ul', 'li0'],
    ['ul', 'li1'],
    ['ul', 'li2'],
  ];
  return e.map(([a, b]) => (
    <Wire key={a + b} points={[[...at(base, a), -0.1], [...at(base, b), -0.1]]} color="#5d6a92" opacity={0.6} />
  ));
}

export default function ReconcileScene() {
  return (
    <group>
      <Block id="vdom" position={[L, 4.6, 0]} size={[4.6, 0.7, 0.3]} color={C.grey} text="Previous render" textSize={0.28} intensity={0.35} />
      <Block id="vdom" position={[R, 4.6, 0]} size={[4.6, 0.7, 0.3]} color={C.react} text="Next render" textSize={0.28} intensity={0.45} />
      <Block id="remount" position={[0, 4.6, 0]} size={[6.6, 0.7, 0.3]} color={C.pink} text="key={userId} changed → remount, fresh state" textSize={0.22} intensity={0.45} />
      <Edges3 base={L} />
      <Edges3 base={R} />

      <Hotspot id="type">
        {hot => (
          <>
            <TNode at={at(L, 'root')} label="<div>" color={C.react} hot={hot} />
            <TNode at={at(R, 'root')} label="<div>" color={C.react} hot={hot} />
            <HitBox size={[2.1, 0.8, 0.6]} position={[...at(L, 'root'), 0]} />
            <HitBox size={[2.1, 0.8, 0.6]} position={[...at(R, 'root'), 0]} />
          </>
        )}
      </Hotspot>
      <Wire points={[[...at(L, 'root'), 0.3], [...at(R, 'root'), 0.3]]} color={C.green} dashed opacity={0.45} />
      <FaceText position={[0, 3.25, 0.3]} size={0.2} color="#a7f3d0">same type → keep</FaceText>

      <Hotspot id="props">
        {hot => (
          <>
            <TNode at={at(L, 'h1')} label="<h1> Todos (2)" color={C.react} hot={hot} />
            <TNode at={at(R, 'h1')} label="<h1> Todos (3)" color={C.yellow} hot={hot} pulse />
            <HitBox size={[2.1, 0.8, 0.6]} position={[...at(L, 'h1'), 0]} />
            <HitBox size={[2.1, 0.8, 0.6]} position={[...at(R, 'h1'), 0]} />
          </>
        )}
      </Hotspot>

      <Hotspot id="bailout">
        {hot => (
          <>
            <TNode at={at(L, 'side')} label="<Sidebar>" color={C.react} hot={hot} />
            <TNode at={at(R, 'side')} label="memo · skipped" color={C.grey} hot={hot} dim />
            <HitBox size={[2.1, 0.8, 0.6]} position={[...at(L, 'side'), 0]} />
            <HitBox size={[2.1, 0.8, 0.6]} position={[...at(R, 'side'), 0]} />
          </>
        )}
      </Hotspot>

      <Hotspot id="keys">
        {hot => (
          <>
            <TNode at={at(L, 'ul')} label="<ul>" color={C.react} hot={hot} />
            <TNode at={at(R, 'ul')} label="<ul>" color={C.react} hot={hot} />
            <TNode at={at(L, 'li0')} label="li key=a" color={C.react} hot={hot} />
            <TNode at={at(L, 'li1')} label="li key=b" color={C.red} hot={hot} pulse />
            <TNode at={at(L, 'li2')} label="li key=c" color={C.cyan} hot={hot} />
            <TNode at={at(R, 'li0')} label="li key=c" color={C.cyan} hot={hot} />
            <TNode at={at(R, 'li1')} label="li key=a" color={C.react} hot={hot} />
            <TNode at={at(R, 'li2')} label="li key=d" color={C.green} hot={hot} pulse />
            <HitBox size={[5.2, 2.8, 0.6]} position={[L, 0.5, 0]} />
            <HitBox size={[5.2, 2.8, 0.6]} position={[R, 0.5, 0]} />
          </>
        )}
      </Hotspot>
      {/* key matches across renders */}
      <Flow points={[[...at(L, 'li0'), 0.3], [0, -1.6, 2.6], [...at(R, 'li1'), 0.3]]} color={C.green} count={3} speed={0.18} />
      <Flow points={[[...at(L, 'li2'), 0.3], [0, -1.1, 1.8], [...at(R, 'li0'), 0.3]]} color={C.cyan} count={3} speed={0.18} offset={0.4} />
      <FaceText position={[L, -1.3, 0.3]} size={0.2} color="#ffb3bd">b removed</FaceText>
      <FaceText position={[R + 1.5, -1.3, 0.3]} size={0.2} color="#a7f3d0">d inserted</FaceText>
      <FaceText position={[R - 1.5, -1.3, 0.3]} size={0.2} color="#bdefff">c moved</FaceText>

      <Hotspot id="patch" position={[0, -3.4, 0]}>
        {hot => (
          <>
            {[
              ['UPDATE  h1 text', C.yellow],
              ['MOVE  li c', C.cyan],
              ['REMOVE  li b', C.red],
              ['INSERT  li d', C.green],
            ].map(([t, c], i) => (
              <group key={t} position={[-6.6 + i * 4.4, 0, 0]}>
                <RoundedBox args={[3.8, 0.75, 0.35]} radius={0.12} raycast={noRaycast}>
                  <Glass color={c} hot={hot} intensity={0.5} />
                </RoundedBox>
                <FaceText position={[0, 0, 0.19]} size={0.26}>{t}</FaceText>
              </group>
            ))}
            <HitBox size={[17.4, 0.9, 0.5]} />
            <Label position={[0, 0.6, 0]} title="Commit list" sub="only these four operations touch the DOM" subColor={C.react} color={hot ? '#fff' : '#dfe6ff'} size={0.38} />
          </>
        )}
      </Hotspot>
    </group>
  );
}
