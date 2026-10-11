import { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { AnimatePresence, motion } from 'framer-motion';
import { sound } from '../game/sound.js';
import DragonFlight from '../game/DragonFlight.jsx';

const spring = { type: 'spring', stiffness: 420, damping: 20 };
const STAGES = ['Baby', 'Juvenile', 'Adult', 'Elder', 'Ancient'];
const XP_THRESH = [0, 40, 100, 190, 320];

export default function FunZone({ onBack }) {
  const [phase, setPhase] = useState('ready'); // ready | playing | over
  const [hud, setHud] = useState({ score: 0, hp: 100, stage: 0, xp: 0 });
  const input = useRef({ x: 0, y: 0, left: false, right: false, up: false, down: false });
  const best = useRef(Number((typeof localStorage !== 'undefined' && localStorage.getItem('dragon_best')) || 0));
  const [touch] = useState(() => typeof window !== 'undefined' && (window.matchMedia?.('(pointer: coarse)').matches || 'ontouchstart' in window));

  const onHud = useCallback(h => setHud(h), []);
  const onOver = useCallback(score => {
    if (score > best.current) {
      best.current = score;
      try {
        localStorage.setItem('dragon_best', String(score));
      } catch {
        /* ignore */
      }
    }
    sound.win();
    setPhase('over');
  }, []);

  const start = () => {
    // reload the flight sim by remounting the canvas
    setHud({ score: 0, hp: 100, stage: 0, xp: 0 });
    setPhase('playing');
    sound.tap();
  };

  // steering: pointer + keys
  useEffect(() => {
    const move = e => {
      const t = e.touches ? e.touches[0] : e;
      input.current.x = (t.clientX / window.innerWidth - 0.5) * 2;
      input.current.y = (t.clientY / window.innerHeight - 0.5) * 2;
    };
    const key = down => e => {
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') input.current.left = down;
      if (k === 'arrowright' || k === 'd') input.current.right = down;
      if (k === 'arrowup' || k === 'w') input.current.up = down;
      if (k === 'arrowdown' || k === 's') input.current.down = down;
    };
    const kd = key(true);
    const ku = key(false);
    window.addEventListener('pointermove', move);
    window.addEventListener('touchmove', move, { passive: true });
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
    };
  }, []);

  const nextXp = XP_THRESH[Math.min(hud.stage + 1, XP_THRESH.length - 1)];
  const curXp = XP_THRESH[hud.stage];
  const xpPct = hud.stage >= STAGES.length - 1 ? 100 : Math.min(100, ((hud.xp - curXp) / (nextXp - curXp)) * 100);

  return (
    <motion.div className="funzone flight" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
      <div className="flight-sky" />
      <div className="flight-canvas">
        <Canvas camera={{ position: [0, 34, -74], fov: 62 }} dpr={[1, 1.8]} gl={{ antialias: true, alpha: true }}>
          <fog attach="fog" args={['#b59bd6', 60, 300]} />
          <ambientLight intensity={0.7} color="#d8c9ff" />
          <directionalLight position={[40, 80, 20]} intensity={1.3} color="#ffe6bf" />
          <directionalLight position={[-30, 30, -40]} intensity={0.4} color="#8aa0ff" />
          <DragonFlight key={phase === 'playing' ? 'run' : 'idle'} playing={phase === 'playing'} onHud={onHud} onOver={onOver} input={input} />
        </Canvas>
      </div>

      <button className="sw-back" onClick={onBack}>← Leave the realm</button>

      {phase === 'playing' && (
        <div className="fz-hud">
          <div className="fz-stat panel"><span className="fz-label">🪙 SCORE</span><b>{hud.score}</b></div>
          <div className="fz-fps panel">
            <span className="fz-label">❤ DRAGON</span>
            <div className="fz-bar"><div className="fz-bar-fill" style={{ width: `${hud.hp}%`, background: hud.hp > 35 ? 'var(--good)' : '#ff8da8' }} /></div>
          </div>
          <div className="fz-fps panel">
            <span className="fz-label">🐉 {STAGES[hud.stage]}</span>
            <div className="fz-bar"><div className="fz-bar-fill" style={{ width: `${xpPct}%`, background: 'linear-gradient(90deg,#ffd978,#ff9a3d)' }} /></div>
          </div>
        </div>
      )}

      {phase === 'playing' && <div className="flight-hint">{touch ? 'Drag to steer · auto-fire' : 'Mouse / WASD to steer · auto-fire'}</div>}

      <AnimatePresence>
        {phase === 'ready' && (
          <motion.div className="fz-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="fz-card panel" initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} transition={spring}>
              <div className="dragon-hero">🐉</div>
              <p className="fz-kicker">FUN ZONE · THE ENCHANTED REALM</p>
              <h1 className="fz-title grad-gold">Dragonheart</h1>
              <p className="fz-desc">
                Take flight on your dragon over the kingdom — soar past <b>canyons</b> and <b>forests</b>. Steer with your
                {touch ? ' finger' : ' mouse or WASD'}; your dragon breathes fire automatically. Catch glowing
                <b> essence orbs</b> ✨ to <b>evolve</b> Baby → Ancient, and clear the skies of monsters.
              </p>
              <button className="btn btn-gold fz-play" onClick={start}>🔥 Take flight</button>
              {best.current > 0 && <p className="fz-best">Best score: {best.current}</p>}
            </motion.div>
          </motion.div>
        )}
        {phase === 'over' && (
          <motion.div className="fz-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="fz-card panel" initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} transition={spring}>
              <p className="fz-kicker">🐉 YOUR DRAGON HAS FALLEN</p>
              <h1 className="fz-title grad-gold">🪙 {hud.score}</h1>
              <p className="fz-desc">Reached <b>{STAGES[hud.stage]}</b>. {hud.score >= best.current ? '🏆 A new legend of the skies!' : `Best: ${best.current}`}</p>
              <div className="fz-actions">
                <button className="btn btn-gold fz-play" onClick={start}>↻ Fly again</button>
                <button className="btn btn-ghost" onClick={onBack}>Leave the realm</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
