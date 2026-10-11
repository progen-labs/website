import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Grid, Stars, Text, Float } from '@react-three/drei';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import * as THREE from 'three';
import Character from './Character.jsx';
import Portal from './Portal.jsx';
import CameraRig from './CameraRig.jsx';
import Decor from './Decor.jsx';
import FantasyProps from './FantasyProps.jsx';

export const SPECTRA_POS = [0, 0, -26];
export const FUNZONE_POS = [-30, 0, -4];
export const COMMUNITY_POS = [30, 0, -4];

export const GATE_MARKERS = [
  { id: 'spectra', name: 'Spectra', color: '#39e0ff', pos: SPECTRA_POS },
  { id: 'funzone', name: 'Fun Zone', color: '#ff9a3d', pos: FUNZONE_POS },
  { id: 'community', name: 'Community', color: '#ff6ad5', pos: COMMUNITY_POS },
];

const GATES = [
  { id: 'spectra', pos: SPECTRA_POS, radius: 11 },
  { id: 'funzone', pos: FUNZONE_POS, radius: 11 },
];

function GateSensor({ posRef, onNear }) {
  const cur = useRef(null);
  useFrame(() => {
    let found = null;
    for (const g of GATES) {
      if (Math.hypot(posRef.current.x - g.pos[0], posRef.current.z - g.pos[2]) < g.radius) {
        found = g.id;
        break;
      }
    }
    if (found !== cur.current) {
      cur.current = found;
      onNear(found);
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

export default function World({ keys, move, posRef, phase, enteringGate, nearGate, setNearGate }) {
  return (
    <>
      <fog attach="fog" args={['#3a2360', 24, 82]} />
      <ambientLight intensity={0.55} color="#c9b8ff" />
      <directionalLight position={[14, 20, 6]} intensity={0.95} color="#ffe6bf" />
      <directionalLight position={[-10, 14, -10]} intensity={0.4} color="#7c7cff" />
      <pointLight position={[0, 7, -24]} intensity={50} distance={45} color="#39e0ff" />
      <pointLight position={[-30, 6, -4]} intensity={30} distance={30} color="#ff9a3d" />
      <pointLight position={[30, 6, -4]} intensity={25} distance={30} color="#ff6ad5" />

      <Stars radius={130} depth={60} count={2600} factor={4} fade speed={0.4} />

      <Grid
        args={[160, 160]}
        cellSize={2}
        cellThickness={0.6}
        sectionSize={10}
        sectionThickness={1.3}
        cellColor="#3a2e6b"
        sectionColor="#8a6bd8"
        fadeDistance={78}
        fadeStrength={1.6}
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
      <FantasyProps />

      <Character keys={keys} move={move} posRef={posRef} frozen={phase !== 'explore'} />

      <Portal position={SPECTRA_POS} label="SPECTRA" sub="frontend performance profiler" color="#39e0ff" active={nearGate === 'spectra'} open={phase === 'entering' && enteringGate === 'spectra'} />
      <Portal position={FUNZONE_POS} label="FUN ZONE" sub="lag spike smash" color="#ff9a3d" active={nearGate === 'funzone'} open={phase === 'entering' && enteringGate === 'funzone'} />
      <Portal position={COMMUNITY_POS} label="COMMUNITY" sub="coming soon" color="#ff6ad5" locked />

      <GateSensor posRef={posRef} onNear={setNearGate} />
      <CameraRig posRef={posRef} phase={phase} enterPos={enteringGate === 'funzone' ? FUNZONE_POS : SPECTRA_POS} />

      {BLOOM && (
        <EffectComposer>
          <Bloom intensity={0.95} luminanceThreshold={0.25} luminanceSmoothing={0.2} mipmapBlur radius={0.75} />
        </EffectComposer>
      )}
    </>
  );
}

const BLOOM = false; // EffectComposer blacks out this Grid/Text/Stars scene; emissives carry the glow
