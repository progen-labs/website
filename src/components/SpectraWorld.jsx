import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { SPECTRA_FEATURES, FRAMEWORKS, MATRIX, USAGE, LINKS } from '../data.js';
import { ThemeToggle } from '../theme.jsx';

const ease = [0.22, 1, 0.36, 1];

// the runnable lines of a snippet, without its # comments
const commandsOf = code =>
  code
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'))
    .join('\n');
const INSTALL = commandsOf(USAGE[0].code);

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // older browsers, or the clipboard API blocked outside a secure context
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

function CopyButton({ text, label, className = '' }) {
  const [state, setState] = useState('idle'); // idle | copied | failed
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = async () => {
    setState((await copyText(text)) ? 'copied' : 'failed');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), 2000);
  };
  return (
    <>
      <button type="button" className={`copy-btn ${state === 'copied' ? 'is-copied' : ''} ${className}`} onClick={copy} aria-label={label} title={label}>
        {state === 'copied' ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="8.5" y="8.5" width="11" height="11" rx="2.2" />
            <path d="M15.5 8.5V6.2a1.7 1.7 0 0 0-1.7-1.7H6.2a1.7 1.7 0 0 0-1.7 1.7v7.6c0 .94.76 1.7 1.7 1.7h2.3" />
          </svg>
        )}
        <span className="copy-text">{state === 'copied' ? 'Copied' : state === 'failed' ? 'Press Ctrl+C' : 'Copy'}</span>
      </button>
      <span className="sr-only" role="status">
        {state === 'copied' ? 'Copied to clipboard' : state === 'failed' ? 'Copy failed. Select the command and copy it manually.' : ''}
      </span>
    </>
  );
}

/** The world behind the Spectra gate: everything about Spectra. */
export default function SpectraWorld({ onBack, theme = 'dark', onToggleTheme }) {
  const [tab, setTab] = useState(USAGE[0].id);
  const current = USAGE.find(u => u.id === tab) || USAGE[0];
  const currentCommands = commandsOf(current.code);
  const many = currentCommands.includes('\n');

  return (
    <motion.div
      className="spectra-world"
      data-theme={theme}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="sw-stars" />
      <button className="sw-back" onClick={onBack}>
        ← Back to Progen Labs
      </button>
      {onToggleTheme && <ThemeToggle className="sw-theme" theme={theme} onToggle={onToggleTheme} />}

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
            <div className="sw-install">
              <span className="sw-prompt" aria-hidden="true">$</span>
              <code className="sw-install-cmd">{INSTALL}</code>
              <CopyButton text={INSTALL} label="Copy the npm install command" />
            </div>
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
                  <button key={u.id} className={`code-tab ${tab === u.id ? 'active' : ''}`} aria-pressed={tab === u.id} onClick={() => setTab(u.id)}>
                    {u.label}
                  </button>
                ))}
              </div>
              <div className="code-panel">
                <CopyButton
                  key={current.id}
                  text={currentCommands}
                  label={`Copy the ${current.label.toLowerCase()} command${many ? 's' : ''}`}
                  className="copy-btn-float"
                />
                <pre className="code-block">
                  <code>
                    {current.code.split('\n').map((line, i) => (
                      <span key={i} className={line.trim().startsWith('#') ? 'code-comment' : 'code-cmd'}>
                        {line}
                        {'\n'}
                      </span>
                    ))}
                  </code>
                </pre>
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
