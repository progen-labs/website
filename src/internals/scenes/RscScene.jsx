// Server Components: async components on the server read the database and
// render into the RSC payload, which streams over the "use client" boundary
// to the browser, where only the Client Components hydrate. A Server Function
// call travels back the other way.
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { C, Cage, CardMat, Chip, FaceText, Flow, Glass, INK, Label, Region, noRaycast, paintCard } from '../primitives.jsx';

export const pose = { pos: [0, 1.4, 23], tgt: [-0.2, 0.6, 0], span: 25, height: 11 };

const SX = -7.2;
const CX = 6.8;

function Payload() {
  const refs = useRef([]);
  const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-3.9, 2.9, 0.4), new THREE.Vector3(-0.6, 5.2, 0.8), new THREE.Vector3(2.8, 2.9, 0.4));
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.32;
    refs.current.forEach((m, i) => {
      if (m) curve.getPoint((t + i / 3) % 1, m.position);
    });
  });
  return [0, 1, 2].map(i => (
    <group key={i} ref={el => (refs.current[i] = el)}>
      <mesh raycast={noRaycast}>
        <boxGeometry args={[3.3, 0.5, 0.12]} />
        <CardMat color={C.amber} level={0.34} />
      </mesh>
      <FaceText position={[0, 0, 0.07]} size={0.28} color={INK}>{['J0:["$","article"]', 'M1:{"id":"Like.js"}', 'J2:["$","@1"]'][i]}</FaceText>
    </group>
  ));
}

export default function RscScene() {
  const hydrate = useRef([]);
  useFrame(({ clock }) => {
    const u = clock.getElapsedTime() % 5;
    hydrate.current.forEach((m, i) => {
      paintCard(m, C.blue, u > 1.5 + i * 0.8 ? 0.42 : 0.12);
    });
  });

  return (
    <group>
      {/* zones */}
      <Cage size={[7.4, 7.6, 2.4]} color="#3a8f6a" position={[SX, 0.2, -0.4]} />
      <Label position={[SX, 4.25, 0]} title="SERVER" sub="runs once per request" subColor={C.green} size={0.42} />
      <Cage size={[7.0, 7.6, 2.4]} color="#3a5a9f" position={[CX, 0.2, -0.4]} />
      <Label position={[CX, 4.25, 0]} title="BROWSER" sub="ships JS only for client parts" subColor={C.blue} size={0.42} />

      <Region id="server-tree" position={[SX + 0.6, 1.0, 0]} size={[5.6, 4.0, 0.6]} color={C.green} label="Server Components" labelY={-2.35}>
        {hot => (
          <>
            <Chip position={[0, 1.4, 0]} size={[3.9, 0.62, 0.4]} color={C.green} text="async function Page()" textSize={0.29} hot={hot} />
            <Chip position={[-1.5, 0, 0]} size={[2.65, 0.62, 0.4]} color={C.green} text="<Post> await db" textSize={0.28} hot={hot} />
            <Chip position={[1.5, 0, 0]} size={[2.65, 0.62, 0.4]} color={C.green} text="<Sidebar>" hot={hot} />
            <Chip position={[0, -1.4, 0]} size={[2.6, 0.62, 0.4]} color={C.green} text="<Comments>" hot={hot} />
          </>
        )}
      </Region>

      <Region id="db" position={[SX - 2.1, -2.55, 0]} size={[1.8, 1.8, 1.2]} color={C.yellow} label="database" labelY={1.0}>
        {hot => (
          <mesh raycast={noRaycast}>
            <cylinderGeometry args={[0.65, 0.65, 1.2, 28]} />
            <Glass color={C.yellow} hot={hot} intensity={0.6} />
          </mesh>
        )}
      </Region>
      <Flow points={[[SX - 2.1, -1.8, 0.4], [SX - 1.6, -0.6, 0.6], [SX - 0.9, 0.6, 0.4]]} color={C.yellow} count={3} speed={0.45} size={0.08} />

      {/* the boundary */}
      <Region id="boundary" position={[-2.5, -0.3, 0]} size={[0.9, 6.0, 2.4]} color={C.pink} label='"use client"' labelY={-3.4}>
        {hot => (
          <mesh rotation={[0, Math.PI / 2, 0]} raycast={noRaycast}>
            <planeGeometry args={[2.4, 6.0]} />
            <meshBasicMaterial color={C.pink} transparent opacity={hot ? 0.35 : 0.14} side={2} depthWrite={false} />
          </mesh>
        )}
      </Region>

      <Region id="payload" position={[-0.6, 3.9, 0.4]} size={[7.4, 2.2, 1.0]} color={C.amber} label="RSC payload (Flight)" labelY={1.45}>
        <Payload />
      </Region>

      <Region id="client-tree" position={[CX, 0.7, 0]} size={[6.2, 3.6, 0.6]} color={C.blue} label="Client Components hydrate" labelY={-2.05}>
        {hot => (
          <>
            <Chip position={[-1.5, 1.0, 0]} size={[2.6, 0.62, 0.4]} color={C.grey} text="server HTML" hot={hot} dim={!hot} />
            <Chip position={[1.5, 1.0, 0]} size={[2.6, 0.62, 0.4]} color={C.grey} text="server HTML" hot={hot} dim={!hot} />
            <Chip position={[-1.5, -0.6, 0]} size={[2.6, 0.62, 0.4]} color={C.blue} text="<LikeButton>" hot={hot} matRef={el => (hydrate.current[0] = el)} />
            <Chip position={[1.5, -0.6, 0]} size={[2.6, 0.62, 0.4]} color={C.blue} text="<CommentForm>" hot={hot} matRef={el => (hydrate.current[1] = el)} />
          </>
        )}
      </Region>

      <Flow points={[[CX + 1.5, -1.2, 0.5], [2.0, -3.3, 0.9], [SX + 0.6, -1.0, 0.5]]} color={C.pink} count={3} speed={0.25} size={0.09} opacity={0.45} />
      <Region id="actions" position={[1.0, -3.6, 0]} size={[5.4, 0.9, 0.6]} color={C.pink}>
        {hot => <Chip size={[5.2, 0.72, 0.4]} color={C.pink} text={'"use server" → submit(form)'} textSize={0.3} hot={hot} />}
      </Region>
    </group>
  );
}
