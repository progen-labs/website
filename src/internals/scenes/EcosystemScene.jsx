// Production setup: every package a real-world React-Redux app ships with,
// as crates wired to the store they plug into. Dashed violet lines mark what
// @reduxjs/toolkit bundles. Left: the conventional file layout and typed hooks;
// under the store: the rootReducer.
import { RoundedBox } from '@react-three/drei';
import { C, Chip, FaceText, Glass, Region, Spin, Cage, Wire, noRaycast } from '../primitives.jsx';

export const pose = { pos: [0, 1.4, 22], tgt: [-1.6, 0.6, 0], span: 25.5, height: 10.5 };

const S = [1.4, 0.7];
const CRATES = [
  { id: 'rtk', name: '@reduxjs/toolkit', cap: 'configureStore · createSlice · RTK Query', at: [1.4, 4.1], w: 4.6, color: C.violet },
  { id: 'redux-core', name: 'redux', cap: 'the store core', at: [-4.2, 3.3], color: '#9b8cff', bundled: true },
  { id: 'pkg-immer', name: 'immer', cap: 'immutable drafts', at: [7.0, 3.3], color: C.cyan, bundled: true },
  { id: 'pkg-react-redux', name: 'react-redux', cap: 'Provider · useSelector', at: [-6.4, 0.7], color: C.react },
  { id: 'pkg-persist', name: 'redux-persist', cap: 'persist + rehydrate', at: [9.2, 0.7], color: C.green },
  { id: 'pkg-thunk', name: 'redux-thunk', cap: 'async middleware', at: [-4.2, -2.2], color: C.amber, bundled: true },
  { id: 'pkg-saga', name: 'redux-saga', cap: 'alternative', at: [-7.8, -2.9], color: C.grey, alt: true },
  { id: 'pkg-logger', name: 'redux-logger', cap: 'dev only', at: [-0.8, -2.9], color: C.pink },
  { id: 'pkg-reselect', name: 'reselect', cap: 'memoized selectors', at: [2.6, -2.9], color: C.yellow, bundled: true },
  { id: 'pkg-devtools', name: 'Redux DevTools', cap: 'time travel', at: [7.0, -2.2], color: C.red },
];

const FILES = ['src/', '  app/store.ts', '  app/rootReducer.ts', '  app/hooks.ts', '  features/todos/todosSlice.ts', '  features/user/userSlice.ts', '  services/api.ts', '  main.tsx  <Provider><PersistGate>'];

function Crate({ c, hot }) {
  const w = c.w || 2.9;
  return (
    <group>
      <RoundedBox args={[w, 1.15, 0.9]} radius={0.08} smoothness={3} raycast={noRaycast}>
        <Glass color={c.color} hot={hot} intensity={c.alt ? 0.15 : 0.32} opacity={c.alt ? 0.6 : 1} />
      </RoundedBox>
      <mesh position={[0, 0.47, 0.46]} raycast={noRaycast}>
        <planeGeometry args={[w - 0.12, 0.12]} />
        <meshBasicMaterial color={c.color} transparent opacity={c.alt ? 0.4 : 0.9} />
      </mesh>
      <FaceText position={[0, 0.08, 0.47]} size={0.23} color="#ffffff">{c.name}</FaceText>
      <FaceText position={[0, -0.25, 0.47]} size={0.15} color="#c9d2ea">{c.cap}</FaceText>
    </group>
  );
}

export default function EcosystemScene() {
  const rtk = CRATES[0];
  return (
    <group>
      {/* wires: every package plugs into the store; dashed = bundled by RTK */}
      {CRATES.map(c => (
        <Wire key={`w-${c.id}`} points={[[...c.at, -0.2], [...S, -0.2]]} color={c.alt ? '#4d556e' : '#6b7489'} opacity={0.5} dashed={c.alt} />
      ))}
      {CRATES.filter(c => c.bundled).map(c => (
        <Wire key={`b-${c.id}`} points={[[rtk.at[0], rtk.at[1] - 0.6, 0.3], [c.at[0], c.at[1] + 0.6, 0.3]]} color={C.violet} dashed opacity={0.75} />
      ))}

      {/* the store */}
      <group position={[...S, 0]}>
        <Spin speed={0.3}>
          <Cage size={[1.9, 1.9, 1.9]} color="#7c5cff" />
        </Spin>
        <mesh raycast={noRaycast}>
          <icosahedronGeometry args={[0.75, 1]} />
          <meshStandardMaterial color="#170d33" emissive={C.violet} emissiveIntensity={1.3} flatShading />
        </mesh>
        <FaceText position={[0, 1.25, 0.3]} size={0.24} color="#e3dcff">configureStore()</FaceText>
      </group>
      <Region id="structure" position={[S[0], -0.85, 0]} size={[7.4, 0.8, 0.6]} color={C.amber}>
        {hot => <Chip size={[7.2, 0.62, 0.35]} color={C.amber} text="rootReducer = combineReducers({ todos, user, [api.reducerPath]: api.reducer })" textSize={0.17} hot={hot} intensity={0.4} />}
      </Region>

      {CRATES.map(c => (
        <Region key={c.id} id={c.id} position={[...c.at, 0]} size={[(c.w || 2.9) + 0.1, 1.25, 1.0]} color={c.color}>
          {hot => <Crate c={c} hot={hot} />}
        </Region>
      ))}
      <FaceText position={[rtk.at[0] + 3.4, rtk.at[1] + 0.75, 0]} size={0.18} color="#d9ccff" anchorX="left">dashed = bundled by RTK</FaceText>

      {/* project layout */}
      <Region id="structure" position={[-11.9, 0.9, 0]} size={[4.8, 5.0, 0.6]} color={C.amber} label="project structure" labelY={2.8}>
        {hot => (
          <Chip size={[4.6, 4.8, 0.3]} color="#2b3150" hot={hot} intensity={0.5}>
            {FILES.map((f, i) => (
              <FaceText
                key={f}
                position={[-2.1, 2.05 - i * 0.55, 0.17]}
                size={0.2}
                color={f.includes('rootReducer') || f.includes('store') ? '#ffd29a' : i === 0 ? '#ffffff' : '#c9d2ea'}
                anchorX="left"
              >
                {f}
              </FaceText>
            ))}
          </Chip>
        )}
      </Region>
      <Region id="typed-hooks" position={[-11.9, -2.5, 0]} size={[4.8, 0.95, 0.6]} color={C.react}>
        {hot => <Chip size={[4.6, 0.8, 0.35]} color={C.react} text={'useAppDispatch · useAppSelector\nRootState · AppDispatch'} textSize={0.18} hot={hot} intensity={0.45} />}
      </Region>
    </group>
  );
}
