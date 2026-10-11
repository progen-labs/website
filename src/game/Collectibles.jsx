import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

// Hand-placed orb trails: a path toward Spectra, clusters by the side gates,
// and a few out in the open to reward exploration.
const Y = 1.3;
export const ORBS = [
  [0, Y, -5], [0, Y, -10], [0, Y, -15], // trail to Spectra
  [-5, Y, -8], [5, Y, -12],
  [-16, Y, -4], [-22, Y, -4], [-24, Y, -10], // toward left gate
  [16, Y, -4], [22, Y, -4], [24, Y, -10], // toward right gate
  [-10, Y, 12], [10, Y, 12], [0, Y, 18], // behind spawn
  [-34, Y, -20], [34, Y, -20], // far corners
  [-14, Y, -24], [14, Y, -24],
];
export const TOTAL_ORBS = ORBS.length;

export default function Collectibles({ posRef, onCollect }) {
  const refs = useRef([]);
  const collected = useRef(new Array(ORBS.length).fill(false));

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const px = posRef.current.x;
    const pz = posRef.current.z;
    for (let i = 0; i < ORBS.length; i++) {
      const m = refs.current[i];
      if (!m || collected.current[i]) continue;
      m.position.y = ORBS[i][1] + Math.sin(t * 2 + i) * 0.22;
      m.rotation.y = t * 1.6 + i;
      m.rotation.x = t * 0.8;
      if (Math.hypot(px - ORBS[i][0], pz - ORBS[i][2]) < 1.7) {
        collected.current[i] = true;
        m.visible = false;
        onCollect();
      }
    }
  });

  return (
    <group>
      {ORBS.map((p, i) => (
        <mesh key={i} ref={el => (refs.current[i] = el)} position={p}>
          <icosahedronGeometry args={[0.36, 0]} />
          <meshStandardMaterial color="#5a3d00" emissive="#ffcf4d" emissiveIntensity={1.7} roughness={0.15} metalness={0.5} />
        </mesh>
      ))}
    </group>
  );
}
