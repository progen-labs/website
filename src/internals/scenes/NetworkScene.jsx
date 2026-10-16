// Omnibox → navigation & network: the request travels left to right (amber)
// through DNS, the TCP/TLS handshake and HTTP to the server; the response
// streams back (green). The cache and service worker can short-circuit it.
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { Arrow, Bob, Border, C, CARD, CardMat, FaceText, Flow, Gear, Glass, HitBox, Hotspot, INK, INK_DIM, Label, Outline, Padlock, Spin, Wire, noRaycast } from '../primitives.jsx';

export const pose = { pos: [0, 3, 23], tgt: [0, -0.8, 0], span: 25.5, height: 11 };

const PATH = [
  [-10.5, 0.6, 0.6],
  [-6, 2.2, 0.2],
  [-0.6, 0.4, 1.2],
  [5, 2.2, 0.2],
  [10.2, 0.6, 0.6],
];

function Omnibox() {
  return (
    <Hotspot id="omnibox" position={[-10.5, 0, 0]}>
      {(hot, sel) => (
        <>
          <RoundedBox args={[4.6, 0.9, 0.4]} radius={0.2} smoothness={3}>
            <CardMat color={C.amber} level={hot || sel ? CARD.hot : CARD.idle} />
          </RoundedBox>
          <Border size={[4.6, 0.9, 0.4]} color={C.amber} />
          <FaceText position={[-2.0, 0, 0.22]} size={0.32} anchorX="left">progenlabs.dev|</FaceText>
          {['progenlabs.dev/internals', 'progen labs github', 'Search "progen labs"'].map((s, i) => (
            <group key={s} position={[0.1, -0.88 - i * 0.6, 0]}>
              <mesh raycast={noRaycast}>
                <boxGeometry args={[4.4, 0.52, 0.12]} />
                <CardMat color={C.amber} level={i === 0 ? 0.3 : 0.12} />
              </mesh>
              <FaceText position={[-2.0, 0, 0.08]} size={0.28} color={i === 0 ? INK : INK_DIM} anchorX="left">{s}</FaceText>
            </group>
          ))}
          <HitBox size={[4.8, 3.0, 0.6]} position={[0, -0.95, 0]} />
          {(hot || sel) && <Outline size={[4.6, 2.6, 0.4]} position={[0, -0.85, 0]} color={C.amber} />}
          <Label position={[0, 0.8, 0]} title="Omnibox" sub="you press Enter" subColor={C.amber} color={hot || sel ? '#fff' : '#dfe6ff'} />
        </>
      )}
    </Hotspot>
  );
}

function Dns() {
  return (
    <Hotspot id="dns" position={[-6, 2.2, -0.6]}>
      {(hot, sel) => (
        <>
          <Spin speed={0.35}>
            <mesh raycast={noRaycast}>
              <icosahedronGeometry args={[1.15, 1]} />
              <meshBasicMaterial color={C.cyan} wireframe transparent opacity={hot || sel ? 0.9 : 0.5} />
            </mesh>
          </Spin>
          <mesh raycast={noRaycast}>
            <sphereGeometry args={[0.8, 24, 24]} />
            <Glass color={C.cyan} hot={hot || sel} intensity={0.6} />
          </mesh>
          <HitBox size={[2.5, 2.5, 2.5]} />
          <FaceText position={[0, -1.6, 0.5]} size={0.3} color={INK}>name → 104.21.x.x</FaceText>
          <Label position={[0, 1.4, 0]} title="DNS lookup" sub="name → IP" subColor={C.cyan} color={hot || sel ? '#fff' : '#dfe6ff'} />
        </>
      )}
    </Hotspot>
  );
}

function Handshake() {
  const steps = [
    { y: 1.0, l2r: true, t: 'SYN', c: C.blue },
    { y: 0.35, l2r: false, t: 'SYN-ACK', c: C.blue },
    { y: -0.3, l2r: true, t: 'ACK', c: C.blue },
    { y: -0.95, l2r: true, t: 'TLS ClientHello', c: C.green },
    { y: -1.6, l2r: false, t: 'ServerHello · keys', c: C.green },
  ];
  return (
    <Hotspot id="handshake" position={[-0.6, 0.2, 0.4]}>
      {(hot, sel) => (
        <>
          {[-1.6, 1.6].map((x, i) => (
            <group key={x} position={[x, -0.3, 0]}>
              <mesh raycast={noRaycast}>
                <boxGeometry args={[0.32, 3.6, 0.32]} />
                <Glass color={i ? C.green : C.blue} hot={hot || sel} intensity={0.7} />
              </mesh>
              <FaceText position={[0, -2.15, 0.2]} size={0.3} color={INK_DIM}>{i ? 'server' : 'client'}</FaceText>
            </group>
          ))}
          {steps.map(s => (
            <group key={s.t}>
              <Arrow from={[s.l2r ? -1.42 : 1.42, s.y, 0]} to={[s.l2r ? 1.42 : -1.42, s.y - 0.22, 0]} color={s.c} head={0.22} width={1.8} />
              <FaceText position={[0, s.y + 0.2, 0.05]} size={0.28} color={INK}>{s.t}</FaceText>
            </group>
          ))}
          <group position={[0, 2.0, 0]}>
            <Padlock color={C.green} scale={0.9} />
          </group>
          <HitBox size={[3.8, 4.8, 1]} position={[0, -0.1, 0]} />
          {(hot || sel) && <Outline size={[3.8, 4.8, 0.6]} position={[0, -0.1, 0]} color={C.green} />}
          <Label position={[0, 2.55, 0]} title="TCP + TLS handshake" sub="secure connection" subColor={C.green} color={hot || sel ? '#fff' : '#dfe6ff'} />
        </>
      )}
    </Hotspot>
  );
}

function Http() {
  return (
    <Hotspot id="http" position={[5, 2.0, -0.6]}>
      {(hot, sel) => (
        <>
          <Bob amp={0.12} speed={1.3}>
            <group position={[-0.35, 0.4, 0.2]}>
              <RoundedBox args={[4.0, 1.1, 0.12]} radius={0.05}>
                <CardMat color={C.amber} level={hot || sel ? CARD.hot : CARD.idle} />
              </RoundedBox>
              <Border size={[4.0, 1.1, 0.12]} color={C.amber} />
              <FaceText position={[-1.8, 0.2, 0.08]} size={0.3} anchorX="left">GET /internals  HTTP/2</FaceText>
              <FaceText position={[-1.8, -0.22, 0.08]} size={0.28} color={INK_DIM} anchorX="left">accept: text/html</FaceText>
            </group>
          </Bob>
          <Bob amp={0.12} speed={1.3} phase={1.6}>
            <group position={[0.35, -0.95, -0.2]}>
              <RoundedBox args={[4.0, 1.1, 0.12]} radius={0.05}>
                <CardMat color={C.green} level={hot || sel ? CARD.hot : CARD.idle} />
              </RoundedBox>
              <Border size={[4.0, 1.1, 0.12]} color={C.green} />
              <FaceText position={[-1.8, 0.2, 0.08]} size={0.3} anchorX="left">200 OK · text/html</FaceText>
              <FaceText position={[-1.8, -0.22, 0.08]} size={0.28} color={INK_DIM} anchorX="left">max-age=600</FaceText>
            </group>
          </Bob>
          <HitBox size={[4.6, 3.0, 1]} position={[0, -0.2, 0]} />
          <Label position={[0, 1.25, 0]} title="HTTP request & response" sub="h2 / h3 streams" subColor={C.amber} color={hot || sel ? '#fff' : '#dfe6ff'} />
        </>
      )}
    </Hotspot>
  );
}

function Server() {
  const leds = useRef([]);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    leds.current.forEach((m, i) => {
      if (m) m.material.opacity = 0.35 + 0.65 * (Math.sin(t * 6 + i * 1.7) > 0.2 ? 1 : 0);
    });
  });
  return (
    <Hotspot id="server" position={[10.4, 0, 0]}>
      {(hot, sel) => (
        <>
          {[0.95, 0, -0.95].map((y, i) => (
            <group key={y} position={[0, y, 0]}>
              <RoundedBox args={[2.4, 0.78, 1.6]} radius={0.08}>
                <Glass color={C.violet} hot={hot || sel} intensity={0.45} />
              </RoundedBox>
              {[0, 1, 2].map(k => (
                <mesh key={k} ref={el => (leds.current[i * 3 + k] = el)} position={[-0.8 + k * 0.28, 0, 0.82]} raycast={noRaycast}>
                  <circleGeometry args={[0.07, 12]} />
                  <meshBasicMaterial color={C.green} transparent />
                </mesh>
              ))}
              <mesh position={[0.45, 0, 0.82]} raycast={noRaycast}>
                <planeGeometry args={[1.1, 0.12]} />
                <meshBasicMaterial color="#2a3352" />
              </mesh>
            </group>
          ))}
          <HitBox size={[2.6, 2.8, 1.8]} />
          <Label position={[0, 1.6, 0]} title="Origin / CDN edge" sub="TTFB" subColor={C.violet} color={hot || sel ? '#fff' : '#dfe6ff'} />
        </>
      )}
    </Hotspot>
  );
}

function Cache() {
  return (
    <Hotspot id="cache" position={[-9.6, -4.2, 0.8]}>
      {(hot, sel) => (
        <>
          {['memory', 'disk'].map((n, i) => (
            <group key={n} position={[i * 1.6 - 0.8, 0, 0]}>
              <mesh raycast={noRaycast}>
                <cylinderGeometry args={[0.6, 0.6, 1.3, 28]} />
                <Glass color={C.yellow} hot={hot || sel} intensity={0.5} />
              </mesh>
              <FaceText position={[0, -0.98, 0.4]} size={0.28} color={INK}>{n}</FaceText>
            </group>
          ))}
          <HitBox size={[3.4, 2.2, 1.4]} />
          <Label position={[0, 0.95, 0]} title="HTTP cache" sub="hit = no network" subColor={C.yellow} color={hot || sel ? '#fff' : '#dfe6ff'} />
        </>
      )}
    </Hotspot>
  );
}

function ServiceWorker() {
  return (
    <Hotspot id="serviceworker" position={[-4.4, -4.0, 1.0]}>
      {(hot, sel) => (
        <>
          <Spin speed={0.6} axis="z">
            <Gear r={0.7} color={C.pink} />
          </Spin>
          <HitBox size={[2.2, 2.2, 1]} />
          {(hot || sel) && <Outline size={[2.0, 2.0, 0.5]} color={C.pink} />}
          <Label position={[0, 1.2, 0]} title="Service worker" sub="programmable proxy" subColor={C.pink} color={hot || sel ? '#fff' : '#dfe6ff'} />
        </>
      )}
    </Hotspot>
  );
}

export default function NetworkScene() {
  const back = [...PATH].reverse().map(p => [p[0], p[1] - 0.55, p[2] + 0.3]);
  return (
    <group>
      <Omnibox />
      <Dns />
      <Handshake />
      <Http />
      <Server />
      <Cache />
      <ServiceWorker />
      <Flow points={PATH} color={C.amber} count={6} speed={0.09} size={0.12} />
      <Flow points={back} color={C.green} count={6} speed={0.09} size={0.12} offset={0.5} />
      {/* short-circuit paths */}
      <Wire points={[[-10.3, -1.9, 0.6], [-9.8, -3.2, 0.8]]} color={C.yellow} dashed opacity={0.6} />
      <Wire points={[[-8.4, -1.6, 0.6], [-5.2, -3.3, 1.0]]} color={C.pink} dashed opacity={0.6} />
      <Wire points={[[-3.6, -3.4, 1.0], [-2.3, -2.0, 0.8]]} color={C.pink} dashed opacity={0.6} />
      <FaceText position={[0, -6.0, 0]} size={0.3} color={INK_DIM}>amber = request · green = response · dashed = short-circuits</FaceText>
    </group>
  );
}
