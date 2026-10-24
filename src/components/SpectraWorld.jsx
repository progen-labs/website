import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FRAMEWORKS, MATRIX, USAGE, LINKS } from '../data.js';
import { ThemeToggle } from '../theme.jsx';
import { CopyButton, commandsOf } from './CopyButton.jsx';
import DemoVideo from './DemoVideo.jsx';
import Capabilities from './Capabilities.jsx';
import WhatsNew, { releases } from './WhatsNew.jsx';
import ProgenMark from './ProgenMark.jsx';
import SpectraDocs from '../spectra-docs/SpectraDocs.jsx';
import { DEFAULT_DOC, docFromHash } from '../spectra-docs/index.js';

const ease = [0.22, 1, 0.36, 1];

const INSTALL = commandsOf(USAGE[0].code);

/** The world behind the Spectra gate: everything about Spectra. */
const LATEST = releases()[0];

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
      <nav className="sw-top" aria-label="Spectra elsewhere">
        <a className="sw-top-link" href={LINKS.spectraRepo} target="_blank" rel="noreferrer" title="Spectra on GitHub">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          <span>GitHub</span>
        </a>
        <a className="sw-top-link" href={LINKS.npm} target="_blank" rel="noreferrer" title="@progen-labs/spectra on npm">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M0 0v16h16V0H0zm13 13h-2.5V5.5H8V13H3V3h10v10z" />
          </svg>
          <span>npm</span>
        </a>
        {onToggleTheme && <ThemeToggle className="sw-theme" theme={theme} onToggle={onToggleTheme} />}
      </nav>

      <div className="sw-scroll">
        <div className="sw-inner">
          <motion.header
            className="sw-hero"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.1 }}
          >
            <a
              className="sw-new"
              href="#whats-new"
              onClick={e => {
                e.preventDefault();
                document.getElementById('whats-new')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              <span className="sw-new-tag">New</span>
              {LATEST.title}: {LATEST.summary.split(/\.\s/)[0].replace(/\.$/, '').replace(/`/g, '')} →
            </a>
            <p className="sw-kicker">Make your web app faster</p>
            <h1 className="sw-title grad-text">SPECTRA</h1>
            <p className="sw-lead">
              Install it, then ask your AI agent to improve the performance. Spectra measures your app, names the
              exact file, function and component that slow it down, has each problem fixed, measures again, and
              keeps only what measurably helped. Or run one command and let it work unattended.
            </p>
            <div className="sw-cta">
              <a
                className="btn btn-primary"
                href={`#spectra/docs/${docPage}`}
                onClick={e => {
                  e.preventDefault();
                  openDoc(docPage);
                }}
              >
                Read the docs
              </a>
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
            </div>
            <div className="sw-install">
              <span className="sw-prompt" aria-hidden="true">$</span>
              <code className="sw-install-cmd">
                {/* each word unbroken, so a narrow screen wraps at a space, not inside the package name */}
                {INSTALL.split(' ').flatMap((word, i) => [i ? ' ' : null, <span key={i}>{word}</span>])}
              </code>
              <CopyButton text={INSTALL} label="Copy the npm install command" />
            </div>
          </motion.header>

          <section className="sw-section" id="what-it-does">
            <h2 className="sw-h2">What it does</h2>
            <Capabilities onDoc={openDoc} />
          </section>

          <section className="sw-section" id="whats-new">
            <h2 className="sw-h2">What's new</h2>
            <WhatsNew onDoc={openDoc} />
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
            <ProgenMark theme={theme} className="sw-foot-mark" />
            <p>Spectra is a <strong>Progen Labs</strong> project — independent, open source, always free.</p>
            <button className="btn btn-ghost" onClick={onBack}>← Back to Progen Labs</button>
          </footer>
        </div>
      </div>
      <AnimatePresence>{demo && <DemoVideo key="demo" onClose={closeDemo} />}</AnimatePresence>
    </motion.div>
  );
}
