import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Grid, Stars, Text, Float } from '@react-three/drei';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import * as THREE from 'three';
import Character from './Character.jsx';
import Portal from './Portal.jsx';
import CameraRig from './CameraRig.jsx';
import Collectibles from './Collectibles.jsx';
import Decor from './Decor.jsx';

export const SPECTRA_POS = [0, 0, -26];
const LOCKED_1 = [-30, 0, -4];
const LOCKED_2 = [30, 0, -4];

function Proximity({ posRef, target, radius, onChange }) {
  const inside = useRef(false);
  useFrame(() => {
    const near = Math.hypot(posRef.current.x - target[0], posRef.current.z - target[2]) < radius;
    if (near !== inside.current) {
      inside.current = near;
      onChange(near);
    }
  });
  return null;
}

function Crystal({ position, color }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.4;
  });
  return (
    <Float speed={2} floatIntensity={1.2} rotationIntensity={0.4}>
      <mesh ref={ref} position={position}>
        <octahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial color="#0a1026" emissive={color} emissiveIntensity={1.4} roughness={0.2} metalness={0.4} />
      </mesh>
    </Float>
  );
}

export default function World({ keys, move, posRef, phase, nearSpectra, setNearSpectra, onCollect }) {
  return (
    <>
      <color attach="background" args={['#05060e']} />
      <fog attach="fog" args={['#05060e', 32, 95]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[12, 22, 10]} intensity={0.7} color="#9fb4ff" />
      <pointLight position={[0, 7, -24]} intensity={60} distance={45} color="#39e0ff" />
      <pointLight position={[-30, 5, -4]} intensity={25} distance={30} color="#7c7cff" />
      <pointLight position={[30, 5, -4]} intensity={25} distance={30} color="#ff6ad5" />

      <Stars radius={130} depth={60} count={2600} factor={4} fade speed={0.4} />

      <Grid
        args={[160, 160]}
        cellSize={2}
        cellThickness={0.6}
        sectionSize={10}
        sectionThickness={1.3}
        cellColor="#141d3a"
        sectionColor="#2f6bff"
        fadeDistance={80}
        fadeStrength={1.4}
        infiniteGrid
        position={[0, 0.01, 0]}
      />

      {/* ground wordmark near spawn */}
      <Text
        position={[0, 0.02, 11]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={2.6}
        letterSpacing={0.05}
        color="#3550a0"
        fillOpacity={0.55}
        anchorX="center"
        anchorY="middle"
      >
        PROGEN LABS
      </Text>

      <Decor />
      <Collectibles posRef={posRef} onCollect={onCollect} />

      <Character keys={keys} move={move} posRef={posRef} frozen={phase !== 'explore'} />

      <Portal position={SPECTRA_POS} label="SPECTRA" sub="frontend performance profiler" color="#39e0ff" active={nearSpectra} open={phase === 'entering'} />
      <Portal position={LOCKED_1} label="ARCADE" sub="coming soon" color="#7c7cff" locked />
      <Portal position={LOCKED_2} label="COMMUNITY" sub="coming soon" color="#ff6ad5" locked />

      <Proximity posRef={posRef} target={SPECTRA_POS} radius={11} onChange={setNearSpectra} />
      <CameraRig posRef={posRef} phase={phase} spectraPos={SPECTRA_POS} />

      {BLOOM && (
        <EffectComposer>
          <Bloom intensity={0.95} luminanceThreshold={0.25} luminanceSmoothing={0.2} mipmapBlur radius={0.75} />
        </EffectComposer>
      )}
    </>
  );
}

const BLOOM = false; // EffectComposer blacks out this Grid/Text/Stars scene; emissives carry the glow
