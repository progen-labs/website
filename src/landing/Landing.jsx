// The Progen Labs landing page: a 3D hero (LandingScene) under a crisp HTML
// layer. All content and controls are real HTML — headings, buttons, links —
// so the page is readable, keyboard-operable and screen-reader friendly; the
// 3D scene is a decorative stage that mirrors the hovered project.
import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion as m } from 'framer-motion';
import ProgenMark from '../components/ProgenMark.jsx';
import { ThemeToggle } from '../theme.jsx';
import LandingScene from './LandingScene.jsx';
import './landing.css';

export const PROJECTS = [
  {
    id: 'spectra',
    name: 'Spectra',
    tag: 'Frontend performance profiler',
    desc: 'Find the exact component, function and line slowing your app, prove every fix, or let its AI harness fix it for you. In the terminal, VS Code, your AI assistant or CI.',
    color: '#36d6ff',
    cta: 'Open Spectra',
  },
  {
    id: 'core',
    name: 'The Core',
    tag: 'Interactive internals atlas',
    desc: 'Explore 3D models of the browser, React and Redux, and open any part to see how it really works.',
    color: '#a78bfa',
    cta: 'Enter The Core',
  },
  {
    id: 'community',
    name: 'Community',
    tag: 'Coming soon',
    desc: 'A place to learn, contribute and build developer tools together, in the open.',
    color: '#ff6ad5',
    disabled: true,
  },
];

function useReducedMotion() {
  const query = '(prefers-reduced-motion: reduce)';
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.(query).matches);
  useEffect(() => {
    const mq = window.matchMedia?.(query);
    if (!mq) return undefined;
    const on = () => setReduced(mq.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  return reduced;
}

function ProjectIcon({ id }) {
  if (id === 'spectra')
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 12h3.5l2.5-6 4 12 2.5-6H21" />
      </svg>
    );
  if (id === 'core')
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3 20 7.5v9L12 21l-8-4.5v-9L12 3Z" />
        <path d="M12 12 20 7.5M12 12v9M12 12 4 7.5" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5M16 6a3 3 0 0 1 0 6M17.5 14.5c2 .5 3.5 2 3.5 4.5" />
    </svg>
  );
}

export default function Landing({ onEnter, entering, theme, onToggleTheme }) {
  const reduced = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const pick = id => {
    const p = PROJECTS.find(x => x.id === id);
    if (p && !p.disabled && !entering) onEnter(id);
  };

  const rise = i => ({
    initial: reduced ? false : { opacity: 0, y: 14 },
    animate: { opacity: entering ? 0 : 1, y: 0 },
    transition: { duration: entering ? 0.35 : 0.7, delay: entering ? 0 : 0.15 + i * 0.08, ease: [0.2, 0.7, 0.2, 1] },
  });

  return (
    <div className="ld" data-theme={theme} onScroll={e => setScrolled(e.currentTarget.scrollTop > 8)}>
      <div className="ld-stage" aria-hidden="true">
        {mounted && (
          <Canvas camera={{ position: [0, 2.3, 17.5], fov: 38 }} dpr={[1, 2]} gl={{ antialias: true, powerPreference: 'high-performance' }}>
            <LandingScene theme={theme} projects={PROJECTS} hovered={hovered} setHovered={setHovered} onPick={pick} entering={entering} motion={!reduced} />
          </Canvas>
        )}
      </div>
      <div className="ld-vignette" aria-hidden="true" />

      <header className={`ld-nav${scrolled ? ' is-scrolled' : ''}`}>
        <a className="ld-brand" href="#top" aria-label="Progen Labs home">
          <ProgenMark theme={theme} />
          <span>Progen Labs</span>
        </a>
        <nav aria-label="Primary">
          <button type="button" onClick={() => pick('spectra')}>Spectra</button>
          <button type="button" onClick={() => pick('core')}>The Core</button>
          <a href="https://github.com/progen-labs" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <ThemeToggle className="ld-theme" theme={theme} onToggle={onToggleTheme} />
        </nav>
      </header>

      <main className="ld-main" id="top">
        <m.p className="ld-kicker" {...rise(0)}>
          Nonprofit · Open source · Free forever
        </m.p>
        <m.h1 className="ld-title" {...rise(1)}>
          Understand the web.
          <br />
          <span>Build it faster.</span>
        </m.h1>
        <m.p className="ld-lead" {...rise(2)}>
          Progen Labs is an open-source lab building free software, tools and learning experiences that help developers understand
          technology deeply and ship better products, made in the open for everyone.
        </m.p>
        <m.div className="ld-cta" {...rise(3)}>
          <button type="button" className="ld-btn ld-btn-primary" onClick={() => pick('core')}>
            Explore The Core
            <span aria-hidden="true">→</span>
          </button>
          <button type="button" className="ld-btn ld-btn-ghost" onClick={() => pick('spectra')}>
            Meet Spectra
          </button>
        </m.div>

        <m.section className="ld-projects" aria-label="Projects" {...rise(4)}>
          {PROJECTS.map(p => (
            <button
              key={p.id}
              type="button"
              className={`ld-card${hovered === p.id ? ' is-hot' : ''}`}
              style={{ '--c': p.color }}
              disabled={p.disabled}
              aria-disabled={p.disabled || undefined}
              onMouseEnter={() => setHovered(p.id)}
              onMouseLeave={() => setHovered(h => (h === p.id ? null : h))}
              onFocus={() => setHovered(p.id)}
              onBlur={() => setHovered(h => (h === p.id ? null : h))}
              onClick={() => pick(p.id)}
            >
              <span className="ld-card-icon">
                <ProjectIcon id={p.id} />
              </span>
              <span className="ld-card-body">
                <span className="ld-card-name">{p.name}</span>
                <span className="ld-card-tag">{p.tag}</span>
                <span className="ld-card-desc">{p.desc}</span>
              </span>
              {!p.disabled && (
                <span className="ld-card-cta">
                  {p.cta} <span aria-hidden="true">→</span>
                </span>
              )}
            </button>
          ))}
        </m.section>
      </main>

      <footer className="ld-foot">
        <span>MIT licensed</span>
        <span aria-hidden="true">·</span>
        <span>Built in the open</span>
        <span aria-hidden="true">·</span>
        <span>© Progen Labs</span>
      </footer>
    </div>
  );
}
