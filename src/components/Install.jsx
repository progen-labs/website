import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Reveal from './Reveal.jsx';
import { USAGE } from '../data.js';

export default function Install() {
  const [active, setActive] = useState(USAGE[0].id);
  const [copied, setCopied] = useState(false);
  const current = USAGE.find(u => u.id === active) || USAGE[0];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(current.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — no-op */
    }
  };

  return (
    <section className="section section-usage" id="usage">
      <div className="container">
        <Reveal>
          <p className="kicker">Usage</p>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="section-title">Up and running in one command.</h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="section-lead">
            Install Spectra as a dev dependency and run it from the root of your
            project. No config, no account, no setup.
          </p>
        </Reveal>

        <Reveal className="code-shell">
          <div className="code-tabs">
            {USAGE.map(u => (
              <button
                key={u.id}
                className={`code-tab ${active === u.id ? 'active' : ''}`}
                onClick={() => setActive(u.id)}
              >
                {u.label}
              </button>
            ))}
          </div>

          <div className="code-panel">
            <button className="copy-btn" onClick={copy} aria-label="Copy command">
              {copied ? 'Copied ✓' : 'Copy'}
            </button>
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <pre className="code-block">
                  <code>{current.code}</code>
                </pre>
                <p className="code-note">{current.note}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>

        <Reveal className="usage-steps">
          <div className="step">
            <span className="step-n">1</span>
            <div>
              <h4>Run it</h4>
              <p>
                <code>npx spectra performance</code> self-boots your dev server,
                runs the golden-path suite, and prints the matrix.
              </p>
            </div>
          </div>
          <div className="step">
            <span className="step-n">2</span>
            <div>
              <h4>Read the culprits</h4>
              <p>
                Each journey becomes a report with ranked culprits, component
                re-renders, long tasks, network and memory findings.
              </p>
            </div>
          </div>
          <div className="step">
            <span className="step-n">3</span>
            <div>
              <h4>See it visually</h4>
              <p>
                <code>npx spectra dashboard</code> opens the full UI — with PDF
                export and commit-to-commit comparison.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
