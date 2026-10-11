import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Line, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';
import { FLOW, GROUPS, NODES, NODE_BY_ID } from './internals-data.js';

const ACTIVATE_DIST = 6.8;
const SPEED = 15;
const BOUNDS = { x: 42, zMin: -54, zMax: 13 };

function NodeShape({ idx, color, active }) {
  const ref = useRef();
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * (active ? 0.9 : 0.35);
    ref.current.rotation.x += dt * 0.15;
  });
  const geom = idx % 5;
  return (
    <mesh ref={ref}>
      {geom === 0 && <icosahedronGeometry args={[1.25, 0]} />}
      {geom === 1 && <octahedronGeometry args={[1.35, 0]} />}
      {geom === 2 && <dodecahedronGeometry args={[1.2, 0]} />}
      {geom === 3 && <torusGeometry args={[1.0, 0.34, 12, 28]} />}
      {geom === 4 && <boxGeometry args={[1.7, 1.7, 1.7]} />}
      <meshStandardMaterial
        color="#0a1024"
        emissive={color}
        emissiveIntensity={active ? 2.3 : 1.1}
        roughness={0.25}
        metalness={0.5}
        flatShading
      />
    </mesh>
  );
}

function Station({ node, idx, active }) {
  const accent = GROUPS[node.group].accent;
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    // gentle float, with a stronger bob when you're parked next to it
    ref.current.position.y = node.pos[1] + Math.sin(t * 1.1 + idx) * (active ? 0.4 : 0.22);
    const s = active ? 1.14 + Math.sin(t * 4) * 0.04 : 1;
    ref.current.scale.setScalar(s);
  });
  return (
    <group position={node.pos}>
      <group ref={ref}>
        <NodeShape idx={idx} color={accent} active={active} />
        {/* halo ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.1, 0.035, 8, 48]} />
          <meshBasicMaterial color={accent} transparent opacity={active ? 0.9 : 0.4} />
        </mesh>
        <pointLight color={accent} intensity={active ? 26 : 10} distance={14} />
      </group>

      <Billboard position={[0, 2.9, 0]}>
        <Text fontSize={0.62} color="#ffffff" anchorX="center" anchorY="bottom" outlineWidth={0.012} outlineColor="#05060e" maxWidth={7}>
          {node.title}
        </Text>
        <Text position={[0, -0.18, 0]} fontSize={0.34} color={accent} anchorX="center" anchorY="top" maxWidth={8}>
          {node.tag}
        </Text>
      </Billboard>

      {active && (
        <Billboard position={[0, -2.4, 0]}>
          <Text fontSize={0.4} color="#dfe6ff" anchorX="center" anchorY="middle" outlineWidth={0.01} outlineColor="#05060e">
            ▶ press ENTER
          </Text>
        </Billboard>
      )}
    </group>
  );
}

function FlowLine({ ids, color }) {
  const points = useMemo(
    () => ids.map(id => new THREE.Vector3(...NODE_BY_ID[id].pos)),
    [ids],
  );
  return <Line points={points} color={color} lineWidth={1.4} transparent opacity={0.3} dashed dashSize={0.6} gapSize={0.4} />;
}

function Probe({ input, posRef, frozen, onNear }) {
  const body = useRef();
  const vel = useRef(0);
  const lastNear = useRef(undefined);
  const dir = useRef(new THREE.Vector3(0, 0, -1));

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const p = posRef.current;
    const i = input.current;

    let mx = 0;
    let mz = 0;
    if (!frozen.current) {
      mx = (i.right ? 1 : 0) - (i.left ? 1 : 0) + (i.x || 0);
      mz = (i.down ? 1 : 0) - (i.up ? 1 : 0) + (i.z || 0);
      const len = Math.hypot(mx, mz) || 1;
      if (len > 1) {
        mx /= len;
        mz /= len;
      }
      p.x = THREE.MathUtils.clamp(p.x + mx * SPEED * dt, -BOUNDS.x, BOUNDS.x);
      p.z = THREE.MathUtils.clamp(p.z + mz * SPEED * dt, BOUNDS.zMin, BOUNDS.zMax);
    }

    const moving = Math.hypot(mx, mz) > 0.05;
    vel.current = THREE.MathUtils.lerp(vel.current, moving ? 1 : 0, 0.12);
    if (moving) dir.current.set(mx, 0, mz).normalize();

    // place + animate the drone
    if (body.current) {
      const t = state.clock.getElapsedTime();
      body.current.position.set(p.x, 2.2 + Math.sin(t * 2.4) * 0.18, p.z);
      const targetYaw = Math.atan2(dir.current.x, dir.current.z);
      body.current.rotation.y = THREE.MathUtils.lerp(body.current.rotation.y, targetYaw, 0.15);
      body.current.rotation.z = -mx * 0.35;
      body.current.rotation.x = mz * 0.22;
    }

    // chase camera
    const cam = state.camera;
    const camTarget = new THREE.Vector3(p.x, 2.2, p.z).add(new THREE.Vector3(0, 6.2, 12.5));
    cam.position.lerp(camTarget, 1 - Math.pow(0.0025, dt));
    cam.lookAt(p.x, 3.4, p.z - 6);

    // nearest station
    let near = null;
    let best = ACTIVATE_DIST;
    for (const n of NODES) {
      const d = Math.hypot(p.x - n.pos[0], (2.2 - n.pos[1]) * 0.6, p.z - n.pos[2]);
      if (d < best) {
        best = d;
        near = n.id;
      }
    }
    if (near !== lastNear.current) {
      lastNear.current = near;
      onNear(near);
    }
  });

  return (
    <group ref={body}>
      {/* glowing core */}
      <mesh>
        <icosahedronGeometry args={[0.5, 1]} />
        <meshStandardMaterial color="#071225" emissive="#8fdcff" emissiveIntensity={2.4} roughness={0.2} metalness={0.6} flatShading />
      </mesh>
      {/* orbiting ring */}
      <mesh rotation={[Math.PI / 2.3, 0, 0]}>
        <torusGeometry args={[0.95, 0.06, 8, 40]} />
        <meshBasicMaterial color="#9ad8ff" transparent opacity={0.85} />
      </mesh>
      {/* twin thrusters */}
      <mesh position={[0, -0.05, 0.75]}>
        <coneGeometry args={[0.18, 0.6, 10]} />
        <meshBasicMaterial color="#59e3ff" transparent opacity={0.5 + vel.current * 0.5} />
      </mesh>
      <pointLight color="#8fdcff" intensity={18} distance={16} />
    </group>
  );
}

export default function InternalsWorld({ input, posRef, frozen, onNear, activeId }) {
  return (
    <>
      <fog attach="fog" args={['#05070f', 28, 90]} />
      <ambientLight intensity={0.5} color="#c7d4ff" />
      <directionalLight position={[12, 24, 10]} intensity={0.7} color="#cfe0ff" />
      <directionalLight position={[-14, 10, -20]} intensity={0.35} color="#ff9a6b" />

      <Stars radius={150} depth={70} count={2600} factor={4} fade speed={0.3} />

      {/* reflective floor grid plane */}
      <gridHelper args={[180, 90, '#20305c', '#141d38']} position={[0, 0, -18]} />

      {/* group banners */}
      <Billboard position={[-19, 9.5, -4]}>
        <Text fontSize={1.1} color={GROUPS.browser.accent} anchorX="center" outlineWidth={0.02} outlineColor="#05060e">
          BROWSER INTERNALS
        </Text>
      </Billboard>
      <Billboard position={[19, 9.5, -4]}>
        <Text fontSize={1.1} color={GROUPS.react.accent} anchorX="center" outlineWidth={0.02} outlineColor="#05060e">
          REACT INTERNALS
        </Text>
      </Billboard>

      <FlowLine ids={FLOW.browser} color={GROUPS.browser.accent} />
      <FlowLine ids={FLOW.react} color={GROUPS.react.accent} />

      {NODES.map((n, i) => (
        <Station key={n.id} node={n} idx={i} active={activeId === n.id} />
      ))}

      <Probe input={input} posRef={posRef} frozen={frozen} onNear={onNear} />
    </>
  );
}
