// Production setup: every package a real-world React-Redux app ships with,
// as crates wired to the store they plug into. Dashed violet lines mark what
// @reduxjs/toolkit bundles. Left: the conventional file layout and typed hooks;
// under the store: the rootReducer.
import { RoundedBox } from '@react-three/drei';
import { Border, C, CARD, Cage, CardMat, Chip, FaceText, INK, INK_DIM, Region, SURFACE, Spin, Wire, mix, noRaycast } from '../primitives.jsx';

export const pose = { pos: [0, 1.4, 22], tgt: [-1.9, 0.6, 0], span: 26.5, height: 10.8 };

const S = [1.4, 0.7];
const CRATES = [
  { id: 'rtk', name: '@reduxjs/toolkit', cap: 'the official toolkit', at: [1.4, 4.1], w: 4.6, color: C.violet },
  { id: 'redux-core', name: 'redux', cap: 'store core', at: [-4.2, 3.3], color: '#9b8cff', bundled: true },
  { id: 'pkg-immer', name: 'immer', cap: 'immutable drafts', at: [7.0, 3.3], color: C.cyan, bundled: true },
  { id: 'pkg-react-redux', name: 'react-redux', cap: 'React bindings', at: [-6.4, 0.7], color: C.react },
  { id: 'pkg-persist', name: 'redux-persist', cap: 'save & restore', at: [9.2, 0.7], color: C.green },
  { id: 'pkg-thunk', name: 'redux-thunk', cap: 'async logic', at: [-4.2, -2.2], color: C.amber, bundled: true },
  { id: 'pkg-saga', name: 'redux-saga', cap: 'alternative', at: [-7.8, -2.9], color: C.grey, alt: true },
  { id: 'pkg-logger', name: 'redux-logger', cap: 'dev logging', at: [-0.8, -2.9], color: C.pink },
  { id: 'pkg-reselect', name: 'reselect', cap: 'memo selectors', at: [2.6, -2.9], color: C.yellow, bundled: true },
  { id: 'pkg-devtools', name: 'Redux DevTools', cap: 'time travel', at: [7.0, -2.2], color: C.red },
];

const FILES = ['src/', '  app/store.ts', '  app/rootReducer.ts', '  app/hooks.ts', '  features/todos/todosSlice.ts', '  features/user/userSlice.ts', '  services/api.ts', '  main.tsx  <Provider>'];

function Crate({ c, hot }) {
  const w = c.w || 3.2;
  return (
    <group>
      <RoundedBox args={[w, 1.25, 0.9]} radius={0.08} smoothness={3} raycast={noRaycast}>
        <CardMat color={c.color} level={hot ? CARD.hot : c.alt ? CARD.dim : CARD.idle} />
      </RoundedBox>
      <Border size={[w, 1.25, 0.9]} color={hot ? c.color : mix(SURFACE, c.color, c.alt ? 0.45 : 0.75)} width={hot ? 2.4 : 1.4} />
      <mesh position={[0, 0.52, 0.46]} raycast={noRaycast}>
        <planeGeometry args={[w - 0.12, 0.1]} />
        <meshBasicMaterial color={c.color} transparent opacity={c.alt ? 0.45 : 0.95} />
      </mesh>
      <FaceText position={[0, 0.12, 0.47]} size={0.3} color={INK}>{c.name}</FaceText>
      <FaceText position={[0, -0.27, 0.47]} size={0.28} color={INK_DIM}>{c.cap}</FaceText>
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
        <FaceText position={[0, 1.3, 0.3]} size={0.3} color="#eee9ff">configureStore()</FaceText>
      </group>
      <Region id="structure" position={[S[0], -0.85, 0]} size={[9.2, 0.8, 0.6]} color={C.amber}>
        {hot => <Chip size={[9.0, 0.64, 0.35]} color={C.amber} text="rootReducer = combineReducers({ todos, user, api })" textSize={0.28} hot={hot} />}
      </Region>

      {CRATES.map(c => (
        <Region key={c.id} id={c.id} position={[...c.at, 0]} size={[(c.w || 3.2) + 0.1, 1.35, 1.0]} color={c.color}>
          {hot => <Crate c={c} hot={hot} />}
        </Region>
      ))}
      <FaceText position={[rtk.at[0] + 2.6, rtk.at[1] + 0.95, 0]} size={0.28} color="#e3dcff" anchorX="left">dashed = bundled by RTK</FaceText>

      {/* project layout */}
      <Region id="structure" position={[-12.3, 0.9, 0]} size={[5.6, 5.0, 0.6]} color={C.amber} label="project structure" labelY={2.8}>
        {hot => (
          <Chip size={[5.4, 4.8, 0.3]} color={C.amber} hot={hot}>
            {FILES.map((f, i) => (
              <FaceText
                key={f}
                position={[-2.5, 2.05 - i * 0.55, 0.17]}
                size={0.28}
                color={f.includes('rootReducer') || f.includes('store') ? '#ffe0b8' : i === 0 ? '#ffffff' : INK_DIM}
                anchorX="left"
              >
                {f}
              </FaceText>
            ))}
          </Chip>
        )}
      </Region>
      <Region id="typed-hooks" position={[-12.3, -2.55, 0]} size={[5.6, 1.0, 0.6]} color={C.react}>
        {hot => <Chip size={[5.4, 0.9, 0.35]} color={C.react} text={'useAppDispatch()\nuseAppSelector()'} textSize={0.28} hot={hot} />}
      </Region>
    </group>
  );
}
