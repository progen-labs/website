import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const SPEED = 8;
const BOUND = 46;
const vel = new THREE.Vector3();

/**
 * The player: a small glowing drone-being. WASD / arrow keys move it across the
 * world (frozen during cinematics). Position is written to posRef so the camera
 * and proximity checks can follow it.
 */
export default function Character({ keys, move, posRef, frozen }) {
  const group = useRef();
  const ring = useRef();
  const angle = useRef(0);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const t = performance.now() / 1000;
    const d = Math.min(delta, 0.05);

    let ix = 0;
    let iz = 0;
    if (!frozen) {
      const k = keys.current;
      if (k['w'] || k['arrowup']) iz -= 1;
      if (k['s'] || k['arrowdown']) iz += 1;
      if (k['a'] || k['arrowleft']) ix -= 1;
      if (k['d'] || k['arrowright']) ix += 1;
      // joystick (touch) input
      if (move) {
        ix += move.current.x;
        iz += move.current.z;
      }
    }
    let len = Math.hypot(ix, iz);
    if (len > 1) {
      ix /= len;
      iz /= len;
      len = 1;
    }
    vel.x += (ix * SPEED - vel.x) * 0.2;
    vel.z += (iz * SPEED - vel.z) * 0.2;

    posRef.current.x = THREE.MathUtils.clamp(posRef.current.x + vel.x * d, -BOUND, BOUND);
    posRef.current.z = THREE.MathUtils.clamp(posRef.current.z + vel.z * d, -BOUND, BOUND);

    g.position.x = posRef.current.x;
    g.position.z = posRef.current.z;
    g.position.y = 1.2 + Math.sin(t * 3) * 0.09;

    if (len > 0.01) angle.current = Math.atan2(vel.x, vel.z);
    // shortest-path rotation toward heading
    let diff = angle.current - g.rotation.y;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    g.rotation.y += diff * 0.2;

    if (ring.current) ring.current.rotation.z = t * 1.6;
  });

  return (
    <group ref={group}>
      {/* body */}
      <mesh castShadow>
        <capsuleGeometry args={[0.5, 1, 10, 20]} />
        <meshStandardMaterial color="#232c5e" emissive="#2f6bff" emissiveIntensity={0.5} roughness={0.35} metalness={0.5} />
      </mesh>
      {/* glowing core / head */}
      <mesh position={[0, 0.95, 0]}>
        <sphereGeometry args={[0.4, 28, 28]} />
        <meshStandardMaterial color="#0a1330" emissive="#39e0ff" emissiveIntensity={1.6} roughness={0.2} />
      </mesh>
      {/* facing fin */}
      <mesh position={[0, 0.95, 0.46]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.12, 0.34, 14]} />
        <meshStandardMaterial color="#aef3ff" emissive="#aef3ff" emissiveIntensity={1.8} />
      </mesh>
      {/* hover ring */}
      <mesh ref={ring} position={[0, -0.75, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.75, 0.045, 10, 48]} />
        <meshStandardMaterial color="#39e0ff" emissive="#39e0ff" emissiveIntensity={1.3} />
      </mesh>
    </group>
  );
}
