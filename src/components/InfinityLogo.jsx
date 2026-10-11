import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { dotTexture } from './sprite.js';

const SCALE = 3.4;
const PARTICLES = 460;
const PATH_SEGMENTS = 420;
const NODE_COUNT = 6;

// Lemniscate of Bernoulli — a horizontal figure-eight, i.e. the ∞ mark.
function lemniscate(t, out) {
  const d = 1 + Math.sin(t) * Math.sin(t);
  out.set((SCALE * Math.cos(t)) / d, (SCALE * Math.sin(t) * Math.cos(t)) / d, 0);
  return out;
}

/**
 * An animated version of the Progen Labs infinity mark: a dim traced path with
 * bright energy streaming through it, HUD nodes pulsing on the ring, and a
 * glowing core at the crossing. Cyan→blue, additive, gently rotating in 3D.
 */
export default function InfinityLogo() {
  const groupRef = useRef();
  const particlesRef = useRef();
  const coreRef = useRef();
  const nodeRefs = useRef([]);

  const pathPoints = useMemo(() => {
    const pts = [];
    const v = new THREE.Vector3();
    for (let i = 0; i <= PATH_SEGMENTS; i++) {
      lemniscate((i / PATH_SEGMENTS) * Math.PI * 2, v);
      pts.push(v.clone());
    }
    return pts;
  }, []);

  const { positions, colors, phases } = useMemo(() => {
    const positions = new Float32Array(PARTICLES * 3);
    const colors = new Float32Array(PARTICLES * 3);
    const phases = new Float32Array(PARTICLES);
    const color = new THREE.Color();
    for (let i = 0; i < PARTICLES; i++) {
      phases[i] = (i / PARTICLES) * Math.PI * 2;
      // Cyan → electric blue, matching the brand mark. Lower lightness keeps the
      // colour vivid under additive blending instead of blowing out to white.
      color.setHSL(0.5 + (i / PARTICLES) * 0.07, 1.0, 0.52);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    return { positions, colors, phases };
  }, []);

  const nodePhases = useMemo(
    () => Array.from({ length: NODE_COUNT }, (_, i) => (i / NODE_COUNT) * Math.PI * 2),
    [],
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const v = new THREE.Vector3();

    const geo = particlesRef.current?.geometry;
    if (geo) {
      const pos = geo.attributes.position.array;
      for (let i = 0; i < PARTICLES; i++) {
        const p = (phases[i] + t * 0.6) % (Math.PI * 2);
        lemniscate(p, v);
        pos[i * 3] = v.x;
        pos[i * 3 + 1] = v.y + Math.sin(t * 2 + i) * 0.02;
        pos[i * 3 + 2] = Math.sin(p * 2 + t) * 0.18;
      }
      geo.attributes.position.needsUpdate = true;
    }

    nodeRefs.current.forEach((m, i) => {
      if (!m) return;
      lemniscate(nodePhases[i], v);
      m.position.set(v.x, v.y, 0);
      const s = 0.09 + Math.sin(t * 2.5 + i) * 0.03;
      m.scale.setScalar(s);
    });

    if (coreRef.current) {
      coreRef.current.scale.setScalar(0.22 + Math.sin(t * 3) * 0.05);
    }

    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.4;
      groupRef.current.rotation.z = Math.sin(t * 0.25) * 0.04;
    }
  });

  return (
    <group ref={groupRef} position={[0, 1.35, 0]}>
      <Line
        points={pathPoints}
        color="#39e0ff"
        lineWidth={1.4}
        transparent
        opacity={0.32}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
      <Line
        points={pathPoints}
        color="#5b8bff"
        lineWidth={4}
        transparent
        opacity={0.08}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />

      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={PARTICLES} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={PARTICLES} array={colors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={0.22}
          map={dotTexture()}
          vertexColors
          transparent
          opacity={0.85}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {nodePhases.map((_, i) => (
        <mesh key={i} ref={el => (nodeRefs.current[i] = el)}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial
            color="#7fdcff"
            transparent
            opacity={0.8}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}

      <mesh ref={coreRef}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial
          color="#6fd6ff"
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
