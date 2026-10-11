import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { sound } from '../game/sound.js';

const GAME_MS = 32000;
const SPIKE_LIFE = 1300;
const spring = { type: 'spring', stiffness: 420, damping: 20 };
let uid = 0;

/**
 * Fun Zone → "Lag Spike Smash": optimize the app by smashing lag spikes and
 * memory leaks before they tank your frame rate. A real, juicy arcade game.
 */
export default function FunZone({ onBack }) {
  const [state, setState] = useState('ready'); // ready | playing | over
  const [spikes, setSpikes] = useState([]);
  const [floats, setFloats] = useState([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [fps, setFps] = useState(60);
  const [timeLeft, setTimeLeft] = useState(GAME_MS);
  const best = useRef(Number((typeof localStorage !== 'undefined' && localStorage.getItem('funzone_best')) || 0));

  const endGame = useCallback(() => {
    setState('over');
    setScore(s => {
      if (s > best.current) {
        best.current = s;
        try {
          localStorage.setItem('funzone_best', String(s));
        } catch {
          /* ignore */
        }
      }
      return s;
    });
    sound.win();
  }, []);

  useEffect(() => {
    if (state !== 'playing') return;
    let alive = true;
    let delay = 820;
    const spawn = () => {
      if (!alive) return;
      const type = Math.random() < 0.18 ? 'leak' : 'spike';
      setSpikes(p => [...p, { id: ++uid, x: 8 + Math.random() * 84, y: 16 + Math.random() * 70, born: Date.now(), type }]);
      delay = Math.max(360, delay * 0.965);
      spawnT = setTimeout(spawn, delay);
    };
    let spawnT = setTimeout(spawn, 500);

    const expiry = setInterval(() => {
      const now = Date.now();
      setSpikes(p => {
        const dead = p.filter(s => now - s.born > SPIKE_LIFE).length;
        if (dead) {
          setFps(f => Math.max(0, f - dead * 5));
          setCombo(0);
        }
        return p.filter(s => now - s.born <= SPIKE_LIFE);
      });
    }, 120);

    const timer = setInterval(() => setTimeLeft(t => Math.max(0, t - 200)), 200);

    return () => {
      alive = false;
      clearTimeout(spawnT);
      clearInterval(expiry);
      clearInterval(timer);
    };
  }, [state]);

  useEffect(() => {
    if (state === 'playing' && (timeLeft <= 0 || fps <= 0)) endGame();
  }, [timeLeft, fps, state, endGame]);

  const hit = (s, e) => {
    e.stopPropagation();
    setSpikes(p => p.filter(x => x.id !== s.id));
    setCombo(c => {
      const nc = c + 1;
      const mult = Math.max(1, Math.floor(nc / 4) + 1);
      const pts = (s.type === 'leak' ? 25 : 10) * mult;
      setScore(v => v + pts);
      const fid = ++uid;
      setFloats(p => [...p, { id: fid, x: s.x, y: s.y, pts, type: s.type }]);
      setTimeout(() => setFloats(p => p.filter(f => f.id !== fid)), 650);
      return nc;
    });
    setFps(f => Math.min(60, f + 1));
    sound.pickup();
  };

  const start = () => {
    setScore(0);
    setCombo(0);
    setFps(60);
    setTimeLeft(GAME_MS);
    setSpikes([]);
    setState('playing');
    sound.tap();
  };

  const mult = Math.max(1, Math.floor(combo / 4) + 1);

  return (
    <motion.div className="funzone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
      <div className="fz-bg" />
      <button className="sw-back" onClick={onBack}>← Back to Progen Labs</button>

      {/* top HUD */}
      <div className="fz-hud">
        <div className="fz-stat panel">
          <span className="fz-label">SCORE</span>
          <b>{score}</b>
        </div>
        <div className="fz-fps panel">
          <span className="fz-label">FPS {fps}</span>
          <div className="fz-bar"><div className="fz-bar-fill" style={{ width: `${(fps / 60) * 100}%`, background: fps > 30 ? 'var(--good)' : '#ff8da8' }} /></div>
        </div>
        <div className="fz-stat panel">
          <span className="fz-label">TIME</span>
          <b>{Math.ceil(timeLeft / 1000)}s</b>
        </div>
      </div>

      {combo >= 4 && state === 'playing' && (
        <motion.div className="fz-combo" key={mult} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring}>
          {mult}× COMBO
        </motion.div>
      )}

      {/* play field */}
      <div className="fz-field">
        <AnimatePresence>
          {spikes.map(s => (
            <motion.button
              key={s.id}
              className={`fz-spike ${s.type}`}
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={spring}
              onPointerDown={e => hit(s, e)}
            >
              {s.type === 'leak' ? '🧠' : '⚡'}
            </motion.button>
          ))}
        </AnimatePresence>
        {floats.map(f => (
          <motion.span
            key={f.id}
            className="fz-float"
            style={{ left: `${f.x}%`, top: `${f.y}%`, color: f.type === 'leak' ? '#c9a8ff' : '#ffd98a' }}
            initial={{ y: 0, opacity: 1, scale: 0.8 }}
            animate={{ y: -40, opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.65 }}
          >
            +{(f.type === 'leak' ? 25 : 10) * mult}
          </motion.span>
        ))}
      </div>

      {/* start screen */}
      <AnimatePresence>
        {state === 'ready' && (
          <motion.div className="fz-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="fz-card panel" initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} transition={spring}>
              <p className="fz-kicker">FUN ZONE</p>
              <h1 className="fz-title grad-text">Lag Spike Smash</h1>
              <p className="fz-desc">
                Your app is drowning in <b>lag spikes</b> ⚡ and <b>memory leaks</b> 🧠. Smash them before they tank your
                frame rate! Chain hits for combo multipliers. Keep the FPS above zero for {GAME_MS / 1000} seconds.
              </p>
              <button className="btn btn-primary fz-play" onClick={start}>▶ Start optimizing</button>
              {best.current > 0 && <p className="fz-best">Best score: {best.current}</p>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* game over */}
      <AnimatePresence>
        {state === 'over' && (
          <motion.div className="fz-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="fz-card panel" initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} transition={spring}>
              <p className="fz-kicker">{fps <= 0 ? 'FRAME RATE CRASHED' : "TIME'S UP"}</p>
              <h1 className="fz-title">{score}</h1>
              <p className="fz-desc">
                {score >= best.current ? '🏆 New best score!' : `Best: ${best.current}`}
              </p>
              <div className="fz-actions">
                <button className="btn btn-primary fz-play" onClick={start}>↻ Play again</button>
                <button className="btn btn-ghost" onClick={onBack}>Leave Fun Zone</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
