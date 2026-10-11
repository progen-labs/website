import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { dotTexture } from './sprite.js';

const COLS = 150;
const ROWS = 90;
const SPREAD_X = 34;
const SPREAD_Z = 22;
const COUNT = COLS * ROWS;

/**
 * A flowing field of spectrum-colored points — white light split across the
 * visible spectrum, rippling like a waveform. The "Spectra" made literal.
 */
export default function SpectrumField({ pointer }) {
  const pointsRef = useRef();
  const groupRef = useRef();

  const { positions, colors, base } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const base = new Float32Array(COUNT * 2);
    const color = new THREE.Color();
    let i = 0;
    for (let xi = 0; xi < COLS; xi++) {
      for (let zi = 0; zi < ROWS; zi++) {
        const x = (xi / (COLS - 1) - 0.5) * SPREAD_X;
        const z = (zi / (ROWS - 1) - 0.5) * SPREAD_Z;
        positions[i * 3] = x;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = z;
        base[i * 2] = x;
        base[i * 2 + 1] = z;
        // Spectrum hue swept across x: deep violet → blue → cyan → magenta.
        const hue = 0.52 + (xi / (COLS - 1)) * 0.42;
        color.setHSL(hue % 1, 0.8, 0.6);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
        i++;
      }
    }
    return { positions, colors, base };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const geo = pointsRef.current?.geometry;
    if (!geo) return;
    const pos = geo.attributes.position.array;
    for (let i = 0; i < COUNT; i++) {
      const x = base[i * 2];
      const z = base[i * 2 + 1];
      pos[i * 3 + 1] =
        Math.sin(x * 0.35 + t * 0.9) * 0.9 +
        Math.cos(z * 0.55 + t * 0.7) * 0.8 +
        Math.sin((x + z) * 0.22 + t * 1.25) * 0.5;
    }
    geo.attributes.position.needsUpdate = true;

    if (groupRef.current) {
      const px = pointer?.current?.x ?? 0;
      const py = pointer?.current?.y ?? 0;
      // Gentle drift + subtle parallax toward the cursor.
      groupRef.current.rotation.y = t * 0.05 + px * 0.25;
      groupRef.current.rotation.x = -0.62 + py * 0.12;
    }
  });

  return (
    <group ref={groupRef} rotation={[-0.62, 0, 0]} position={[0, -2.2, 0]}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={COUNT}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={COUNT}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.11}
          map={dotTexture()}
          vertexColors
          transparent
          opacity={0.9}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
