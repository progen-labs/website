import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { AnimatePresence, motion } from 'framer-motion';
import * as THREE from 'three';
import InternalsWorld from '../game/InternalsWorld.jsx';
import { CONCEPTS, CONCEPT_BY_ID, GROUPS, conceptsOf } from '../game/internals-data.js';

const spring = { type: 'spring', stiffness: 360, damping: 28 };

export default function InternalsExplorer({ onBack }) {
  const controlsRef = useRef();
  const clickGuard = useRef({ drag: false, x: 0, y: 0 });

  const [view, setView] = useState('overview'); // overview | concept
  const [focusId, setFocusId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedSubId, setSelectedSubId] = useState(null);
  const [intro, setIntro] = useState(true);
  const [touch] = useState(() => typeof window !== 'undefined' && (window.matchMedia?.('(pointer: coarse)').matches || 'ontouchstart' in window));

  const concept = focusId ? CONCEPT_BY_ID[focusId] : null;
  const sub = concept && selectedSubId ? concept.children.find(c => c.id === selectedSubId) : null;

  const onHover = useCallback(id => setHoveredId(id), []);

  const pickConcept = useCallback(id => {
    setFocusId(id);
    setView('concept');
    setHoveredId(null);
    setSelectedSubId(null);
  }, []);

  const pickSub = useCallback(id => {
    setSelectedSubId(id);
  }, []);

  const toOverview = useCallback(() => {
    setView('overview');
    setFocusId(null);
    setSelectedSubId(null);
    setHoveredId(null);
  }, []);

  const closePanel = useCallback(() => setSelectedSubId(null), []);

  const stepSub = useCallback(
    dir => {
      if (!concept) return;
      setSelectedSubId(cur => {
        const list = concept.children;
        const i = list.findIndex(c => c.id === cur);
        return list[(i + dir + list.length) % list.length].id;
      });
    },
    [concept],
  );

  const dolly = useCallback(f => {
    const c = controlsRef.current;
    if (!c) return;
    const cam = c.object;
    const dir = new THREE.Vector3().subVectors(cam.position, c.target);
    const dist = THREE.MathUtils.clamp(dir.length() * f, c.minDistance, c.maxDistance);
    cam.position.copy(c.target).add(dir.setLength(dist));
    c.update();
  }, []);

  // list of nodes at the current level, for keyboard cycling
  const levelIds = useMemo(() => {
    if (view === 'concept' && concept) return concept.children.map(c => c.id);
    return CONCEPTS.map(c => c.id);
  }, [view, concept]);

  // keyboard
  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') {
        if (sub) closePanel();
        else if (view === 'concept') toOverview();
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const dir = e.key === 'ArrowRight' ? 1 : -1;
        if (sub) {
          stepSub(dir);
          return;
        }
        setHoveredId(cur => {
          const i = levelIds.indexOf(cur);
          return levelIds[(i + dir + levelIds.length) % levelIds.length];
        });
      }
      if (e.key === 'Enter' && hoveredId) {
        if (view === 'concept') pickSub(hoveredId);
        else pickConcept(hoveredId);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [view, sub, hoveredId, levelIds, concept, closePanel, toOverview, stepSub, pickSub, pickConcept]);

  // drag vs click guard for node picking
  const onPointerDown = e => {
    clickGuard.current = { drag: false, x: e.clientX, y: e.clientY };
  };
  const onPointerMove = e => {
    if (!(e.buttons & 1)) return;
    if (Math.hypot(e.clientX - clickGuard.current.x, e.clientY - clickGuard.current.y) > 6) clickGuard.current.drag = true;
  };

  const hoveredLabel = useMemo(() => {
    if (!hoveredId) return null;
    if (view === 'concept' && concept) {
      const c = concept.children.find(x => x.id === hoveredId);
      return c && { title: c.title, tag: c.blurb };
    }
    const c = CONCEPT_BY_ID[hoveredId];
    return c && { title: c.title, tag: c.tag };
  }, [hoveredId, view, concept]);

  const accent = concept ? GROUPS[concept.group].accent : '#8fd4ff';

  return (
    <motion.div className="ix" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
      <div className="ix-canvas" onPointerDown={onPointerDown} onPointerMove={onPointerMove}>
        <Canvas camera={{ position: [0, 34, 55], fov: 52 }} dpr={[1, 1.8]} gl={{ antialias: true, powerPreference: 'high-performance' }}>
          <InternalsWorld
            view={view}
            focusId={focusId}
            hoveredId={hoveredId}
            selectedSubId={selectedSubId}
            onHover={onHover}
            onPickConcept={pickConcept}
            onPickSub={pickSub}
            controlsRef={controlsRef}
            clickGuard={clickGuard}
          />
        </Canvas>
      </div>

      {/* top-left: context back */}
      <div className="ix-topleft">
        <button className="ix-pill" onClick={onBack}>← Leave the realm</button>
        {view === 'concept' && (
          <button className="ix-pill" onClick={toOverview}>⤴ Overview</button>
        )}
      </div>

      {/* breadcrumb */}
      {view === 'concept' && concept && (
        <div className="ix-crumbs">
          <span style={{ color: GROUPS[concept.group].accent }}>{GROUPS[concept.group].label}</span>
          <span className="ix-crumb-sep">/</span>
          <b>{concept.title}</b>
        </div>
      )}

      {/* top-right: zoom */}
      <div className="ix-tools">
        <button className="ix-tool" onClick={() => dolly(0.8)} aria-label="Zoom in">＋</button>
        <button className="ix-tool" onClick={() => dolly(1.25)} aria-label="Zoom out">－</button>
      </div>

      {/* controls hint */}
      {!intro && (
        <div className="ix-hint">
          {touch ? 'Drag to orbit · pinch to zoom · tap a node' : 'Drag to orbit · scroll to zoom · click a node' }
          {view === 'overview' ? ' to dive in' : ' for details'}
        </div>
      )}

      {/* hover label */}
      <AnimatePresence>
        {!intro && !sub && hoveredLabel && (
          <motion.div
            className="ix-prompt panel"
            style={{ '--accent': accent }}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            transition={spring}
          >
            <strong>{hoveredLabel.title}</strong>
            <span className="ix-prompt-tag">{hoveredLabel.tag}</span>
            <span className="ix-prompt-key">{view === 'overview' ? 'Click to enter' : 'Click to inspect'}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* detail panel for an inner concept */}
      <AnimatePresence>
        {sub && concept && (
          <motion.aside
            className="ix-panel"
            style={{ '--accent': accent, '--accent-dim': GROUPS[concept.group].center ? `${accent}22` : '#ffffff22' }}
            initial={{ x: '110%' }}
            animate={{ x: 0 }}
            exit={{ x: '110%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            key={sub.id}
          >
            <div className="ix-panel-head">
              <span className="ix-badge">{concept.title}</span>
              <button className="ix-close" onClick={closePanel} aria-label="Close">✕</button>
            </div>
            <h2 className="ix-panel-title">{sub.title}</h2>
            <p className="ix-panel-tag">{sub.blurb}</p>

            <div className="ix-panel-body">
              <ul className="ix-points">
                {sub.points.map((p, j) => (
                  <li key={j}>{p}</li>
                ))}
              </ul>
              {sub.code && <pre className="ix-code">{sub.code}</pre>}
            </div>

            <div className="ix-panel-nav">
              <button onClick={() => stepSub(-1)}>← Prev</button>
              <span>{concept.children.findIndex(c => c.id === sub.id) + 1} / {concept.children.length}</span>
              <button onClick={() => stepSub(1)}>Next →</button>
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
                Two systems orbit in space — how a <b>browser</b> turns bytes into pixels, and how <b>React</b> turns elements into those
                same DOM mutations. <b>Click a concept</b> to fly into its own 3D world of inner concepts, then open any one for a deep
                technical breakdown.
              </p>
              <div className="ix-legend">
                <span style={{ color: GROUPS.browser.accent }}>● Browser</span>
                <span style={{ color: GROUPS.react.accent }}>● React</span>
              </div>
              <button className="btn btn-core" onClick={() => setIntro(false)}>Enter the atlas →</button>
              <p className="fz-best">{touch ? 'Drag to orbit · pinch to zoom · tap nodes' : 'Drag to orbit · scroll to zoom · click nodes · Esc to go back'}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
