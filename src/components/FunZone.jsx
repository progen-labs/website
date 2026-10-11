import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { sound } from '../game/sound.js';
import FantasyScene from './FantasyScene.jsx';

const spring = { type: 'spring', stiffness: 420, damping: 20 };
const STAGES = ['Baby', 'Juvenile', 'Adult', 'Elder', 'Ancient'];
const XP_THRESH = [0, 30, 75, 140, 240];

const MONSTERS = {
  goblin: { emoji: '👺', hp: 20, speed: 42, dmg: 8, r: 18, pts: 10, xp: 6 },
  bat: { emoji: '🦇', hp: 12, speed: 88, dmg: 5, r: 15, pts: 8, xp: 5 },
  ogre: { emoji: '👹', hp: 58, speed: 26, dmg: 18, r: 25, pts: 20, xp: 12 },
  ghost: { emoji: '👻', hp: 28, speed: 56, dmg: 10, r: 18, pts: 14, xp: 8 },
};
const MKEYS = Object.keys(MONSTERS);
const ORBS = [
  { e: '🔥', xp: 12 },
  { e: '❄️', xp: 12 },
  { e: '⚡', xp: 12 },
  { e: '✨', xp: 16 },
];

export default function FunZone({ onBack }) {
  const canvasRef = useRef();
  const game = useRef(null);
  const pointer = useRef({ x: 0, y: 0 });
  const [phase, setPhase] = useState('ready'); // ready | playing | over
  const [hud, setHud] = useState({ score: 0, hp: 100, stage: 0, xp: 0 });
  const best = useRef(Number((typeof localStorage !== 'undefined' && localStorage.getItem('dragon_best')) || 0));

  const initGame = useCallback(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    game.current = {
      dragon: { x: w / 2, y: h * 0.6, size: 34, stage: 0, xp: 0, fire: 0, flash: 0 },
      monsters: [],
      balls: [],
      orbs: [],
      parts: [],
      castle: { x: w / 2, y: h - 66, hp: 100, max: 100, shake: 0 },
      spawn: 0.6,
      orbT: 1,
      t: 0,
      score: 0,
    };
    pointer.current = { x: w / 2, y: h * 0.6 };
  }, []);

  const start = () => {
    initGame();
    setHud({ score: 0, hp: 100, stage: 0, xp: 0 });
    setPhase('playing');
    sound.tap();
  };

  useEffect(() => {
    const move = e => {
      const t = e.touches ? e.touches[0] : e;
      pointer.current.x = t.clientX;
      pointer.current.y = t.clientY;
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('touchmove', move, { passive: true });
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('touchmove', move);
    };
  }, []);

  useEffect(() => {
    if (phase !== 'playing') return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf;
    let last = performance.now();
    let alive = true;
    let frame = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      game.current.castle.x = canvas.width / 2;
      game.current.castle.y = canvas.height - 66;
    };
    resize();
    window.addEventListener('resize', resize);

    const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);

    const loop = now => {
      if (!alive) return;
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;
      const g = game.current;
      const w = canvas.width;
      const h = canvas.height;
      g.t += dt;

      // dragon follows pointer
      const d = g.dragon;
      d.x += (pointer.current.x - d.x) * Math.min(1, dt * 6);
      d.y += (pointer.current.y - d.y) * Math.min(1, dt * 6);
      d.x = Math.max(20, Math.min(w - 20, d.x));
      d.y = Math.max(20, Math.min(h - 120, d.y));
      if (d.flash > 0) d.flash -= dt;

      // spawn monsters
      g.spawn -= dt;
      if (g.spawn <= 0) {
        g.spawn = Math.max(0.42, 1.5 - g.t * 0.015);
        const key = MKEYS[Math.floor(Math.random() * MKEYS.length)];
        const m = { ...MONSTERS[key], x: 40 + Math.random() * (w - 80), y: -24, maxHp: MONSTERS[key].hp };
        g.monsters.push(m);
      }
      // spawn orbs
      g.orbT -= dt;
      if (g.orbT <= 0 && g.orbs.length < 6) {
        g.orbT = 1.8 + Math.random();
        const o = ORBS[Math.floor(Math.random() * ORBS.length)];
        g.orbs.push({ ...o, x: 40 + Math.random() * (w - 80), y: 80 + Math.random() * (h * 0.5), life: 9 });
      }

      // auto-fire at nearest monster
      const range = 260 + d.stage * 45;
      d.fire -= dt;
      if (d.fire <= 0) {
        let near = null;
        let nd = range;
        for (const m of g.monsters) {
          const dd = dist(d.x, d.y, m.x, m.y);
          if (dd < nd) {
            nd = dd;
            near = m;
          }
        }
        if (near) {
          const ang = Math.atan2(near.y - d.y, near.x - d.x);
          g.balls.push({ x: d.x, y: d.y, vx: Math.cos(ang) * 520, vy: Math.sin(ang) * 520, dmg: 12 + d.stage * 7, life: 1.6 });
          d.fire = Math.max(0.3, 0.85 - d.stage * 0.13);
        }
      }

      // update balls
      for (let i = g.balls.length - 1; i >= 0; i--) {
        const b = g.balls[i];
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.life -= dt;
        let hitIdx = -1;
        for (let j = 0; j < g.monsters.length; j++) {
          const m = g.monsters[j];
          if (dist(b.x, b.y, m.x, m.y) < m.r + 8) {
            hitIdx = j;
            break;
          }
        }
        if (hitIdx >= 0) {
          const m = g.monsters[hitIdx];
          m.hp -= b.dmg;
          g.balls.splice(i, 1);
          if (m.hp <= 0) {
            g.score += m.pts;
            d.xp += m.xp;
            for (let k = 0; k < 7; k++) g.parts.push({ x: m.x, y: m.y, vx: (Math.random() - 0.5) * 160, vy: (Math.random() - 0.5) * 160, life: 0.5, c: '#ff9a3d' });
            g.monsters.splice(hitIdx, 1);
            sound.pickup();
            // evolve?
            if (d.stage < STAGES.length - 1 && d.xp >= XP_THRESH[d.stage + 1]) {
              d.stage++;
              d.size += 11;
              d.flash = 0.5;
              sound.win();
            }
          }
          continue;
        }
        if (b.life <= 0 || b.x < -30 || b.x > w + 30 || b.y < -30 || b.y > h + 30) g.balls.splice(i, 1);
      }

      // update monsters -> castle
      for (let i = g.monsters.length - 1; i >= 0; i--) {
        const m = g.monsters[i];
        const ang = Math.atan2(g.castle.y - m.y, g.castle.x - m.x);
        m.x += Math.cos(ang) * m.speed * dt;
        m.y += Math.sin(ang) * m.speed * dt;
        if (dist(m.x, m.y, g.castle.x, g.castle.y) < 54) {
          g.castle.hp -= m.dmg;
          g.castle.shake = 0.3;
          g.monsters.splice(i, 1);
          sound.proximity();
        }
      }

      // orbs
      for (let i = g.orbs.length - 1; i >= 0; i--) {
        const o = g.orbs[i];
        o.life -= dt;
        if (dist(d.x, d.y, o.x, o.y) < d.size + 16) {
          d.xp += o.xp;
          g.score += 5;
          for (let k = 0; k < 6; k++) g.parts.push({ x: o.x, y: o.y, vx: (Math.random() - 0.5) * 120, vy: (Math.random() - 0.5) * 120, life: 0.5, c: '#ffe08a' });
          g.orbs.splice(i, 1);
          sound.pickup();
          if (d.stage < STAGES.length - 1 && d.xp >= XP_THRESH[d.stage + 1]) {
            d.stage++;
            d.size += 11;
            d.flash = 0.5;
            sound.win();
          }
          continue;
        }
        if (o.life <= 0) g.orbs.splice(i, 1);
      }

      // particles
      for (let i = g.parts.length - 1; i >= 0; i--) {
        const p = g.parts[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        if (p.life <= 0) g.parts.splice(i, 1);
      }
      if (g.castle.shake > 0) g.castle.shake -= dt;

      // ---- draw ----
      ctx.clearRect(0, 0, w, h);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // orbs
      for (const o of g.orbs) {
        ctx.globalAlpha = o.life < 2 ? Math.max(0.2, o.life / 2) : 1;
        ctx.font = '30px serif';
        ctx.shadowColor = '#ffe08a';
        ctx.shadowBlur = 16;
        ctx.fillText(o.e, o.x, o.y);
        ctx.shadowBlur = 0;
      }
      ctx.globalAlpha = 1;

      // castle
      const sh = g.castle.shake > 0 ? (Math.random() - 0.5) * 6 : 0;
      ctx.font = '52px serif';
      ctx.fillText('🏰', g.castle.x + sh, g.castle.y);

      // monsters + hp bars
      for (const m of g.monsters) {
        ctx.font = `${m.r * 1.8}px serif`;
        ctx.fillText(m.emoji, m.x, m.y);
        if (m.hp < m.maxHp) {
          ctx.fillStyle = 'rgba(0,0,0,0.5)';
          ctx.fillRect(m.x - 16, m.y - m.r - 8, 32, 4);
          ctx.fillStyle = '#ff6a7a';
          ctx.fillRect(m.x - 16, m.y - m.r - 8, 32 * (m.hp / m.maxHp), 4);
        }
      }

      // fireballs
      for (const b of g.balls) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#ffb347';
        ctx.shadowColor = '#ff7a2f';
        ctx.shadowBlur = 18;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // particles
      for (const p of g.parts) {
        ctx.globalAlpha = Math.max(0, p.life * 2);
        ctx.fillStyle = p.c;
        ctx.fillRect(p.x, p.y, 4, 4);
      }
      ctx.globalAlpha = 1;

      // dragon
      if (d.flash > 0) {
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size * 1.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,220,120,${d.flash})`;
        ctx.fill();
      }
      ctx.font = `${d.size}px serif`;
      ctx.shadowColor = '#ffcf4d';
      ctx.shadowBlur = 14;
      ctx.fillText('🐉', d.x, d.y);
      ctx.shadowBlur = 0;

      // HUD mirror (throttled)
      if (++frame % 6 === 0) setHud({ score: g.score, hp: Math.max(0, g.castle.hp), stage: d.stage, xp: d.xp });

      if (g.castle.hp <= 0) {
        alive = false;
        const fs = g.score;
        if (fs > best.current) {
          best.current = fs;
          try {
            localStorage.setItem('dragon_best', String(fs));
          } catch {
            /* ignore */
          }
        }
        setHud(hh => ({ ...hh, score: fs, hp: 0 }));
        setPhase('over');
        sound.win();
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [phase]);

  const nextXp = XP_THRESH[Math.min(hud.stage + 1, XP_THRESH.length - 1)];
  const curXp = XP_THRESH[hud.stage];
  const xpPct = hud.stage >= STAGES.length - 1 ? 100 : Math.min(100, ((hud.xp - curXp) / (nextXp - curXp)) * 100);

  return (
    <motion.div className="funzone dragon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
      <FantasyScene />
      <canvas ref={canvasRef} className="dragon-canvas" />
      <button className="sw-back" onClick={onBack}>← Leave the realm</button>

      {phase === 'playing' && (
        <div className="fz-hud">
          <div className="fz-stat panel"><span className="fz-label">🪙 SCORE</span><b>{hud.score}</b></div>
          <div className="fz-fps panel">
            <span className="fz-label">🏰 KINGDOM</span>
            <div className="fz-bar"><div className="fz-bar-fill" style={{ width: `${hud.hp}%`, background: hud.hp > 35 ? 'var(--good)' : '#ff8da8' }} /></div>
          </div>
          <div className="fz-fps panel">
            <span className="fz-label">🐉 {STAGES[hud.stage]} DRAGON</span>
            <div className="fz-bar"><div className="fz-bar-fill" style={{ width: `${xpPct}%`, background: 'linear-gradient(90deg,#ffd978,#ff9a3d)' }} /></div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {phase === 'ready' && (
          <motion.div className="fz-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="fz-card panel" initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} transition={spring}>
              <div className="dragon-hero">🐉</div>
              <p className="fz-kicker">FUN ZONE · THE ENCHANTED REALM</p>
              <h1 className="fz-title grad-gold">Dragonheart</h1>
              <p className="fz-desc">
                You've hatched a <b>baby dragon</b>. <b>Move</b> it with your cursor (or finger) to gather
                elemental orbs 🔥❄️⚡✨ and <b>evolve</b> — Baby → Elder. Your dragon breathes fire on the
                nearest threat; keep the monsters from reaching your <b>kingdom</b> 🏰.
              </p>
              <button className="btn btn-gold fz-play" onClick={start}>🔥 Begin the legend</button>
              {best.current > 0 && <p className="fz-best">Best score: {best.current}</p>}
            </motion.div>
          </motion.div>
        )}
        {phase === 'over' && (
          <motion.div className="fz-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="fz-card panel" initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} transition={spring}>
              <p className="fz-kicker">🏰 THE KINGDOM HAS FALLEN</p>
              <h1 className="fz-title grad-gold">🪙 {hud.score}</h1>
              <p className="fz-desc">Your dragon reached <b>{STAGES[hud.stage]}</b>. {hud.score >= best.current ? '🏆 A new legend!' : `Best: ${best.current}`}</p>
              <div className="fz-actions">
                <button className="btn btn-gold fz-play" onClick={start}>↻ Hatch again</button>
                <button className="btn btn-ghost" onClick={onBack}>Leave the realm</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
