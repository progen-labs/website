import { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { AnimatePresence, motion } from 'framer-motion';
import * as THREE from 'three';
import { sound } from '../game/sound.js';
import InternalsWorld from '../game/InternalsWorld.jsx';
import { GROUPS, NODES, NODE_BY_ID } from '../game/internals-data.js';

const spring = { type: 'spring', stiffness: 380, damping: 26 };

export default function InternalsExplorer({ onBack }) {
  const input = useRef({ left: false, right: false, up: false, down: false, x: 0, z: 0 });
  const posRef = useRef(new THREE.Vector3(0, 2.2, 10));
  const frozen = useRef(true); // frozen until the intro is dismissed
  const nearRef = useRef(null);

  const [near, setNear] = useState(null); // nearest station id (prompt)
  const [openId, setOpenId] = useState(null); // station whose panel is shown
  const [intro, setIntro] = useState(true);
  const [touch] = useState(() => typeof window !== 'undefined' && (window.matchMedia?.('(pointer: coarse)').matches || 'ontouchstart' in window));

  const onNear = useCallback(id => {
    nearRef.current = id;
    setNear(id);
    if (id) sound.proximity();
  }, []);

  const openStation = useCallback(id => {
    if (!id) return;
    frozen.current = true;
    sound.gate();
    setOpenId(id);
  }, []);

  const closeStation = useCallback(() => {
    setOpenId(null);
    if (!intro) frozen.current = false;
  }, [intro]);

  const step = useCallback(dir => {
    setOpenId(cur => {
      const i = NODES.findIndex(n => n.id === cur);
      const next = NODES[(i + dir + NODES.length) % NODES.length];
      sound.tap();
      return next.id;
    });
  }, []);

  const begin = () => {
    sound.tap();
    setIntro(false);
    frozen.current = false;
  };

  // keyboard: steering + Enter/Escape
  useEffect(() => {
    const kd = e => {
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') input.current.left = true;
      if (k === 'arrowright' || k === 'd') input.current.right = true;
      if (k === 'arrowup' || k === 'w') input.current.up = true;
      if (k === 'arrowdown' || k === 's') input.current.down = true;
      if (e.key === 'Enter') {
        if (openId) step(1);
        else if (nearRef.current) openStation(nearRef.current);
      }
      if (e.key === 'Escape') {
        if (openId) closeStation();
      }
      if (openId && k === 'arrowright') step(1);
      if (openId && k === 'arrowleft') step(-1);
    };
    const ku = e => {
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') input.current.left = false;
      if (k === 'arrowright' || k === 'd') input.current.right = false;
      if (k === 'arrowup' || k === 'w') input.current.up = false;
      if (k === 'arrowdown' || k === 's') input.current.down = false;
    };
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    return () => {
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
    };
  }, [openId, openStation, closeStation, step]);

  // touch: drag anywhere to steer
  useEffect(() => {
    if (!touch) return;
    const origin = { x: 0, y: 0, active: false };
    const down = e => {
      const t = e.touches ? e.touches[0] : e;
      origin.x = t.clientX;
      origin.y = t.clientY;
      origin.active = true;
    };
    const move = e => {
      if (!origin.active) return;
      const t = e.touches ? e.touches[0] : e;
      input.current.x = THREE.MathUtils.clamp((t.clientX - origin.x) / 70, -1, 1);
      input.current.z = THREE.MathUtils.clamp((t.clientY - origin.y) / 70, -1, 1);
    };
    const up = () => {
      origin.active = false;
      input.current.x = 0;
      input.current.z = 0;
    };
    window.addEventListener('touchstart', down, { passive: true });
    window.addEventListener('touchmove', move, { passive: true });
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('touchstart', down);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
  }, [touch]);

  const node = openId ? NODE_BY_ID[openId] : null;

  return (
    <motion.div className="ix" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
      <div className="ix-canvas">
        <Canvas camera={{ position: [0, 9, 22], fov: 60 }} dpr={[1, 1.8]} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
          <InternalsWorld input={input} posRef={posRef} frozen={frozen} onNear={onNear} activeId={near} />
        </Canvas>
      </div>

      <button className="sw-back" onClick={onBack}>← Leave the realm</button>

      {/* proximity prompt */}
      <AnimatePresence>
        {!intro && !openId && near && (
          <motion.div
            className="ix-prompt panel"
            style={{ '--accent': GROUPS[NODE_BY_ID[near].group].accent }}
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.9 }}
            transition={spring}
          >
            <span className="ix-prompt-kicker">{GROUPS[NODE_BY_ID[near].group].label}</span>
            <strong>{NODE_BY_ID[near].title}</strong>
            <span className="ix-prompt-key">{touch ? 'Tap ◎ to inspect' : <>Press <kbd>Enter</kbd> to inspect</>}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* controls hint */}
      {!intro && !openId && (
        <div className="ix-hint">{touch ? 'Drag to fly · approach a node to inspect' : 'WASD / arrows to fly · approach a node, press Enter'}</div>
      )}

      {/* mobile inspect button */}
      {touch && !intro && !openId && near && (
        <motion.button className="action-btn ready" onClick={() => openStation(nearRef.current)} whileTap={{ scale: 0.86 }} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={spring}>
          <span>◎</span>
        </motion.button>
      )}

      {/* detail panel */}
      <AnimatePresence>
        {node && (
          <motion.aside
            className="ix-panel"
            style={{ '--accent': GROUPS[node.group].accent, '--accent-dim': GROUPS[node.group].dim }}
            initial={{ x: '110%' }}
            animate={{ x: 0 }}
            exit={{ x: '110%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            key={node.id}
          >
            <div className="ix-panel-head">
              <span className="ix-badge">{GROUPS[node.group].label}</span>
              <button className="ix-close" onClick={closeStation} aria-label="Close">✕</button>
            </div>
            <h2 className="ix-panel-title">{node.title}</h2>
            <p className="ix-panel-tag">{node.tag}</p>
            <p className="ix-panel-short">{node.short}</p>

            <div className="ix-panel-body">
              {node.details.map((sec, i) => (
                <section className="ix-sec" key={i}>
                  <h3>{sec.h}</h3>
                  <ul>
                    {sec.lines.map((l, j) => (
                      <li key={j}>{l}</li>
                    ))}
                  </ul>
                  {sec.code && <pre className="ix-code">{sec.code}</pre>}
                </section>
              ))}
            </div>

            <div className="ix-panel-nav">
              <button onClick={() => step(-1)}>← Prev</button>
              <span>{NODES.findIndex(n => n.id === node.id) + 1} / {NODES.length}</span>
              <button onClick={() => step(1)}>Next →</button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* intro */}
      <AnimatePresence>
        {intro && (
          <motion.div className="fz-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="fz-card panel ix-intro" initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }} transition={spring}>
              <div className="dragon-hero">🧠</div>
              <p className="fz-kicker">THE CORE · INTERACTIVE ATLAS</p>
              <h1 className="fz-title grad-core">Internals Explorer</h1>
              <p className="fz-desc">
                Fly through two living constellations — how a <b>browser</b> turns bytes into pixels, and how <b>React</b> turns elements
                into those same DOM mutations. Glide up to any glowing node and open it for a deep technical breakdown.
              </p>
              <div className="ix-legend">
                <span style={{ color: GROUPS.browser.accent }}>● Browser pipeline</span>
                <span style={{ color: GROUPS.react.accent }}>● React pipeline</span>
              </div>
              <button className="btn btn-core" onClick={begin}>Begin exploring →</button>
              <p className="fz-best">{touch ? 'Drag to fly · tap nodes to inspect' : 'WASD / arrows to fly · Enter to inspect · ← → to page'}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
