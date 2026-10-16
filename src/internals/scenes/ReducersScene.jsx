// Reducers: an action enters the rootReducer and fans out to every slice
// reducer. Right: structural sharing — the old and new state trees share
// every unchanged node; only the path to the change is new (green).
import { C, Chip, Flow, FaceText, Gear, Region, Spin, Wire } from '../primitives.jsx';

export const pose = { pos: [0, 1.4, 22], tgt: [-0.2, 0.1, 0], span: 23, height: 11 };

const SLICES = [
  ['todosReducer', -9.2],
  ['userReducer', -6.0],
  ['filterReducer', -2.8],
];

const S = {
  prev: [3.0, 3.4],
  next: [8.6, 3.4],
  user: [5.8, 1.9],
  filter: [5.8, 0.9],
  todosOld: [3.0, 0.4],
  todosNew: [8.6, 0.4],
  t0: [5.8, -1.0],
  t1: [5.8, -2.0],
  t2Old: [3.0, -1.7],
  t2New: [8.6, -1.7],
};
const SHARE_EDGES = [
  ['prev', 'todosOld', false],
  ['prev', 'user', false],
  ['prev', 'filter', false],
  ['next', 'todosNew', true],
  ['next', 'user', true],
  ['next', 'filter', true],
  ['todosOld', 't0', false],
  ['todosOld', 't1', false],
  ['todosOld', 't2Old', false],
  ['todosNew', 't0', true],
  ['todosNew', 't1', true],
  ['todosNew', 't2New', true],
];

export default function ReducersScene() {
  return (
    <group>
      {/* rootReducer → slice reducers */}
      <Flow points={[[-11.2, 4.4, 0.4], [-8.6, 4.1, 0.6], [-6.8, 3.2, 0.4]]} color={C.pink} count={2} speed={0.45} size={0.12} />
      <FaceText position={[-10.4, 4.85, 0.3]} size={0.2} color="#ffc2ef">action</FaceText>
      <Region id="root" position={[-6.0, 3.0, 0]} size={[2.2, 2.2, 1]} color={C.amber} label="rootReducer" sub="combineReducers({ todos, user, filter })" labelY={1.3}>
        {() => (
          <Spin speed={0.8} axis="z">
            <Gear r={0.75} color={C.amber} teeth={11} />
          </Spin>
        )}
      </Region>
      {SLICES.map(([, x], i) => (
        <Flow key={x} points={[[-6.0, 2.1, 0.4], [(x - 6.0) / 2, 1.8, 0.6], [x, 1.3, 0.4]]} color={C.amber} count={2} speed={0.5} size={0.08} offset={i * 0.3} />
      ))}
      <Region id="slice" position={[-6.0, 0.6, 0]} size={[9.8, 1.9, 1]} color={C.yellow}>
        {() =>
          SLICES.map(([n, x], i) => (
            <group key={n} position={[x + 6.0, 0.05, 0]}>
              <Spin speed={i % 2 ? -1.1 : 1.1} axis="z">
                <Gear r={0.48} color={C.yellow} teeth={9} />
              </Spin>
              <FaceText position={[0, -0.85, 0.3]} size={0.2} color="#fff0bf">{n}</FaceText>
            </group>
          ))
        }
      </Region>

      <Region id="pure" position={[-6.0, -1.5, 0]} size={[9.6, 0.85, 0.6]} color={C.green}>
        {hot => <Chip size={[9.4, 0.7, 0.4]} color={C.green} text="(state, action) → newState  ·  no side effects  ·  no async  ·  no mutation" textSize={0.21} hot={hot} intensity={0.4} />}
      </Region>
      <Region id="immer" position={[-8.5, -3.55, 0]} size={[4.9, 1.5, 0.6]} color={C.cyan} label="Immer" labelY={0.95}>
        {hot => <Chip size={[4.7, 1.3, 0.4]} color={C.cyan} text={'todo.done = !todo.done   // draft\n→ new immutable state'} textSize={0.2} hot={hot} intensity={0.4} />}
      </Region>
      <Region id="createslice" position={[-3.3, -3.55, 0]} size={[4.9, 1.5, 0.6]} color={C.violet} label="createSlice" labelY={0.95}>
        {hot => <Chip size={[4.7, 1.3, 0.4]} color={C.violet} text={'createSlice({ name, reducers })\n→ slice.reducer + slice.actions'} textSize={0.2} hot={hot} intensity={0.4} />}
      </Region>

      {/* structural sharing */}
      <Region id="sharing" position={[5.8, 0.75, 0]} size={[8.2, 6.6, 0.8]} color={C.green} label="Structural sharing" sub="prev.user === next.user" labelY={3.7}>
        {hot => (
          <group position={[-5.8, -0.75, 0]}>
            {SHARE_EDGES.map(([a, b, isNew]) => (
              <Wire key={a + b} points={[[...S[a], -0.1], [...S[b], -0.1]]} color={isNew ? '#46e2a0' : '#6b7489'} opacity={isNew ? 0.8 : 0.5} />
            ))}
            <Chip position={[...S.prev, 0]} size={[2.2, 0.62, 0.4]} color={C.grey} text="prev state" hot={hot} dim />
            <Chip position={[...S.next, 0]} size={[2.2, 0.62, 0.4]} color={C.green} text="next state" hot={hot} />
            <Chip position={[...S.todosOld, 0]} size={[1.9, 0.6, 0.4]} color={C.grey} text="todos" hot={hot} dim />
            <Chip position={[...S.todosNew, 0]} size={[1.9, 0.6, 0.4]} color={C.green} text="todos (new)" hot={hot} />
            <Chip position={[...S.t2Old, 0]} size={[1.9, 0.6, 0.4]} color={C.grey} text="todo 2" hot={hot} dim />
            <Chip position={[...S.t2New, 0]} size={[1.9, 0.6, 0.4]} color={C.green} text="todo 2 (new)" textSize={0.19} hot={hot} />
            {['user', 'filter', 't0', 't1'].map(k => (
              <Chip key={k} position={[...S[k], 0]} size={[1.9, 0.6, 0.4]} color={C.violet} text={{ user: 'user', filter: 'filter', t0: 'todo 0', t1: 'todo 1' }[k]} hot={hot} intensity={0.45} />
            ))}
            <FaceText position={[5.8, -2.75, 0.3]} size={0.18} color="#d9ccff">violet = shared by both trees</FaceText>
          </group>
        )}
      </Region>
    </group>
  );
}
