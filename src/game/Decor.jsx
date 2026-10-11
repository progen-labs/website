import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';

function Ring({ position, radius = 2, color = '#36d6ff', speed = 0.4, tilt = 0 }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = clock.getElapsedTime() * speed;
  });
  return (
    <mesh ref={ref} position={position} rotation={[Math.PI / 2 + tilt, 0, 0]}>
      <torusGeometry args={[radius, 0.06, 10, 64]} />
      <meshStandardMaterial color="#0a1026" emissive={color} emissiveIntensity={1.5} roughness={0.2} />
    </mesh>
  );
}

function Nexus() {
  const g = useRef();
  useFrame(({ clock }) => {
    if (g.current) g.current.rotation.y = clock.getElapsedTime() * 0.15;
  });
  // A floating sculpture of concentric rings behind spawn — a landmark.
  return (
    <group ref={g} position={[0, 7, 22]}>
      <mesh rotation={[0, 0, 0]}>
        <torusGeometry args={[3.2, 0.09, 12, 80]} />
        <meshStandardMaterial color="#0a1026" emissive="#5b8bff" emissiveIntensity={1.6} />
      </mesh>
      <mesh rotation={[Math.PI / 2.5, 0, 0]}>
        <torusGeometry args={[2.4, 0.08, 12, 80]} />
        <meshStandardMaterial color="#0a1026" emissive="#36d6ff" emissiveIntensity={1.6} />
      </mesh>
      <mesh rotation={[0, Math.PI / 3, Math.PI / 2.5]}>
        <torusGeometry args={[1.6, 0.07, 12, 80]} />
        <meshStandardMaterial color="#0a1026" emissive="#ff6ad5" emissiveIntensity={1.6} />
      </mesh>
    </group>
  );
}

export default function Decor() {
  return (
    <group>
      <Nexus />
      <Ring position={[-18, 3, -18]} radius={2.4} color="#7c7cff" speed={0.5} tilt={0.3} />
      <Ring position={[18, 2.6, -18]} radius={1.9} color="#36d6ff" speed={-0.6} tilt={-0.2} />
      <Ring position={[-10, 2, 4]} radius={1.3} color="#ff6ad5" speed={0.8} />
      <Ring position={[9, 2.2, 8]} radius={1.6} color="#46e2a0" speed={-0.4} tilt={0.5} />

      {/* extra floating crystals for life */}
      {[
        [-24, 3, -24, '#7c7cff'],
        [24, 2.6, -24, '#36d6ff'],
        [-6, 2.4, -20, '#ff6ad5'],
        [7, 2.1, -22, '#46e2a0'],
        [-20, 2.2, 10, '#36d6ff'],
        [20, 2.4, 10, '#7c7cff'],
      ].map(([x, y, z, c], i) => (
        <Float key={i} speed={2} floatIntensity={1.3} rotationIntensity={0.5}>
          <mesh position={[x, y, z]}>
            <octahedronGeometry args={[0.6, 0]} />
            <meshStandardMaterial color="#0a1026" emissive={c} emissiveIntensity={1.3} roughness={0.2} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}
