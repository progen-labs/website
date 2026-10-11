import { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { AnimatePresence, motion } from 'framer-motion';
import * as THREE from 'three';
import World, { SPECTRA_POS, FUNZONE_POS } from './game/World.jsx';
import { useKeyboard } from './game/useKeyboard.js';
import Joystick from './game/Joystick.jsx';
import Hud from './components/Hud.jsx';
import GateCompass from './components/GateCompass.jsx';
import WorldSky from './components/WorldSky.jsx';
import SpectraWorld from './components/SpectraWorld.jsx';
import InternalsExplorer from './components/InternalsExplorer.jsx';

export default function App() {
  const keys = useKeyboard();
  const move = useRef({ x: 0, z: 0 });
  const posRef = useRef(new THREE.Vector3(0, 0, 0));
  const [phase, setPhase] = useState('explore'); // explore | entering | spectra | funzone
  const [nearGate, setNearGate] = useState(null); // null | 'spectra' | 'funzone'
  const [enteringGate, setEnteringGate] = useState('spectra');
  const [touch] = useState(
    () =>
      typeof window !== 'undefined' &&
      (window.matchMedia?.('(pointer: coarse)').matches || 'ontouchstart' in window),
  );
  const phaseRef = useRef(phase);
  const nearRef = useRef(nearGate);
  phaseRef.current = phase;
  nearRef.current = nearGate;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 150);
    return () => clearTimeout(t);
  }, []);

  const tryEnter = useCallback(() => {
    const g = nearRef.current;
    if (phaseRef.current === 'explore' && g) {
      setEnteringGate(g);
      setPhase('entering');
      setTimeout(() => setPhase(g), 2600);
    }
  }, []);

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Enter') tryEnter();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tryEnter]);

  const back = useCallback(() => {
    const p = enteringGate === 'funzone' ? FUNZONE_POS : SPECTRA_POS;
    posRef.current.set(p[0], 0, p[2] + 13);
    setNearGate(null);
    setPhase('explore');
  }, [enteringGate]);

  const exploring = phase === 'explore' || phase === 'entering';

  return (
    <div className="game">
      <WorldSky />
      <div className="game-canvas">
        {mounted && (
          <Canvas camera={{ position: [0, 8, 13], fov: 55 }} dpr={[1, 1.8]} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
            <World
              keys={keys}
              move={move}
              posRef={posRef}
              phase={phase}
              enteringGate={enteringGate}
              nearGate={nearGate}
              setNearGate={setNearGate}
            />
          </Canvas>
        )}
      </div>

      {exploring && (
        <Hud
          phase={phase}
          nearGate={nearGate}
          touch={touch}
          onAction={tryEnter}
        />
      )}

      {phase === 'explore' && <GateCompass posRef={posRef} />}

      {touch && phase === 'explore' && <Joystick moveRef={move} />}

      <AnimatePresence>
        {phase === 'entering' && (
          <motion.div
            className="gate-flash"
            style={{ '--flash': enteringGate === 'funzone' ? '#ffb86b' : '#39e0ff' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 0.1, 1] }}
            transition={{ duration: 2.6, times: [0, 0.45, 0.7, 1], ease: 'easeIn' }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'spectra' && <SpectraWorld key="sw" onBack={back} />}
        {phase === 'funzone' && <InternalsExplorer key="fz" onBack={back} />}
      </AnimatePresence>
    </div>
  );
}
