// Nucleus → components & JSX: source → compiler → element objects → a tree
// of components, with props flowing down the edges.
import { RoundedBox } from '@react-three/drei';
import { Block, Border, C, CARD, CardMat, FaceText, Flow, Gear, HitBox, Hotspot, INK, Label, Outline, Spin, noRaycast } from '../primitives.jsx';

export const pose = { pos: [0, 2, 22], tgt: [0, 0.2, 0], span: 27.5, height: 10.5 };

const JSX_SRC = `function App() {
  return (
    <Layout>
      <Header title="Todos" />
      <TodoList items={todos} />
    </Layout>
  );
}`;

const ELEMENT_SRC = `{
  type: Layout,
  key: null,
  props: {
    children: [ … ]
  }
}`;

const TREE = {
  App: [0, 3.3],
  Layout: [0, 1.9],
  Header: [-1.9, 0.4],
  TodoList: [1.9, 0.4],
  'Item a': [0.55, -1.15],
  'Item b': [1.9, -1.15],
  'Item c': [3.25, -1.15],
};
const EDGES = [
  ['App', 'Layout'],
  ['Layout', 'Header'],
  ['Layout', 'TodoList'],
  ['TodoList', 'Item a'],
  ['TodoList', 'Item b'],
  ['TodoList', 'Item c'],
];

function CodeCard({ id, position, src, title, sub, color, size }) {
  return (
    <Hotspot id={id} position={position}>
      {(hot, sel) => (
        <>
          <RoundedBox args={size} radius={0.14} smoothness={3} raycast={noRaycast}>
            <CardMat color={color} level={hot || sel ? 0.2 : 0.1} />
          </RoundedBox>
          <Border size={size} color={color} width={hot || sel ? 2.4 : 1.3} />
          <FaceText position={[-size[0] / 2 + 0.25, size[1] / 2 - 0.25, size[2] / 2 + 0.02]} size={0.28} color={INK} anchorX="left" anchorY="top">
            {src}
          </FaceText>
          <HitBox size={size} />
          {(hot || sel) && <Outline size={size} color={color} />}
          <Label position={[0, size[1] / 2 + 0.3, 0]} title={title} sub={sub} subColor={color} color={hot || sel ? '#fff' : '#dfe6ff'} />
        </>
      )}
    </Hotspot>
  );
}

export default function ComponentsScene() {
  return (
    <group>
      <CodeCard id="jsx" position={[-9.4, 0.6, 0]} size={[5.6, 4.2, 0.24]} src={JSX_SRC} title="JSX" sub="what you write" color={C.react} />

      <Hotspot id="compiler" position={[-5.1, 0.6, 0.4]}>
        {(hot, sel) => (
          <>
            <Spin speed={hot ? 1.6 : 0.7} axis="z">
              <Gear r={0.8} color={C.yellow} />
            </Spin>
            <HitBox size={[2.2, 2.2, 1]} />
            <Label position={[0, 1.3, 0]} title="Babel / SWC" sub="JSX → jsx() calls" subColor={C.yellow} color={hot || sel ? '#fff' : '#dfe6ff'} />
          </>
        )}
      </Hotspot>

      <Hotspot id="element" position={[-0.4, 0.6, 0]}>
        {(hot, sel) => (
          <>
            {[2, 1, 0].map(i => (
              <group key={i} position={[i * 0.28, -i * 0.28, -i * 0.35]}>
                <RoundedBox args={[4.4, 3.0, 0.12]} radius={0.1} raycast={noRaycast}>
                  <CardMat color={C.violet} level={i === 0 ? (hot || sel ? 0.22 : 0.12) : 0.06} />
                </RoundedBox>
                {i === 0 && <Border size={[4.4, 3.0, 0.12]} color={C.violet} width={hot || sel ? 2.4 : 1.3} />}
                {i === 0 && (
                  <FaceText position={[-2.0, 1.25, 0.08]} size={0.3} color={INK} anchorX="left" anchorY="top">
                    {ELEMENT_SRC}
                  </FaceText>
                )}
              </group>
            ))}
            <HitBox size={[5, 3.6, 1.2]} position={[0.3, -0.3, -0.3]} />
            <Label position={[0, 1.85, 0]} title="React elements" sub="plain objects" subColor={C.violet} color={hot || sel ? '#fff' : '#dfe6ff'} />
          </>
        )}
      </Hotspot>

      <Flow points={[[-6.5, 0.6, 0.6], [-5.9, 0.6, 0.8]]} color={C.yellow} count={2} speed={0.6} />
      <Flow points={[[-4.2, 0.6, 0.8], [-2.7, 0.6, 0.6]]} color={C.yellow} count={2} speed={0.6} />
      <Flow points={[[2.1, 0.6, 0.6], [3.2, 1.5, 0.8], [4.4, 3.0, 0.6]]} color={C.violet} count={3} speed={0.4} />

      {/* component tree */}
      <Hotspot id="tree" position={[6.8, 0, 0]}>
        {(hot, sel) => (
          <>
            {Object.entries(TREE).map(([name, [x, y]]) => (
              <group key={name} position={[x, y, 0]}>
                <RoundedBox args={[1.8, 0.62, 0.45]} radius={0.12} raycast={noRaycast}>
                  <CardMat color={C.react} level={hot || sel ? CARD.hot : CARD.idle} />
                </RoundedBox>
                <Border size={[1.8, 0.62, 0.45]} color={C.react} />
                <FaceText position={[0, 0, 0.24]} size={0.29}>{`<${name}>`}</FaceText>
              </group>
            ))}
            <HitBox size={[6.2, 5.4, 1]} position={[0.6, 1.0, 0]} />
            {(hot || sel) && <Outline size={[6.0, 5.2, 0.8]} position={[0.6, 1.0, 0]} color={C.react} />}
            <Label position={[0.6, 4.05, 0]} title="Component tree" sub="one fiber per node" subColor={C.react} color={hot || sel ? '#fff' : '#dfe6ff'} />
          </>
        )}
      </Hotspot>
      {/* props flowing down the edges */}
      {EDGES.map(([a, b], i) => (
        <Flow
          key={`${a}-${b}`}
          points={[
            [6.8 + TREE[a][0], TREE[a][1] - 0.32, 0.1],
            [6.8 + TREE[b][0], TREE[b][1] + 0.32, 0.1],
          ]}
          color={C.green}
          count={2}
          speed={0.5}
          size={0.08}
          opacity={0.6}
          offset={i * 0.17}
        />
      ))}

      <Block id="props" position={[11.4, 2.6, 0.6]} size={[3.7, 0.75, 0.3]} color={C.green} text="props down, events up" textSize={0.3} label="Data flow" labelPos={[0, 0.55, 0]} />

      <Block id="purity" position={[-6.8, -3.4, 0]} size={[6.4, 1.2, 0.4]} color={C.pink} text={'UI = f(props, state)\nno side effects while rendering'} textSize={0.3} label="Pure components" labelPos={[0, 0.9, 0]} />
      <Block id="composition" position={[0.6, -3.4, 0]} size={[6.6, 1.4, 0.4]} color={C.amber} text={'<Card>\n  <Avatar />  {children}\n</Card>'} textSize={0.29} label="Composition" labelPos={[0, 1.0, 0]} />
    </group>
  );
}
