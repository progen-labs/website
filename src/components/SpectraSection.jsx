import { motion } from 'framer-motion';
import Reveal from './Reveal.jsx';
import { SPECTRA_FEATURES, FRAMEWORKS, MATRIX, LINKS } from '../data.js';

export default function SpectraSection() {
  return (
    <section className="section section-spectra" id="spectra">
      <div className="container">
        <Reveal>
          <p className="kicker">Our first tool</p>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="section-title">
            <span className="grad-text">Spectra</span> — find out what makes your
            frontend slow.
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="section-lead">
            Spectra is a CLI and dashboard that profiles a frontend build through
            the Chrome DevTools Protocol. Run one command and it starts your dev
            server, auto-discovers the actionable elements on the page, drives a
            set of <strong>golden-path journeys</strong>, records each one, and
            reports a ranked list of culprits — each with the exact file,
            function and component costing you time.
          </p>
        </Reveal>

        <div className="feature-grid">
          {SPECTRA_FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              className="feature-card"
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: (i % 3) * 0.07 }}
            >
              <span className="feature-index">{String(i + 1).padStart(2, '0')}</span>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </motion.div>
          ))}
        </div>

        {/* Golden-path matrix mock */}
        <Reveal className="matrix-wrap">
          <div className="matrix-card">
            <div className="matrix-head">
              <span className="dot r" />
              <span className="dot y" />
              <span className="dot g" />
              <span className="matrix-title">spectra performance</span>
            </div>
            <div className="matrix-body">
              <div className="matrix-row matrix-row-head">
                <span>Golden path</span>
                <span>Result</span>
                <span>Top finding</span>
              </div>
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
        </Reveal>

        {/* Framework support */}
        <Reveal>
          <div className="frameworks">
            <h3 className="frameworks-title">Works across the stack</h3>
            <div className="framework-list">
              {FRAMEWORKS.map(fw => (
                <div className={`framework ${fw.depth === 'Deep' ? 'deep' : ''}`} key={fw.name}>
                  <span className="framework-name">{fw.name}</span>
                  <span className="framework-depth">{fw.depth}</span>
                </div>
              ))}
            </div>
            <p className="frameworks-note">
              <strong>Deep</strong> = per-component render counts & timings.{' '}
              <strong>Generic</strong> = source-mapped file/function attribution.
            </p>
          </div>
        </Reveal>

        <Reveal className="spectra-links">
          <a className="btn btn-primary" href="#usage">
            See how to use it
          </a>
          <a className="btn btn-ghost" href={LINKS.npm} target="_blank" rel="noreferrer">
            @progen-labs/spectra on npm ↗
          </a>
        </Reveal>
      </div>
    </section>
  );
}
