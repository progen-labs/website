import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

/**
 * A project gate. Two pillars + an arch frame a glowing portal; two doors slide
 * apart when `open`. `active` (player nearby) brightens everything.
 */
export default function Portal({
  position = [0, 0, 0],
  label = 'PROJECT',
  sub = '',
  color = '#39e0ff',
  open = false,
  active = false,
  locked = false,
}) {
  const left = useRef();
  const right = useRef();
  const glow = useRef();
  const frame = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const o = open ? 1 : 0;
    if (left.current) left.current.position.x += (-0.9 - 2.4 * o - left.current.position.x) * 0.06;
    if (right.current) right.current.position.x += (0.9 + 2.4 * o - right.current.position.x) * 0.06;
    if (glow.current) {
      const target = (active ? 0.75 : 0.32) + Math.sin(t * 2) * 0.06 + o * 0.5;
      glow.current.material.opacity += (target - glow.current.material.opacity) * 0.1;
    }
  });

  const emissive = locked ? '#55607e' : color;
  const ei = active ? 2.2 : 1.1;

  return (
    <group position={position}>
      {/* pillars */}
      {[-2.2, 2.2].map(x => (
        <mesh key={x} position={[x, 2.6, 0]} castShadow>
          <boxGeometry args={[0.5, 5.2, 0.5]} />
          <meshStandardMaterial color="#0d1430" emissive={emissive} emissiveIntensity={ei * 0.5} metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
      {/* arch */}
      <mesh ref={frame} position={[0, 5.4, 0]}>
        <boxGeometry args={[5.1, 0.5, 0.5]} />
        <meshStandardMaterial color="#0d1430" emissive={emissive} emissiveIntensity={ei * 0.6} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* portal glow */}
      <mesh ref={glow} position={[0, 2.55, -0.05]}>
        <planeGeometry args={[3.7, 4.9]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {/* doors */}
      {!locked && (
        <>
          <mesh ref={left} position={[-0.9, 2.55, 0.12]}>
            <boxGeometry args={[1.8, 4.9, 0.18]} />
            <meshStandardMaterial color="#0a1026" emissive={color} emissiveIntensity={0.35} metalness={0.7} roughness={0.25} />
          </mesh>
          <mesh ref={right} position={[0.9, 2.55, 0.12]}>
            <boxGeometry args={[1.8, 4.9, 0.18]} />
            <meshStandardMaterial color="#0a1026" emissive={color} emissiveIntensity={0.35} metalness={0.7} roughness={0.25} />
          </mesh>
        </>
      )}
      {/* base ring */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.3, 2.7, 48]} />
        <meshBasicMaterial color={color} transparent opacity={active ? 0.8 : 0.4} side={THREE.DoubleSide} />
      </mesh>
      {/* labels */}
      <Text position={[0, 6.4, 0]} fontSize={0.8} color={locked ? '#8a93b5' : '#ffffff'} anchorX="center" anchorY="middle" outlineWidth={0.012} outlineColor="#05060e">
        {label}
      </Text>
      {sub ? (
        <Text position={[0, 5.75, 0]} fontSize={0.32} color={locked ? '#9aa3bd' : color} anchorX="center" anchorY="middle">
          {sub}
        </Text>
      ) : null}
    </group>
  );
}
