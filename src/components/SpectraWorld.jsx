import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SPECTRA_FEATURES, FRAMEWORKS, MATRIX, USAGE, LINKS } from '../data.js';
import { ThemeToggle } from '../theme.jsx';
import { CopyButton, commandsOf } from './CopyButton.jsx';
import DemoVideo from './DemoVideo.jsx';
import FeatureVideo from './FeatureVideo.jsx';
import SpectraDocs from '../spectra-docs/SpectraDocs.jsx';
import { DEFAULT_DOC, docFromHash } from '../spectra-docs/index.js';

const ease = [0.22, 1, 0.36, 1];

const INSTALL = commandsOf(USAGE[0].code);

/** The world behind the Spectra gate: everything about Spectra. */
export default function SpectraWorld({ onBack, theme = 'dark', onToggleTheme }) {
  const [tab, setTab] = useState(USAGE[0].id);
  const current = USAGE.find(u => u.id === tab) || USAGE[0];
  // shell snippets copy without their comments; a YAML snippet copies as written
  const currentCommands = current.lang === 'bash' ? commandsOf(current.code) : current.code;
  const many = currentCommands.includes('\n');

  // Documentation: the page lives in the URL (#spectra/docs/<id>), so a docs
  // link can be shared and the back button walks through visited pages.
  const [docPage, setDocPage] = useState(() => docFromHash() || DEFAULT_DOC);
  const docsRef = useRef(null);
  const docTitleRef = useRef(null);
  const showDocs = useCallback(focus => {
    const smooth = !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    requestAnimationFrame(() => {
      docsRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
      if (focus) docTitleRef.current?.focus({ preventScroll: true });
    });
  }, []);
  const openDoc = useCallback(
    id => {
      setDocPage(id);
      if (window.location.hash !== `#spectra/docs/${id}`) window.history.pushState(null, '', `#spectra/docs/${id}`);
      showDocs(true);
    },
    [showDocs],
  );
  // the demo film lives at #spectra/demo
  // (opened from this page: closing goes back; opened from a shared link: closing replaces it)
  const [demo, setDemo] = useState(() => window.location.hash === '#spectra/demo');
  const pushedDemo = useRef(false);
  const openDemo = useCallback(() => {
    if (window.location.hash !== '#spectra/demo') {
      window.history.pushState(null, '', '#spectra/demo');
      pushedDemo.current = true;
    }
    setDemo(true);
  }, []);
  const closeDemo = useCallback(() => {
    setDemo(false);
    if (pushedDemo.current) {
      pushedDemo.current = false;
      window.history.back();
    } else window.history.replaceState(null, '', '#spectra');
  }, []);

  useEffect(() => {
    if (docFromHash()) showDocs(false); // arrived through a docs link
    const onPop = () => {
      const open = window.location.hash === '#spectra/demo';
      if (!open) pushedDemo.current = false;
      setDemo(open);
      const id = docFromHash();
      if (id) {
        setDocPage(id);
        showDocs(false);
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [showDocs]);

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
            <p className="sw-kicker">Frontend performance, measured</p>
            <h1 className="sw-title grad-text">SPECTRA</h1>
            <p className="sw-lead">
              Spectra finds the exact file, function and component slowing your frontend, and proves each fix
              with before-and-after measurements. Use it from the terminal, VS Code, your AI assistant or CI.
            </p>
            <div className="sw-install">
              <span className="sw-prompt" aria-hidden="true">$</span>
              <code className="sw-install-cmd">{INSTALL}</code>
              <CopyButton text={INSTALL} label="Copy the npm install command" />
            </div>
            <div className="sw-cta">
              <a className="btn btn-primary" href={LINKS.npm} target="_blank" rel="noreferrer">@progen-labs/spectra on npm ↗</a>
              <a
                className="btn btn-ghost btn-demo"
                href="#spectra/demo"
                onClick={e => {
                  e.preventDefault();
                  openDemo();
                }}
              >
                <span className="btn-play" aria-hidden="true">
                  <svg viewBox="0 0 12 12">
                    <path d="M3 1.8 L10 6 L3 10.2 Z" />
                  </svg>
                </span>
                Watch the demo
              </a>
              <a
                className="btn btn-ghost"
                href={`#spectra/docs/${docPage}`}
                onClick={e => {
                  e.preventDefault();
                  openDoc(docPage);
                }}
              >
                Documentation
              </a>
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
                  {f.media && <FeatureVideo id={f.media} label={`${f.title}, animated`} />}
                  <span className="feature-index">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{f.title}</h3>
                  <p>{f.body}</p>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="sw-section">
            <h2 className="sw-h2">Get started</h2>
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
                  label={current.lang === 'yaml' ? 'Copy the workflow steps' : `Copy the ${current.label.toLowerCase()} command${many ? 's' : ''}`}
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
            <h2 className="sw-h2">What a run reports</h2>
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
                <div className="matrix-foot">Spectra's demo app · 3/3 golden paths passed · reports saved to .spectra/reports</div>
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
            <p className="frameworks-note"><strong>Deep</strong>: component render counts and timings. <strong>Generic</strong>: source-mapped files and functions.</p>
          </section>

          <section className="sw-section sw-docs" id="spectra-docs" ref={docsRef} aria-labelledby="spectra-docs-heading">
            <h2 className="sw-h2" id="spectra-docs-heading">Documentation</h2>
            <SpectraDocs page={docPage} onNavigate={openDoc} titleRef={docTitleRef} />
          </section>

          <footer className="sw-foot">
            <p>Spectra is a <strong>Progen Labs</strong> project — open source, nonprofit, always free.</p>
            <button className="btn btn-ghost" onClick={onBack}>← Back to Progen Labs</button>
          </footer>
        </div>
      </div>
      <AnimatePresence>{demo && <DemoVideo key="demo" onClose={closeDemo} />}</AnimatePresence>
    </motion.div>
  );
}
