// Viewport → the rendering pipeline. Six stations along the bottom
// (parse → style → layout → paint → composite → raster) and, above them, the
// page itself exploded into compositor layers, breathing apart and together.
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import { C, Cage, FaceText, Flow, Glass, HitBox, Hotspot, Label, Outline, Wire, noRaycast } from '../primitives.jsx';

export const pose = { pos: [1, 3, 23], tgt: [0, 0.9, 0], span: 25.5, height: 12.5 };

function Flat({ p, s, c, o = 1 }) {
  return (
    <mesh position={p} raycast={noRaycast}>
      <planeGeometry args={s} />
      <meshBasicMaterial color={c} transparent={o < 1} opacity={o} toneMapped={false} side={2} />
    </mesh>
  );
}

const LAYERS = [
  { name: 'root layer', draw: () => (
    <>
      <Flat p={[0, 0, 0]} s={[7.6, 4.8]} c="#f4f6fb" />
      {[1.2, 0.85, 0.5].map(y => <Flat key={y} p={[-1.4, y - 2.6, 0.01]} s={[4.2, 0.14]} c="#cfd6e6" />)}
    </>
  ) },
  { name: 'header · position: sticky', draw: () => <Flat p={[0, 2.05, 0]} s={[7.6, 0.7]} c="#0d1430" /> },
  { name: 'hero · will-change: transform', draw: () => <Flat p={[0, 0.75, 0]} s={[6.8, 1.6]} c="#2f5bff" /> },
  { name: 'video', draw: () => (
    <>
      <Flat p={[-1.9, -1.2, 0]} s={[3.0, 1.7]} c="#0b0d14" />
      <mesh position={[-1.9, -1.2, 0.02]} rotation={[0, 0, -Math.PI / 2]} raycast={noRaycast}>
        <circleGeometry args={[0.32, 3]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </>
  ) },
  { name: 'modal · position: fixed', draw: () => (
    <>
      <Flat p={[1.7, -0.9, 0]} s={[3.0, 1.9]} c="#ffffff" />
      <Flat p={[1.7, -0.2, 0.01]} s={[3.0, 0.4]} c="#ff6ad5" />
    </>
  ) },
];

function LayerStack() {
  const refs = useRef([]);
  useFrame(({ clock }) => {
    const sep = 0.3 + 0.85 * (0.5 + 0.5 * Math.sin(clock.getElapsedTime() * 0.7));
    refs.current.forEach((g, i) => {
      if (g) g.position.z = i * sep;
    });
  });
  return (
    <Hotspot id="composite" position={[3.6, 2.6, -1.4]}>
      {(hot, sel) => (
        <>
          <group rotation={[-0.2, -0.62, 0]}>
            {LAYERS.map((l, i) => (
              <group key={l.name} ref={el => (refs.current[i] = el)}>
                <mesh raycast={noRaycast}>
                  <planeGeometry args={[7.6, 4.8]} />
                  <meshBasicMaterial color={C.cyan} transparent opacity={hot || sel ? 0.1 : 0.04} side={2} depthWrite={false} />
                  <Edges color={C.cyan} />
                </mesh>
                {l.draw()}
                <FaceText position={[-3.75, -2.25 + 0.02, 0.03]} size={0.2} color={i === 0 ? '#45506b' : '#bdefff'} anchorX="left" anchorY="bottom">
                  {l.name}
                </FaceText>
              </group>
            ))}
          </group>
          <HitBox size={[8.4, 6, 5]} position={[0, 0, 1]} />
          <Label position={[0, 3.9, 0]} title="The page, exploded into layers" sub="what the compositor actually moves" subColor={C.cyan} color={hot || sel ? '#fff' : '#dfe6ff'} size={0.46} />
        </>
      )}
    </Hotspot>
  );
}

function Station({ id, x, n, title, color, children }) {
  return (
    <Hotspot id={id} position={[x, -3.6, 0]}>
      {(hot, sel) => (
        <>
          <group scale={hot || sel ? 1.1 : 1}>{children(hot || sel)}</group>
          <mesh position={[0, -1.25, 0]} raycast={noRaycast}>
            <cylinderGeometry args={[1.35, 1.45, 0.16, 40]} />
            <Glass color={color} hot={hot || sel} intensity={0.35} />
          </mesh>
          <HitBox size={[2.9, 3, 1.6]} />
          {(hot || sel) && <Outline size={[2.8, 2.7, 1.2]} color={color} position={[0, 0, 0]} />}
          <Label position={[0, 1.45, 0]} title={`${n} · ${title}`} color={hot || sel ? '#fff' : '#dfe6ff'} size={0.38} />
        </>
      )}
    </Hotspot>
  );
}

const TREE = [
  [0, 0.75],
  [-0.7, 0.05],
  [0.7, 0.05],
  [-1.05, -0.65],
  [-0.35, -0.65],
  [0.7, -0.65],
];
const TREE_EDGES = [
  [0, 1],
  [0, 2],
  [1, 3],
  [1, 4],
  [2, 5],
];

export default function RenderScene() {
  return (
    <group>
      <LayerStack />

      <Station id="parse" x={-11} n={1} title="Parse → DOM" color={C.amber}>
        {hot => (
          <>
            {TREE_EDGES.map(([a, b]) => (
              <Wire key={`${a}${b}`} points={[[...TREE[a], 0], [...TREE[b], 0]]} color={C.amber} opacity={0.7} />
            ))}
            {TREE.map(([x, y], i) => (
              <mesh key={i} position={[x, y, 0]} raycast={noRaycast}>
                <sphereGeometry args={[0.17, 16, 16]} />
                <Glass color={C.amber} hot={hot} intensity={1.0} />
              </mesh>
            ))}
          </>
        )}
      </Station>

      <Station id="style" x={-6.6} n={2} title="Style" color={C.violet}>
        {() => (
          <>
            <FaceText position={[0, 0.2, 0.2]} size={1.05} color={C.violet}>{'{ }'}</FaceText>
            <FaceText position={[0, -0.75, 0.2]} size={0.2} color="#d9ccff">h1 · .card · #hero</FaceText>
          </>
        )}
      </Station>

      <Station id="layout" x={-2.2} n={3} title="Layout" color={C.green}>
        {() => (
          <>
            <Cage size={[2.2, 1.7, 0.3]} color={C.green} />
            <Cage size={[0.95, 1.25, 0.3]} color={C.green} position={[-0.52, 0, 0.05]} />
            <Cage size={[0.95, 0.55, 0.3]} color={C.green} position={[0.52, 0.32, 0.05]} />
            <Cage size={[0.95, 0.55, 0.3]} color={C.green} position={[0.52, -0.32, 0.05]} />
            <FaceText position={[0, -1.0, 0.2]} size={0.17} color="#c6f6df">x · y · width · height</FaceText>
          </>
        )}
      </Station>

      <Station id="paint" x={2.2} n={4} title="Paint" color={C.yellow}>
        {hot =>
          ['drawRect', 'drawText', 'drawImage'].map((t, i) => (
            <group key={t} position={[0, 0.5 - i * 0.5, 0]}>
              <mesh raycast={noRaycast}>
                <boxGeometry args={[2.3, 0.38, 0.1]} />
                <Glass color={C.yellow} hot={hot} intensity={0.4} />
              </mesh>
              <FaceText position={[0, 0, 0.07]} size={0.2} color="#fff6d6">{t}</FaceText>
            </group>
          ))
        }
      </Station>

      <Station id="composite" x={6.6} n={5} title="Composite" color={C.cyan}>
        {hot =>
          [0, 1, 2].map(i => (
            <mesh key={i} position={[-0.3 + i * 0.3, 0.1 - i * 0.12, -0.4 + i * 0.4]} raycast={noRaycast}>
              <planeGeometry args={[1.8, 1.2]} />
              <meshBasicMaterial color={C.cyan} transparent opacity={hot ? 0.45 : 0.25} side={2} />
              <Edges color={C.cyan} />
            </mesh>
          ))
        }
      </Station>

      <Station id="raster" x={11} n={6} title="Raster → GPU" color={C.pink}>
        {hot => (
          <>
            <mesh position={[0, -0.45, 0]} raycast={noRaycast}>
              <boxGeometry args={[1.7, 0.9, 0.3]} />
              <Glass color={C.pink} hot={hot} intensity={0.6} />
            </mesh>
            <FaceText position={[0, -0.45, 0.17]} size={0.22}>GPU</FaceText>
            {Array.from({ length: 6 }, (_, i) => (
              <mesh key={i} position={[-0.5 + (i % 3) * 0.5, 0.4 + Math.floor(i / 3) * 0.48, 0]} raycast={noRaycast}>
                <planeGeometry args={[0.42, 0.42]} />
                <meshBasicMaterial color={i % 2 ? '#ff9de6' : '#ffd1f3'} />
              </mesh>
            ))}
          </>
        )}
      </Station>

      <Flow points={[[-11, -3.4, 1.0], [-6.6, -3.2, 1.0], [-2.2, -3.4, 1.0], [2.2, -3.2, 1.0], [6.6, -3.4, 1.0], [11, -3.2, 1.0]]} color="#cfe0ff" count={7} speed={0.07} size={0.09} opacity={0.25} />
      <Wire points={[[6.6, -2.0, 0], [4.6, 0.0, 0]]} color={C.cyan} dashed opacity={0.55} />
    </group>
  );
}
