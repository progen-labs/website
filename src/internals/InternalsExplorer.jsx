// The Core — an explorable 3D atlas of browser and React internals.
// Levels: hub (both models) → model (one model, parts clickable) →
// scene (a part's own 3D world, items clickable) → detail panel.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { AnimatePresence, motion } from 'framer-motion';
import * as THREE from 'three';
import { PickContext } from './primitives.jsx';
import { MODELS, SCENES } from './content.js';
import { SCENE_VIEWS } from './scenes/index.js';
import BrowserModel from './models/BrowserModel.jsx';
import ReactAtom, { PORT } from './models/ReactAtom.jsx';
import ReduxModel, { LENS, ReduxBridge } from './models/ReduxModel.jsx';
import './internals.css';

const BROWSER_AT = [-17, 0, 0];
const REACT_AT = [7, 0.6, 0];
const REDUX_AT = [26.5, 0.6, 0];
const add = (a, b) => a.map((v, i) => v + b[i]);
const BRIDGE_FROM = add(REACT_AT, PORT);
const BRIDGE_TO = add(REDUX_AT, LENS);
const WIDE = 900; // px — at or above this the item list is a left rail, below it a bottom sheet
const RAIL_PX = 340; // rail width + gutter, kept clear when framing

const HUB_ITEMS = [
  { id: 'browser', title: 'The Browser', blurb: 'A Chromium-style browser: tabs, omnibox, viewport, DevTools and V8.' },
  { id: 'react', title: 'React', blurb: 'The atom: components, reconciliation, fiber, commit, hooks, scheduler, Suspense — plus 4 satellites.' },
  { id: 'redux', title: 'Redux', blurb: 'The store, the one-way loop, rootReducer, middleware, redux-thunk, selectors, RTK Query and the production packages.' },
];

const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function Rich({ text }) {
  return text.split(/(`[^`]+`)/g).map((s, i) =>
    s.length > 1 && s.startsWith('`') && s.endsWith('`') ? <code key={i}>{s.slice(1, -1)}</code> : <span key={i}>{s}</span>,
  );
}

/** Flies the camera to the pose for the current view, then hands control
 *  back to OrbitControls. Each pose declares the size of its content
 *  (`span` × `height`); the distance is solved so that content exactly fills
 *  the area left free by the side rail (desktop) or bottom sheet (mobile). */
function CameraRig({ pose, controlsRef }) {
  const { camera, size, invalidate } = useThree();
  const anim = useRef(null);

  useEffect(() => {
    const W = size.width;
    const H = size.height;
    const aspect = W / H;
    const wide = W >= WIDE;
    const rail = wide ? RAIL_PX : 0;
    const sheet = wide ? 0 : H * 0.34 + 20;
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const usableW = (W - rail) / W; // fraction of the screen width that is free
    const usableH = (H - sheet - 110) / H; // minus the sheet and the top/bottom chrome
    const tgt = new THREE.Vector3(...pose.tgt);
    const dir = new THREE.Vector3(...pose.pos).sub(tgt).normalize();
    const d = Math.max(pose.span / (2 * tanHalf * aspect * usableW), pose.height / (2 * tanHalf * usableH)) * 1.04;
    // shift the target so the content centres in the free area
    const halfW = d * tanHalf * aspect;
    const halfH = d * tanHalf;
    tgt.x -= halfW * (rail / W);
    tgt.y -= halfH * (sheet / H);
    const pos = tgt.clone().addScaledVector(dir, d);
    const from = pose.dive ? pos.clone().sub(tgt).multiplyScalar(1.9).add(tgt) : camera.position.clone();
    const fromT = pose.dive || !controlsRef.current ? tgt.clone() : controlsRef.current.target.clone();
    anim.current = { t: 0, from, fromT, toP: pos, toT: tgt, dur: pose.dive ? 1.1 : 0.9 };
    if (controlsRef.current) controlsRef.current.enabled = false;
    invalidate();
  }, [pose.key, size.width, size.height]); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((_, dt) => {
    const a = anim.current;
    if (!a) return;
    a.t = Math.min(1, a.t + Math.min(dt, 1 / 30) / a.dur);
    invalidate(); // keep flying even when the scene's own animations are paused
    const e = easeInOut(a.t);
    camera.position.lerpVectors(a.from, a.toP, e);
    if (controlsRef.current) {
      controlsRef.current.target.lerpVectors(a.fromT, a.toT, e);
      controlsRef.current.update();
    } else {
      camera.lookAt(a.toT);
    }
    if (a.t >= 1) {
      anim.current = null;
      if (controlsRef.current) controlsRef.current.enabled = true;
    }
  });
  return null;
}

function Stage({ level, modelId, sceneId, pose, controlsRef }) {
  const View = level === 'scene' ? SCENE_VIEWS[sceneId]?.Component : null;
  const modeOf = id => (level === 'model' ? (modelId === id ? 'focus' : 'idle') : 'hub');
  return (
    <>
      <color attach="background" args={['#05060f']} />
      <fog attach="fog" args={['#05060f', 45, 130]} />
      <ambientLight intensity={0.6} color="#c7d4ff" />
      <directionalLight position={[14, 22, 18]} intensity={0.9} color="#e4ecff" />
      <directionalLight position={[-16, 8, -10]} intensity={0.35} color="#ffb48a" />
      <Stars radius={160} depth={70} count={2600} factor={4} fade speed={0.3} />

      {View ? (
        <View />
      ) : (
        <>
          <BrowserModel position={BROWSER_AT} mode={modeOf('browser')} />
          <ReactAtom position={REACT_AT} mode={modeOf('react')} />
          <ReduxModel position={REDUX_AT} mode={modeOf('redux')} />
          <ReduxBridge from={BRIDGE_FROM} to={BRIDGE_TO} focusModel={level === 'model' ? modelId : null} />
        </>
      )}

      <CameraRig pose={pose} controlsRef={controlsRef} />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.08}
        screenSpacePanning
        minDistance={5}
        maxDistance={95}
        maxPolarAngle={Math.PI * 0.78}
        rotateSpeed={0.6}
        zoomSpeed={0.9}
      />
    </>
  );
}

export default function InternalsExplorer({ onBack }) {
  const controlsRef = useRef();
  const clickGuard = useRef({ drag: false, x: 0, y: 0 });

  const [level, setLevel] = useState('hub'); // hub | model | scene
  const [modelId, setModelId] = useState(null);
  const [sceneId, setSceneId] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  const [intro, setIntro] = useState(true);
  const [nonce, setNonce] = useState(0);
  // WCAG 2.2.2 / 2.3.3: let people stop the motion; start paused if the OS asks for reduced motion
  const [paused, setPaused] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

  const model = modelId ? MODELS[modelId] : null;
  const scene = sceneId ? SCENES[sceneId] : null;
  const accent = model ? model.accent : '#8fd4ff';

  const items = level === 'scene' ? scene.items : level === 'model' ? model.parts : HUB_ITEMS;
  const item = level === 'scene' && selected ? scene.items.find(i => i.id === selected) : null;

  // pos only sets the viewing direction; span × height is the content to frame
  const pose = useMemo(() => {
    if (level === 'scene') return { ...SCENE_VIEWS[sceneId].pose, key: `s:${sceneId}:${nonce}`, dive: true };
    if (level === 'model' && modelId === 'browser')
      return { key: `m:browser:${nonce}`, pos: [BROWSER_AT[0] + 1.5, 0.8, 20], tgt: [BROWSER_AT[0], -0.4, 0], span: 27.5, height: 17.5 };
    if (level === 'model' && modelId === 'react')
      return { key: `m:react:${nonce}`, pos: [REACT_AT[0] + 0.5, 2.2, 18], tgt: [REACT_AT[0] + 0.8, 1.8, 0], span: 23, height: 14 };
    if (level === 'model')
      return { key: `m:redux:${nonce}`, pos: [REDUX_AT[0] - 2.5, 0.6, 18], tgt: [REDUX_AT[0] - 1.6, -0.2, 0], span: 21, height: 15 };
    return { key: `hub:${nonce}`, pos: [4, 2.5, 40], tgt: [4, -0.4, 0], span: 63, height: 18 };
  }, [level, modelId, sceneId, nonce]);

  const resetCursor = () => {
    document.body.style.cursor = '';
  };

  const pick = useCallback(
    id => {
      if (level === 'scene') {
        setSelected(id);
        return;
      }
      if (id === 'browser' || id === 'react' || id === 'redux') {
        resetCursor();
        setModelId(id);
        setLevel('model');
        setHovered(null);
        return;
      }
      const part = model?.parts.find(p => p.id === id);
      if (part) {
        resetCursor();
        setSceneId(part.scene);
        setLevel('scene');
        setSelected(null);
        setHovered(null);
      }
    },
    [level, model],
  );

  const goHub = () => {
    resetCursor();
    setLevel('hub');
    setModelId(null);
    setSceneId(null);
    setSelected(null);
    setHovered(null);
  };
  const goModel = () => {
    resetCursor();
    setLevel('model');
    setSceneId(null);
    setSelected(null);
    setHovered(null);
  };

  const back = useCallback(() => {
    if (level === 'scene' && selected) setSelected(null);
    else if (level === 'scene') goModel();
    else if (level === 'model') goHub();
  }, [level, selected]); // eslint-disable-line react-hooks/exhaustive-deps

  const step = useCallback(
    dir => {
      if (level !== 'scene') return;
      setSelected(cur => {
        const list = scene.items;
        const i = list.findIndex(x => x.id === cur);
        return list[(i + dir + list.length) % list.length].id;
      });
    },
    [level, scene],
  );

  useEffect(() => () => resetCursor(), []);

  // keyboard
  useEffect(() => {
    const onKey = e => {
      if (intro) return;
      if (e.key === 'Escape') back();
      else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const dir = e.key === 'ArrowRight' ? 1 : -1;
        if (item) step(dir);
        else
          setHovered(cur => {
            const ids = items.map(i => i.id);
            const i = ids.indexOf(cur);
            return ids[(i + dir + ids.length) % ids.length];
          });
      } else if (e.key === 'Enter' && hovered && !item) pick(hovered);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [intro, back, item, step, items, hovered, pick]);

  const onPointerDown = e => {
    clickGuard.current = { drag: false, x: e.clientX, y: e.clientY };
  };
  const onPointerMove = e => {
    if (!e.buttons) return;
    if (Math.hypot(e.clientX - clickGuard.current.x, e.clientY - clickGuard.current.y) > 6) clickGuard.current.drag = true;
  };

  const dolly = f => {
    const c = controlsRef.current;
    if (!c) return;
    const dir = new THREE.Vector3().subVectors(c.object.position, c.target);
    dir.setLength(THREE.MathUtils.clamp(dir.length() * f, c.minDistance, c.maxDistance));
    c.object.position.copy(c.target).add(dir);
    c.update();
  };

  const pickValue = useMemo(() => ({ hovered, setHovered, selected, pick, clickGuard }), [hovered, selected, pick]);

  const hoverInfo = hovered ? items.find(i => i.id === hovered) : null;
  const hoverHint = level === 'hub' ? 'Click to take it apart' : level === 'model' ? 'Click to fly inside' : 'Click for the details';

  const railHead =
    level === 'scene'
      ? { kicker: scene.kicker, title: scene.title, summary: scene.summary }
      : level === 'model'
        ? { kicker: model.kicker, title: model.title, summary: model.summary }
        : { kicker: 'The Core · interactive atlas', title: 'Internals Explorer', summary: 'A browser, React and Redux — taken apart in 3D. Pick one, then click any part of it to fly inside and see how it works.' };

  return (
    <motion.div className="ix" style={{ '--accent': accent }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
      <div
        className="ix-canvas"
        role="img"
        aria-label="Interactive 3D model. Every part shown here is also listed in the side panel, which works with the keyboard and screen readers."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
      >
        <Canvas flat frameloop={paused ? 'demand' : 'always'} camera={{ position: [0, 2.5, 40], fov: 50 }} dpr={[1, 2]} gl={{ antialias: true, powerPreference: 'high-performance' }}>
          <PickContext.Provider value={pickValue}>
            <Stage level={level} modelId={modelId} sceneId={sceneId} pose={pose} controlsRef={controlsRef} />
          </PickContext.Provider>
        </Canvas>
      </div>

      {/* fade-through on entering/leaving a deep-dive world */}
      <motion.div key={level === 'scene' ? sceneId : 'world'} className="ix-veil" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.7, ease: 'easeOut' }} />

      {/* top bar */}
      <div className="ix-topleft">
        <button className="ix-pill" onClick={onBack} aria-label="Back to Progen Labs home">
          ← <span className="ix-wide-only">Home</span>
        </button>
        {level !== 'hub' && (
          <button className="ix-pill" onClick={back} aria-label="Back">
            ↩ <span className="ix-wide-only">Back</span>
          </button>
        )}
      </div>

      <nav className="ix-crumbs" aria-label="Location">
        <button onClick={goHub} className={level === 'hub' ? 'is-here' : ''}>The Core</button>
        {model && (
          <>
            <span className="ix-crumb-sep">›</span>
            <button onClick={goModel} className={level === 'model' ? 'is-here' : ''} style={{ color: model.accent }}>
              {model.title}
            </button>
          </>
        )}
        {scene && (
          <>
            <span className="ix-crumb-sep">›</span>
            <button className="is-here">{scene.title}</button>
          </>
        )}
      </nav>

      <div className="ix-tools" role="toolbar" aria-label="View controls">
        <button className="ix-tool" onClick={() => setPaused(p => !p)} aria-pressed={paused} aria-label={paused ? 'Play animations' : 'Pause animations'} title={paused ? 'Play animations' : 'Pause animations'}>
          {paused ? '▶' : '❚❚'}
        </button>
        <button className="ix-tool" onClick={() => setNonce(n => n + 1)} aria-label="Reset view" title="Reset view">⟲</button>
        <button className="ix-tool" onClick={() => dolly(0.8)} aria-label="Zoom in" title="Zoom in">＋</button>
        <button className="ix-tool" onClick={() => dolly(1.25)} aria-label="Zoom out" title="Zoom out">－</button>
      </div>

      {/* left rail */}
      {!intro && (
        <aside className="ix-rail" key={`${level}:${modelId}:${sceneId}`} aria-label="Explore the parts of this view">
          <div className="ix-rail-head">
            <p className="ix-rail-kicker">{railHead.kicker}</p>
            <h2 className="ix-rail-title">{railHead.title}</h2>
            <p className="ix-rail-summary">{railHead.summary}</p>
          </div>
          <ol className="ix-rail-list">
            {items.map((it, i) => (
              <li key={it.id}>
                <button
                  className={`ix-rail-item${hovered === it.id ? ' is-hot' : ''}${selected === it.id && level === 'scene' ? ' is-sel' : ''}`}
                  aria-current={selected === it.id && level === 'scene' ? 'true' : undefined}
                  onMouseEnter={() => setHovered(it.id)}
                  onMouseLeave={() => setHovered(h => (h === it.id ? null : h))}
                  onFocus={() => setHovered(it.id)}
                  onClick={() => pick(it.id)}
                >
                  <span className="ix-rail-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="ix-rail-text">
                    <b>{it.title}</b>
                    <small>
                      <Rich text={it.blurb} />
                    </small>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </aside>
      )}

      {/* hover tooltip */}
      <AnimatePresence>
        {!intro && !item && hoverInfo && (
          <motion.div className="ix-tip" key={hoverInfo.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} transition={{ duration: 0.18 }}>
            <strong>{hoverInfo.title}</strong>
            <span>
              <Rich text={hoverInfo.blurb} />
            </span>
            <em>{hoverHint}</em>
          </motion.div>
        )}
      </AnimatePresence>

      {!intro && <div className="ix-hint">Drag to orbit · scroll to zoom · right-drag to pan · Esc to go back</div>}

      {/* detail panel */}
      <AnimatePresence>
        {item && (
          <motion.aside className="ix-panel" role="dialog" aria-modal="false" aria-labelledby="ix-panel-title" key={item.id} initial={{ x: '108%' }} animate={{ x: 0 }} exit={{ x: '108%' }} transition={{ type: 'spring', stiffness: 260, damping: 30 }}>
            <div className="ix-panel-head">
              <span className="ix-badge">{scene.title}</span>
              <button className="ix-close" onClick={() => setSelected(null)} aria-label="Close">✕</button>
            </div>
            <h2 className="ix-panel-title" id="ix-panel-title">{item.title}</h2>
            <p className="ix-panel-tag">
              <Rich text={item.blurb} />
            </p>
            <div className="ix-panel-body">
              <ul className="ix-points">
                {item.points.map((p, j) => (
                  <li key={j}>
                    <Rich text={p} />
                  </li>
                ))}
              </ul>
              {item.code && <pre className="ix-code">{item.code}</pre>}
            </div>
            <div className="ix-panel-nav">
              <button onClick={() => step(-1)}>← Prev</button>
              <span>
                {scene.items.findIndex(x => x.id === item.id) + 1} / {scene.items.length}
              </span>
              <button onClick={() => step(1)}>Next →</button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* intro */}
      <AnimatePresence>
        {intro && (
          <motion.div className="ix-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="ix-intro panel" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 320, damping: 26 }}>
              <p className="ix-rail-kicker">THE CORE · INTERACTIVE ATLAS</p>
              <h1 className="ix-intro-title">Internals Explorer</h1>
              <p className="ix-intro-desc">
                A <b>browser</b>, the <b>React</b> atom and a <b>Redux</b> store wired to it — modelled in 3D. Click a model, then click any part
                of it — the tabs, an orbit, a satellite, the thunk relay — and you fly inside to a 3D world of how it actually works.
              </p>
              <div className="ix-intro-legend">
                <span style={{ color: MODELS.browser.accent }}>● The Browser · {MODELS.browser.parts.length} worlds</span>
                <span style={{ color: MODELS.react.accent }}>● React · {MODELS.react.parts.length - 1} worlds</span>
                <span style={{ color: MODELS.redux.accent }}>● Redux · {MODELS.redux.parts.length} worlds</span>
              </div>
              <button className="btn btn-core" onClick={() => setIntro(false)}>Enter the atlas →</button>
              <p className="ix-intro-keys">Drag to orbit · scroll to zoom · click to dive in · Esc to go back</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
