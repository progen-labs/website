import { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { AnimatePresence, motion } from 'framer-motion';
import * as THREE from 'three';
import World from './game/World.jsx';
import { useKeyboard } from './game/useKeyboard.js';
import { sound } from './game/sound.js';
import { TOTAL_ORBS } from './game/Collectibles.jsx';
import Joystick from './game/Joystick.jsx';
import Hud from './components/Hud.jsx';
import SpectraWorld from './components/SpectraWorld.jsx';

export default function App() {
  const keys = useKeyboard();
  const move = useRef({ x: 0, z: 0 });
  const posRef = useRef(new THREE.Vector3(0, 0, 0));
  const [phase, setPhase] = useState('explore'); // explore | entering | inside
  const [nearSpectra, setNearSpectra] = useState(false);
  const [coins, setCoins] = useState(0);
  const [muted, setMuted] = useState(false);
  const [touch] = useState(
    () =>
      typeof window !== 'undefined' &&
      (window.matchMedia?.('(pointer: coarse)').matches || 'ontouchstart' in window),
  );
  const phaseRef = useRef(phase);
  const nearRef = useRef(nearSpectra);
  phaseRef.current = phase;
  nearRef.current = nearSpectra;

  // Defer the canvas mount until the container is laid out (avoids R3F's
  // initial-size black canvas).
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 150);
    return () => clearTimeout(t);
  }, []);

  // Start audio on the first gesture (satisfies autoplay rules).
  useEffect(() => {
    const start = () => {
      sound.init();
      sound.startAmbient();
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
    };
    window.addEventListener('pointerdown', start);
    window.addEventListener('keydown', start);
    return () => {
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
    };
  }, []);

  // Ping when you reach a gate.
  useEffect(() => {
    if (nearSpectra && phase === 'explore') sound.proximity();
  }, [nearSpectra, phase]);

  const tryEnter = useCallback(() => {
    if (phaseRef.current === 'explore' && nearRef.current) {
      sound.gate();
      setPhase('entering');
      setTimeout(() => setPhase('inside'), 2600);
    }
  }, []);

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Enter') tryEnter();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tryEnter]);

  const onCollect = useCallback(() => {
    sound.pickup();
    setCoins(c => {
      const n = c + 1;
      if (n === TOTAL_ORBS) setTimeout(() => sound.win(), 120);
      return n;
    });
  }, []);

  const back = useCallback(() => {
    posRef.current.set(0, 0, -12);
    setNearSpectra(false);
    setPhase('explore');
  }, []);

  const onMute = useCallback(() => {
    sound.tap();
    setMuted(sound.toggleMute());
  }, []);

  return (
    <div className="game">
      <div className="game-canvas">
        {mounted && (
          <Canvas camera={{ position: [0, 8, 13], fov: 55 }} dpr={[1, 1.8]} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
            <World
              keys={keys}
              move={move}
              posRef={posRef}
              phase={phase}
              nearSpectra={nearSpectra}
              setNearSpectra={setNearSpectra}
              onCollect={onCollect}
            />
          </Canvas>
        )}
      </div>

      {phase !== 'inside' && (
        <Hud
          phase={phase}
          nearSpectra={nearSpectra}
          coins={coins}
          total={TOTAL_ORBS}
          muted={muted}
          onMute={onMute}
          touch={touch}
          onAction={() => {
            sound.tap();
            tryEnter();
          }}
        />
      )}

      {touch && phase === 'explore' && <Joystick moveRef={move} />}

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
