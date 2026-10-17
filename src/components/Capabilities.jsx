// "What it does": Spectra's capabilities in four groups — find, prove, fix,
// fit in. Each group is one card with one 3D loop; choosing a capability in
// its list swaps the loop and opens its description, so the section shows
// everything without a wall of thirteen videos.
import { useState } from 'react';
import { motion } from 'framer-motion';
import { SPECTRA_PILLARS } from '../data.js';
import FeatureVideo from './FeatureVideo.jsx';

function Pillar({ pillar, index, onDoc }) {
  const [active, setActive] = useState(0);
  const current = pillar.features[active];
  return (
    <motion.article
      className={`pillar pillar-${pillar.id}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: (index % 2) * 0.08 }}
    >
      <header className="pillar-head">
        <span className="pillar-n">{String(index + 1).padStart(2, '0')}</span>
        <h3>
          <span className="pillar-verb">{pillar.title}</span> {pillar.line}
        </h3>
      </header>
      <FeatureVideo key={current.media} id={current.media} label={`${current.title}, animated`} />
      <ul className="pillar-list">
        {pillar.features.map((f, i) => {
          const open = i === active;
          return (
            <li key={f.title} className={open ? 'is-open' : undefined}>
              <button type="button" className="pillar-item" aria-expanded={open} onClick={() => setActive(i)}>
                <span>{f.title}</span>
                {f.badge && <span className="feature-badge">{f.badge}</span>}
              </button>
              {open && (
                <div className="pillar-body">
                  <p>{f.body}</p>
                  <a
                    className="feature-link"
                    href={`#spectra/docs/${f.doc}`}
                    onClick={e => {
                      e.preventDefault();
                      onDoc(f.doc);
                    }}
                  >
                    Read more →
                  </a>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </motion.article>
  );
}

export default function Capabilities({ onDoc }) {
  return (
    <div className="pillars">
      {SPECTRA_PILLARS.map((p, i) => (
        <Pillar key={p.id} pillar={p} index={i} onDoc={onDoc} />
      ))}
    </div>
  );
}
