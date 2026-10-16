// Hooks: the fiber's memoizedState is a linked list of hook cells. The ring
// walks it in call order on every render. Below: what breaks when the order
// changes, and how each render keeps its own snapshot of values.
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Arrow, Block, C, FaceText, Glass, HitBox, Hotspot, Label, Outline, Wire, noRaycast } from '../primitives.jsx';

export const pose = { pos: [0.4, 1.0, 21.5], tgt: [0.4, -0.6, 0], span: 24, height: 8.5 };

const Y = 1.8;
const CELL_W = 2.7;
const CELLS = [
  { id: 'state', x: -5.0, color: C.react, text: 'useState\ncount = 3\nqueue: [c => c + 1]' },
  { id: 'reducer', x: -1.6, color: C.violet, text: 'useReducer\n{ items, status }\ndispatch(action)' },
  { id: 'effect', x: 1.8, color: C.pink, text: 'useEffect\ndeps: [userId]\n+ cleanup' },
  { id: 'memo', x: 5.2, color: C.amber, text: 'useMemo\nvisibleTodos\ndeps: [todos]' },
  { id: 'ref', x: 8.6, color: C.green, text: 'useRef\n{ current:\n<input> }' },
];

function Walker() {
  const ring = useRef();
  const label = useRef();
  const last = useRef(-1);
  useFrame(({ clock }) => {
    // steps 0..3 visit each hook in order, step 4 holds on the last one, then
    // the next render starts again from the first hook
    const t = clock.getElapsedTime() / 0.9;
    const step = Math.floor(t) % (CELLS.length + 1);
    const last3 = CELLS.length - 1;
    const idx = Math.min(step, last3);
    const glide = step < last3 ? THREE.MathUtils.smoothstep(t % 1, 0.55, 1) : 0;
    if (ring.current) ring.current.position.x = THREE.MathUtils.lerp(CELLS[idx].x, CELLS[Math.min(idx + 1, last3)].x, glide);
    if (step !== last.current && label.current) {
      last.current = step;
      label.current.text = step > last3 ? 'next render → from #1 again' : `hook #${idx + 1}`;
      label.current.sync();
    }
  });
  return (
    <group ref={ring} position={[CELLS[0].x, Y, 0]}>
      <mesh raycast={noRaycast}>
        <torusGeometry args={[1.7, 0.05, 10, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </mesh>
      <Text ref={label} position={[0, -1.6, 0.5]} fontSize={0.24} color="#ffffff" anchorX="center" anchorY="top" outlineWidth={0.012} outlineColor="#05060e" raycast={noRaycast}>
        hook #1
      </Text>
    </group>
  );
}

function MiniCell({ x, y, t, color, bad }) {
  return (
    <group position={[x, y, 0]}>
      <RoundedBox args={[1.6, 0.58, 0.3]} radius={0.1} raycast={noRaycast}>
        <meshStandardMaterial color="#0b1226" emissive={bad ? C.red : color} emissiveIntensity={0.6} />
      </RoundedBox>
      <FaceText position={[0, 0, 0.17]} size={0.2}>{t}</FaceText>
    </group>
  );
}

export default function HooksScene() {
  return (
    <group>
      <Block id="fiber" position={[-9.3, Y, 0]} size={[3.0, 2.0, 1]} color={C.violet} text={'TodoApp\nfiber'} textSize={0.34} label="Component fiber" labelPos={[0, 1.3, 0]} />
      <Arrow from={[-7.75, Y, 0.3]} to={[-CELL_W / 2 + CELLS[0].x - 0.05, Y, 0.3]} color="#d9ccff" head={0.24} />
      <FaceText position={[-6.95, Y + 0.3, 0.3]} size={0.17} color="#d9ccff">memoizedState</FaceText>

      {CELLS.map((c, i) => (
        <group key={c.id}>
          <Block id={c.id} position={[c.x, Y, 0]} size={[CELL_W, 2.0, 0.9]} color={c.color} text={c.text} textSize={0.23} />
          {i < CELLS.length - 1 && (
            <>
              <Arrow from={[c.x + CELL_W / 2 + 0.03, Y, 0.3]} to={[CELLS[i + 1].x - CELL_W / 2 - 0.03, Y, 0.3]} color="#cfe0ff" head={0.2} />
              <FaceText position={[(c.x + CELLS[i + 1].x) / 2, Y + 0.3, 0.3]} size={0.17} color="#cfe0ff">next</FaceText>
            </>
          )}
        </group>
      ))}
      <Arrow from={[10.0, Y, 0.3]} to={[10.75, Y, 0.3]} color="#cfe0ff" head={0.22} />
      <FaceText position={[11.25, Y, 0.3]} size={0.24} color="#8a93ad">null</FaceText>
      <Walker />

      {/* rules of hooks */}
      <Hotspot id="rules" position={[-6.3, -2.9, 0]}>
        {(hot, sel) => (
          <>
            <FaceText position={[-3.35, 0.45, 0]} size={0.2} color="#c9d2ea" anchorX="left">render 1</FaceText>
            <FaceText position={[-3.35, -0.45, 0]} size={0.2} color="#ffb3bd" anchorX="left">render 2</FaceText>
            <MiniCell x={-1.1} y={0.45} t="useState" color={C.react} />
            <MiniCell x={0.7} y={0.45} t="useEffect" color={C.pink} />
            <MiniCell x={2.5} y={0.45} t="useMemo" color={C.amber} />
            <MiniCell x={-1.1} y={-0.45} t="useEffect?" bad />
            <MiniCell x={0.7} y={-0.45} t="useMemo?" bad />
            <MiniCell x={2.5} y={-0.45} t="—" bad />
            {[-1.1, 0.7, 2.5].map(x => (
              <Wire key={x} points={[[x + 0.45, 0.15, 0.2], [x - 0.45, -0.15, 0.2]]} color={C.red} width={2} opacity={0.9} />
            ))}
            <FaceText position={[0, -1.05, 0]} size={0.18} color="#ffb3bd">{'if (user) useState(…)  → every hook after it shifts'}</FaceText>
            <HitBox size={[7.4, 2.6, 0.6]} position={[0, -0.1, 0]} />
            {(hot || sel) && <Outline size={[7.2, 2.5, 0.5]} position={[0, -0.1, 0]} color={C.red} />}
            <Label position={[0, 1.0, 0]} title="Rules of Hooks" sub="order is identity" subColor={C.red} size={0.38} color={hot || sel ? '#fff' : '#dfe6ff'} />
          </>
        )}
      </Hotspot>

      {/* closures */}
      <Hotspot id="closures" position={[5.6, -2.9, 0]}>
        {(hot, sel) => (
          <>
            {[1, 2, 3].map((n, i) => (
              <group key={n} position={[-2.5 + i * 2.5, 0, -i * 0.2]}>
                <RoundedBox args={[2.2, 1.5, 0.12]} radius={0.1} raycast={noRaycast}>
                  <Glass color={C.violet} hot={(hot || sel) && i === 0} intensity={0.25 + i * 0.15} opacity={0.6 + i * 0.15} />
                </RoundedBox>
                <FaceText position={[0, 0.2, 0.08]} size={0.22}>{`render #${n}`}</FaceText>
                <FaceText position={[0, -0.25, 0.08]} size={0.26} color="#d9ccff">{`count = ${n}`}</FaceText>
              </group>
            ))}
            <Arrow from={[-2.5, -0.85, 0.2]} to={[-2.5, -1.45, 0.2]} color={C.amber} head={0.2} />
            <FaceText position={[-2.5, -1.7, 0.2]} size={0.18} color="#ffd29a">{'setTimeout → logs 1'}</FaceText>
            <HitBox size={[7.8, 2.6, 0.6]} position={[0, -0.3, 0]} />
            {(hot || sel) && <Outline size={[7.6, 2.4, 0.5]} position={[0, -0.3, 0]} color={C.violet} />}
            <Label position={[0, 1.0, 0]} title="Closures & snapshots" sub="each render has its own values" subColor={C.violet} size={0.38} color={hot || sel ? '#fff' : '#dfe6ff'} />
          </>
        )}
      </Hotspot>
    </group>
  );
}
