import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { sound } from '../game/sound.js';
import FantasyScene from './FantasyScene.jsx';

const GAME_MS = 32000;
const LIFE = 1300;
const spring = { type: 'spring', stiffness: 420, damping: 20 };
let uid = 0;

const ENEMY = {
  goblin: { emoji: '👺', pts: 10 },
  dragon: { emoji: '🐉', pts: 25 },
};

/**
 * Fun Zone → "Realm Rush": a fantasy realm overrun by creatures. Tap the
 * goblins and dragons before they drain the realm's life. A real, juicy game.
 */
export default function FunZone({ onBack }) {
  const [state, setState] = useState('ready'); // ready | playing | over
  const [mobs, setMobs] = useState([]);
  const [floats, setFloats] = useState([]);
  const [gold, setGold] = useState(0);
  const [combo, setCombo] = useState(0);
  const [life, setLife] = useState(100);
  const [timeLeft, setTimeLeft] = useState(GAME_MS);
  const best = useRef(Number((typeof localStorage !== 'undefined' && localStorage.getItem('realm_best')) || 0));

  const endGame = useCallback(() => {
    setState('over');
    setGold(g => {
      if (g > best.current) {
        best.current = g;
        try {
          localStorage.setItem('realm_best', String(g));
        } catch {
          /* ignore */
        }
      }
      return g;
    });
    sound.win();
  }, []);

  useEffect(() => {
    if (state !== 'playing') return;
    let alive = true;
    let delay = 820;
    const spawn = () => {
      if (!alive) return;
      const type = Math.random() < 0.18 ? 'dragon' : 'goblin';
      setMobs(p => [...p, { id: ++uid, x: 8 + Math.random() * 84, y: 20 + Math.random() * 62, born: Date.now(), type }]);
      delay = Math.max(360, delay * 0.965);
      spawnT = setTimeout(spawn, delay);
    };
    let spawnT = setTimeout(spawn, 500);

    const expiry = setInterval(() => {
      const now = Date.now();
      setMobs(p => {
        const dead = p.filter(m => now - m.born > LIFE).length;
        if (dead) {
          setLife(l => Math.max(0, l - dead * 9));
          setCombo(0);
        }
        return p.filter(m => now - m.born <= LIFE);
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
    if (state === 'playing' && (timeLeft <= 0 || life <= 0)) endGame();
  }, [timeLeft, life, state, endGame]);

  const hit = (m, e) => {
    e.stopPropagation();
    setMobs(p => p.filter(x => x.id !== m.id));
    setCombo(c => {
      const nc = c + 1;
      const mult = Math.max(1, Math.floor(nc / 4) + 1);
      const pts = ENEMY[m.type].pts * mult;
      setGold(v => v + pts);
      const fid = ++uid;
      setFloats(p => [...p, { id: fid, x: m.x, y: m.y, pts }]);
      setTimeout(() => setFloats(p => p.filter(f => f.id !== fid)), 650);
      return nc;
    });
    setLife(l => Math.min(100, l + 1));
    sound.pickup();
  };

  const start = () => {
    setGold(0);
    setCombo(0);
    setLife(100);
    setTimeLeft(GAME_MS);
    setMobs([]);
    setState('playing');
    sound.tap();
  };

  const mult = Math.max(1, Math.floor(combo / 4) + 1);

  return (
    <motion.div className="funzone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
      <FantasyScene />
      <button className="sw-back" onClick={onBack}>← Leave the realm</button>

      <div className="fz-hud">
        <div className="fz-stat panel"><span className="fz-label">🪙 GOLD</span><b>{gold}</b></div>
        <div className="fz-fps panel">
          <span className="fz-label">❤ REALM</span>
          <div className="fz-bar"><div className="fz-bar-fill" style={{ width: `${life}%`, background: life > 40 ? 'var(--good)' : '#ff8da8' }} /></div>
        </div>
        <div className="fz-stat panel"><span className="fz-label">⏳ TIME</span><b>{Math.ceil(timeLeft / 1000)}s</b></div>
      </div>

      {combo >= 4 && state === 'playing' && (
        <motion.div className="fz-combo" key={mult} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring}>
          {mult}× COMBO
        </motion.div>
      )}

      <div className="fz-field">
        <AnimatePresence>
          {mobs.map(m => (
            <motion.button
              key={m.id}
              className={`fz-mob ${m.type}`}
              style={{ left: `${m.x}%`, top: `${m.y}%` }}
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={spring}
              onPointerDown={e => hit(m, e)}
            >
              {ENEMY[m.type].emoji}
            </motion.button>
          ))}
        </AnimatePresence>
        {floats.map(f => (
          <motion.span key={f.id} className="fz-float" style={{ left: `${f.x}%`, top: `${f.y}%` }} initial={{ y: 0, opacity: 1, scale: 0.8 }} animate={{ y: -42, opacity: 0, scale: 1.2 }} transition={{ duration: 0.65 }}>
            +{f.pts}
          </motion.span>
        ))}
      </div>

      <AnimatePresence>
        {state === 'ready' && (
          <motion.div className="fz-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="fz-card panel" initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} transition={spring}>
              <p className="fz-kicker">FUN ZONE · THE ENCHANTED REALM</p>
              <h1 className="fz-title grad-gold">Realm Rush</h1>
              <p className="fz-desc">
                The realm is overrun! Tap the <b>goblins</b> 👺 and <b>dragons</b> 🐉 before they drain its life.
                Chain strikes for combo multipliers and hoard gold. Hold the realm for {GAME_MS / 1000} seconds.
              </p>
              <button className="btn btn-gold fz-play" onClick={start}>⚔ Defend the realm</button>
              {best.current > 0 && <p className="fz-best">Best gold: {best.current}</p>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {state === 'over' && (
          <motion.div className="fz-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="fz-card panel" initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} transition={spring}>
              <p className="fz-kicker">{life <= 0 ? '🏰 THE REALM HAS FALLEN' : "⏳ THE SIEGE IS OVER"}</p>
              <h1 className="fz-title grad-gold">🪙 {gold}</h1>
              <p className="fz-desc">{gold >= best.current ? '🏆 A new legend of the realm!' : `Best: ${best.current} gold`}</p>
              <div className="fz-actions">
                <button className="btn btn-gold fz-play" onClick={start}>↻ Rise again</button>
                <button className="btn btn-ghost" onClick={onBack}>Leave the realm</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
