import { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { AnimatePresence, motion } from 'framer-motion';
import * as THREE from 'three';
import World from './game/World.jsx';
import { useKeyboard } from './game/useKeyboard.js';
import Hud from './components/Hud.jsx';
import SpectraWorld from './components/SpectraWorld.jsx';

export default function App() {
  const keys = useKeyboard();
  const posRef = useRef(new THREE.Vector3(0, 0, 0));
  const [phase, setPhase] = useState('explore'); // explore | entering | inside
  const [nearSpectra, setNearSpectra] = useState(false);
  const phaseRef = useRef(phase);
  const nearRef = useRef(nearSpectra);
  phaseRef.current = phase;
  nearRef.current = nearSpectra;

  // Enter opens the gate when the player is close.
  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Enter' && phaseRef.current === 'explore' && nearRef.current) {
        setPhase('entering');
        setTimeout(() => setPhase('inside'), 2600);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Mount the Canvas only after the full-screen container is laid out, so R3F
  // measures a real size (avoids the initial black-canvas-until-resize issue).
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 150);
    return () => clearTimeout(t);
  }, []);

  const back = useCallback(() => {
    posRef.current.set(0, 0, -12);
    setNearSpectra(false);
    setPhase('explore');
  }, []);

  return (
    <div className="game">
      <div className="game-canvas">
        {mounted && (
          <Canvas camera={{ position: [0, 8, 13], fov: 55 }} dpr={[1, 1.8]} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
            <World
              keys={keys}
              posRef={posRef}
              phase={phase}
              nearSpectra={nearSpectra}
              setNearSpectra={setNearSpectra}
            />
          </Canvas>
        )}
      </div>

      {phase !== 'inside' && <Hud phase={phase} nearSpectra={nearSpectra} />}

      {/* cinematic flash while the gate opens */}
      <AnimatePresence>
        {phase === 'entering' && (
          <motion.div
            className="gate-flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 0.1, 1] }}
            transition={{ duration: 2.6, times: [0, 0.45, 0.7, 1], ease: 'easeIn' }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'inside' && <SpectraWorld key="sw" onBack={back} />}
      </AnimatePresence>
    </div>
  );
}
