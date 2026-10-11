import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Tree({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.16, 0.22, 1.4, 8]} />
        <meshStandardMaterial color="#3a2616" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.7, 0]}>
        <coneGeometry args={[0.95, 1.7, 9]} />
        <meshStandardMaterial color="#1f6b3f" emissive="#0e3a22" emissiveIntensity={0.5} roughness={0.7} />
      </mesh>
      <mesh position={[0, 2.55, 0]}>
        <coneGeometry args={[0.68, 1.3, 9]} />
        <meshStandardMaterial color="#2b864f" emissive="#145031" emissiveIntensity={0.6} roughness={0.7} />
      </mesh>
    </group>
  );
}

function Mushroom({ position, color }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.24, 0]}>
        <cylinderGeometry args={[0.09, 0.12, 0.48, 8]} />
        <meshStandardMaterial color="#efe7d6" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.52, 0]}>
        <sphereGeometry args={[0.3, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.3} roughness={0.4} />
      </mesh>
    </group>
  );
}

function Fireflies() {
  const ref = useRef();
  const { positions, base } = useMemo(() => {
    const n = 200;
    const positions = new Float32Array(n * 3);
    const base = new Float32Array(n * 2);
    for (let i = 0; i < n; i++) {
      const r = 6 + Math.random() * 42;
      const a = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = 0.8 + Math.random() * 4;
      positions[i * 3 + 2] = Math.sin(a) * r;
      base[i * 2] = positions[i * 3 + 1];
      base[i * 2 + 1] = Math.random() * Math.PI * 2;
    }
    return { positions, base };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const geo = ref.current?.geometry;
    if (!geo) return;
    const p = geo.attributes.position.array;
    for (let i = 0; i < p.length / 3; i++) {
      p[i * 3 + 1] = base[i * 2] + Math.sin(t * 0.8 + base[i * 2 + 1]) * 0.5;
    }
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.16} color="#ffe6a0" transparent opacity={0.9} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

const TREES = [
  [-14, 0, 14], [-20, 0, 8], [-8, 0, 16], [16, 0, 14], [22, 0, 9], [10, 0, 17],
  [-38, 0, -14], [38, 0, -14], [-18, 0, -20], [18, 0, -20], [-42, 0, 6], [42, 0, 6],
];
const MUSHROOMS = [
  [-5, 0, -8, '#ff6ad5'], [6, 0, -12, '#7c7cff'], [-12, 0, 2, '#46e2a0'],
  [12, 0, 4, '#36d6ff'], [-24, 0, -8, '#ffcf4d'], [24, 0, -8, '#ff6ad5'],
  [3, 0, 8, '#46e2a0'], [-7, 0, 10, '#7c7cff'],
];

export default function FantasyProps() {
  return (
    <group>
      {TREES.map((p, i) => (
        <Tree key={i} position={p} scale={0.9 + ((i * 7) % 5) * 0.12} />
      ))}
      {MUSHROOMS.map(([x, y, z, c], i) => (
        <Mushroom key={i} position={[x, y, z]} color={c} />
      ))}
      <Fireflies />
    </group>
  );
}
