// Selectors & memoization: state → input selectors → createSelector (with its
// cache) → output → component. The cycle alternates an unrelated action
// (cache HIT, nothing re-renders) with todos/added (MISS → recompute → re-render).
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { C, CARD, Chip, FaceText, Flow, Gear, INK, Region, noRaycast, paintCard } from '../primitives.jsx';

export const pose = { pos: [0, 1.4, 22], tgt: [-0.6, 0.4, 0], span: 23.5, height: 9.5 };

const Y = 0.6;
const PERIOD = 7;

function Lens({ color, hot, matRef }) {
  return (
    <mesh rotation={[0, 0, Math.PI / 2]} raycast={noRaycast}>
      <cylinderGeometry args={[0.55, 0.55, 0.25, 32]} />
      <meshStandardMaterial ref={matRef} color="#bfefff" emissive={color} emissiveIntensity={hot ? 1.8 : 0.7} transparent opacity={0.8} roughness={0.1} />
    </mesh>
  );
}

export default function SelectorsScene() {
  const gear = useRef();
  const cacheMat = useRef();
  const todosLens = useRef();
  const outMat = useRef();
  const compMat = useRef();
  const status = useRef();
  const last = useRef('');

  useFrame(({ clock }, dt) => {
    const u = clock.getElapsedTime() % PERIOD;
    const miss = u >= PERIOD / 2;
    const active = (u % (PERIOD / 2)) > 0.8; // after the action has reached the selectors
    if (gear.current) gear.current.rotation.z -= dt * (miss && active ? 4 : 0);
    if (cacheMat.current) {
      paintCard(cacheMat.current, active ? (miss ? C.amber : C.green) : C.grey, active ? CARD.active : CARD.idle);
    }
    if (todosLens.current) todosLens.current.emissiveIntensity = miss && active ? 2.4 : 0.7;
    paintCard(outMat.current, C.green, miss && active ? CARD.active : CARD.idle);
    if (compMat.current) {
      paintCard(compMat.current, active ? (miss ? C.green : C.grey) : C.react, active ? (miss ? CARD.active : CARD.dim) : CARD.idle);
    }
    const text = miss
      ? 'dispatch(todos/added) → todos changed → RECOMPUTE → new array → <TodoList> re-renders'
      : 'dispatch(user/updated) → todos & filter unchanged → CACHE HIT → same array → no re-render';
    if (text !== last.current && status.current) {
      last.current = text;
      status.current.text = text;
      status.current.sync();
    }
  });

  return (
    <group>
      <Flow points={[[-8.9, Y + 0.3, 0.3], [-7.2, 1.8, 0.5], [-6.1, Y + 1.1, 0.3]]} color={C.violet} count={2} speed={0.5} size={0.08} />
      <Flow points={[[-8.9, Y - 0.3, 0.3], [-7.2, -0.7, 0.5], [-6.1, Y - 1.1, 0.3]]} color={C.violet} count={2} speed={0.5} size={0.08} offset={0.4} />
      <Flow points={[[-5.0, Y + 1.1, 0.3], [-2.6, 1.6, 0.5], [-1.4, Y + 0.3, 0.3]]} color={C.cyan} count={2} speed={0.5} size={0.08} />
      <Flow points={[[-5.0, Y - 1.1, 0.3], [-2.6, -0.4, 0.5], [-1.4, Y - 0.3, 0.3]]} color={C.cyan} count={2} speed={0.5} size={0.08} offset={0.4} />
      <Flow points={[[0.6, Y, 0.3], [2.8, Y, 0.3]]} color={C.green} count={2} speed={0.5} size={0.08} />
      <Flow points={[[6.0, Y, 0.3], [7.0, Y, 0.3]]} color={C.green} count={2} speed={0.5} size={0.08} />

      <Region id="sel-state" position={[-10.0, Y, 0]} size={[2.4, 2.4, 1]} color={C.violet} label="state" labelY={1.45}>
        {hot => <Chip size={[2.2, 2.2, 0.8]} color={C.violet} text={'todos\nuser\nfilter'} textSize={0.3} hot={hot} />}
      </Region>

      <Region id="input" position={[-5.6, Y, 0]} size={[2.4, 3.6, 1.2]} color={C.cyan} label="input selectors" labelY={2.05}>
        {hot => (
          <>
            <group position={[0, 1.1, 0]}>
              <Lens color={C.cyan} hot={hot} matRef={todosLens} />
              <FaceText position={[0, -0.8, 0.3]} size={0.28} color={INK}>selectTodos</FaceText>
            </group>
            <group position={[0, -1.1, 0]}>
              <Lens color={C.cyan} hot={hot} />
              <FaceText position={[0, -0.8, 0.3]} size={0.28} color={INK}>selectFilter</FaceText>
            </group>
          </>
        )}
      </Region>

      <Region id="createselector" position={[-0.4, Y + 0.3, 0]} size={[2.4, 2.0, 1]} color={C.amber} label="createSelector" sub="combiner: filter todos" labelY={1.25}>
        {() => (
          <group ref={gear}>
            <Gear r={0.65} color={C.amber} teeth={10} />
          </group>
        )}
      </Region>
      <Region id="cache" position={[-0.4, Y - 1.75, 0]} size={[4.6, 1.15, 0.6]} color={C.green}>
        {hot => <Chip size={[4.4, 0.98, 0.4]} color={C.grey} text={'cache\n(todos, filter) → result'} textSize={0.28} hot={hot} matRef={cacheMat} />}
      </Region>

      <Region id="output" position={[4.4, Y, 0]} size={[3.2, 0.9, 0.6]} color={C.green} label="output" labelY={0.6}>
        {hot => <Chip size={[3.0, 0.7, 0.4]} color={C.green} text="visibleTodos" hot={hot} matRef={outMat} />}
      </Region>
      <Region id="output" position={[9.0, Y, 0]} size={[3.6, 1.2, 0.6]} color={C.react} label="useSelector(===)" labelY={0.8}>
        {hot => <Chip size={[3.4, 1.0, 0.4]} color={C.react} text={'<TodoList>'} hot={hot} matRef={compMat} />}
      </Region>

      <Region id="pitfalls" position={[-0.6, -3.3, 0]} size={[12.6, 0.9, 0.6]} color={C.red} label="pitfall" labelY={0.6}>
        {hot => <Chip size={[12.4, 0.72, 0.4]} color={C.red} text="s => s.todos.filter(…) makes a NEW array per dispatch → always re-renders" textSize={0.28} hot={hot} />}
      </Region>

      <Text ref={status} position={[-0.6, 3.9, 0.3]} fontSize={0.3} color="#ffffff" anchorX="center" anchorY="middle" maxWidth={22} textAlign="center" outlineWidth={0.04} outlineColor="#05060e" raycast={noRaycast}>
        dispatch(user/updated)
      </Text>
    </group>
  );
}
