// Reconciliation: the previous tree (left) and the next tree (right).
// Keys match list items across renders (green particles), `b` is removed,
// `d` inserted, the heading's text changed, and the memoized Sidebar is skipped.
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { Block, Border, C, CARD, CardMat, FaceText, Flow, HitBox, Hotspot, INK, INK_DIM, Label, Wire, mix, noRaycast, paintCard, SURFACE } from '../primitives.jsx';
export const pose = { pos: [0, 1.5, 22], tgt: [0, 0.5, 0], span: 21.5, height: 10 };

const L = -6.5;
const R = 6.5;
const POS = { root: [0, 3.0], h1: [-2.55, 1.4], ul: [0, 1.4], side: [2.55, 1.4], li0: [-2.45, -0.4], li1: [0, -0.4], li2: [2.45, -0.4] };
const NW = 2.3; // node width

function TNode({ at, label, color, hot, pulse, dim }) {
  const mat = useRef();
  useFrame(({ clock }) => {
    // pulse the card tint (never brighter than the contrast-safe maximum)
    if (pulse && !hot) paintCard(mat.current, color, 0.16 + 0.26 * (0.5 + 0.5 * Math.sin(clock.getElapsedTime() * 3)));
  });
  const level = hot ? CARD.hot : dim ? CARD.dim : CARD.idle;
  return (
    <group position={[at[0], at[1], 0]}>
      <RoundedBox args={[NW, 0.66, 0.45]} radius={0.12} raycast={noRaycast}>
        <CardMat color={color} level={level} matRef={mat} />
      </RoundedBox>
      <Border size={[NW, 0.66, 0.45]} color={hot || pulse ? color : mix(SURFACE, color, dim ? 0.4 : 0.7)} width={hot || pulse ? 2.2 : 1.3} />
      <FaceText position={[0, 0, 0.24]} size={0.29} color={dim ? INK_DIM : INK}>
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
      <Block id="vdom" position={[L, 4.6, 0]} size={[4.6, 0.72, 0.3]} color={C.grey} text="Previous render" textSize={0.32} />
      <Block id="vdom" position={[R, 4.6, 0]} size={[4.6, 0.72, 0.3]} color={C.react} text="Next render" textSize={0.32} />
      <Block id="remount" position={[0, 4.6, 0]} size={[6.4, 0.72, 0.3]} color={C.pink} text="key={userId} changed → remount" textSize={0.3} />
      <Edges3 base={L} />
      <Edges3 base={R} />

      <Hotspot id="type">
        {hot => (
          <>
            <TNode at={at(L, 'root')} label="<div>" color={C.react} hot={hot} />
            <TNode at={at(R, 'root')} label="<div>" color={C.react} hot={hot} />
            <HitBox size={[NW + 0.1, 0.8, 0.6]} position={[...at(L, 'root'), 0]} />
            <HitBox size={[NW + 0.1, 0.8, 0.6]} position={[...at(R, 'root'), 0]} />
          </>
        )}
      </Hotspot>
      <Wire points={[[...at(L, 'root'), 0.3], [...at(R, 'root'), 0.3]]} color={C.green} dashed opacity={0.45} />
      <FaceText position={[0, 3.32, 0.3]} size={0.3} color="#a7f3d0">same type → keep</FaceText>

      <Hotspot id="props">
        {hot => (
          <>
            <TNode at={at(L, 'h1')} label="h1: Todos (2)" color={C.react} hot={hot} />
            <TNode at={at(R, 'h1')} label="h1: Todos (3)" color={C.yellow} hot={hot} pulse />
            <HitBox size={[NW + 0.1, 0.8, 0.6]} position={[...at(L, 'h1'), 0]} />
            <HitBox size={[NW + 0.1, 0.8, 0.6]} position={[...at(R, 'h1'), 0]} />
          </>
        )}
      </Hotspot>

      <Hotspot id="bailout">
        {hot => (
          <>
            <TNode at={at(L, 'side')} label="<Sidebar>" color={C.react} hot={hot} />
            <TNode at={at(R, 'side')} label="memo: skipped" color={C.grey} hot={hot} dim />
            <HitBox size={[NW + 0.1, 0.8, 0.6]} position={[...at(L, 'side'), 0]} />
            <HitBox size={[NW + 0.1, 0.8, 0.6]} position={[...at(R, 'side'), 0]} />
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
            <HitBox size={[6.9, 2.8, 0.6]} position={[L, 0.5, 0]} />
            <HitBox size={[6.9, 2.8, 0.6]} position={[R, 0.5, 0]} />
          </>
        )}
      </Hotspot>
      {/* key matches across renders */}
      <Flow points={[[...at(L, 'li0'), 0.3], [0, -1.6, 2.6], [...at(R, 'li1'), 0.3]]} color={C.green} count={3} speed={0.18} />
      <Flow points={[[...at(L, 'li2'), 0.3], [0, -1.1, 1.8], [...at(R, 'li0'), 0.3]]} color={C.cyan} count={3} speed={0.18} offset={0.4} />
      <FaceText position={[L, -1.25, 0.3]} size={0.3} color="#ffc2c9">b removed</FaceText>
      <FaceText position={[R + 2.45, -1.25, 0.3]} size={0.3} color="#a7f3d0">d inserted</FaceText>
      <FaceText position={[R - 2.45, -1.25, 0.3]} size={0.3} color="#bdefff">c moved</FaceText>

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
                <RoundedBox args={[3.9, 0.78, 0.35]} radius={0.12} raycast={noRaycast}>
                  <CardMat color={c} level={hot ? CARD.hot : 0.26} />
                </RoundedBox>
                <Border size={[3.9, 0.78, 0.35]} color={c} width={hot ? 2.4 : 1.4} />
                <FaceText position={[0, 0, 0.19]} size={0.31}>{t}</FaceText>
              </group>
            ))}
            <HitBox size={[17.4, 0.9, 0.5]} />
            <Label position={[0, 0.6, 0]} title="Commit list" sub="only these four operations touch the DOM" subColor="#a9ecff" color="#ffffff" />
          </>
        )}
      </Hotspot>
    </group>
  );
}
