import { useState } from 'react';
import { motion } from 'framer-motion';
import { SPECTRA_FEATURES, FRAMEWORKS, MATRIX, USAGE, LINKS } from '../data.js';

const ease = [0.22, 1, 0.36, 1];

/** The world behind the Spectra gate: everything about Spectra. */
export default function SpectraWorld({ onBack }) {
  const [tab, setTab] = useState(USAGE[0].id);
  const current = USAGE.find(u => u.id === tab) || USAGE[0];

  return (
    <motion.div
      className="spectra-world"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="sw-stars" />
      <button className="sw-back" onClick={onBack}>
        ← Back to Progen Labs
      </button>

      <div className="sw-scroll">
        <div className="sw-inner">
          <motion.header
            className="sw-hero"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.1 }}
          >
            <p className="sw-kicker">You have entered</p>
            <h1 className="sw-title grad-text">SPECTRA</h1>
            <p className="sw-lead">
              A CLI and dashboard that profiles a frontend build through the Chrome
              DevTools Protocol. Run one command and it starts your dev server,
              auto-discovers the actionable elements on the page, drives a set of
              golden-path journeys, records each one, and reports a ranked list of
              culprits — each with the exact file, function and component costing
              you time.
            </p>
            <div className="sw-cta">
              <a className="btn btn-primary" href={LINKS.npm} target="_blank" rel="noreferrer">@progen-labs/spectra on npm ↗</a>
              <a className="btn btn-ghost" href={LINKS.spectraRepo} target="_blank" rel="noreferrer">GitHub ↗</a>
            </div>
          </motion.header>

          <section className="sw-section">
            <h2 className="sw-h2">What it does</h2>
            <div className="feature-grid">
              {SPECTRA_FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  className="feature-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: (i % 3) * 0.06 }}
                >
                  <span className="feature-index">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{f.title}</h3>
                  <p>{f.body}</p>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="sw-section">
            <h2 className="sw-h2">How to use it</h2>
            <div className="code-shell">
              <div className="code-tabs">
                {USAGE.map(u => (
                  <button key={u.id} className={`code-tab ${tab === u.id ? 'active' : ''}`} onClick={() => setTab(u.id)}>
                    {u.label}
                  </button>
                ))}
              </div>
              <div className="code-panel">
                <pre className="code-block"><code>{current.code}</code></pre>
                <p className="code-note">{current.note}</p>
              </div>
            </div>
          </section>

          <section className="sw-section">
            <h2 className="sw-h2">A run, visualized</h2>
            <div className="matrix-card">
              <div className="matrix-head">
                <span className="dot r" /><span className="dot y" /><span className="dot g" />
                <span className="matrix-title">spectra performance</span>
              </div>
              <div className="matrix-body">
                <div className="matrix-row matrix-row-head"><span>Golden path</span><span>Result</span><span>Top finding</span></div>
                {MATRIX.map(m => (
                  <div className="matrix-row" key={m.path}>
                    <span className="mono">{m.path}</span>
                    <span className="badge-pass">{m.result}</span>
                    <span className={m.critical ? 'finding crit' : 'finding'}>{m.top}</span>
                  </div>
                ))}
                <div className="matrix-foot">Automation: 4/4 golden paths passed · reports saved to .spectra/reports</div>
              </div>
            </div>
          </section>

          <section className="sw-section">
            <h2 className="sw-h2">Works across the stack</h2>
            <div className="framework-list">
              {FRAMEWORKS.map(fw => (
                <div className={`framework ${fw.depth === 'Deep' ? 'deep' : ''}`} key={fw.name}>
                  <span className="framework-name">{fw.name}</span>
                  <span className="framework-depth">{fw.depth}</span>
                </div>
              ))}
            </div>
            <p className="frameworks-note"><strong>Deep</strong> = per-component render counts & timings. <strong>Generic</strong> = source-mapped file/function attribution.</p>
          </section>

          <footer className="sw-foot">
            <p>Spectra is a <strong>Progen Labs</strong> project — open source, nonprofit, always free.</p>
            <button className="btn btn-ghost" onClick={onBack}>← Return to the world</button>
          </footer>
        </div>
      </div>
    </motion.div>
  );
}
