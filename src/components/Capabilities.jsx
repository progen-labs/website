// "What it does": Spectra's capabilities in four groups — find, prove, fix,
// fit in. Each group is one card with one 3D loop. Its capabilities are a
// playlist under the loop: each row shows its own loop's thumbnail with a
// play button, says "Watch", and the one on screen says "Playing" (as does a
// label on the video), so it is plain that choosing a row changes the video.
import { useState } from 'react';
import { motion } from 'framer-motion';
import { SPECTRA_PILLARS } from '../data.js';
import FeatureVideo from './FeatureVideo.jsx';

const POSTERS = import.meta.glob('../assets/spectra/features/*.jpg', { eager: true, query: '?url', import: 'default' });
const poster = media => POSTERS[`../assets/spectra/features/${media}.jpg`];

const Play = () => (
  <svg viewBox="0 0 12 12" aria-hidden="true">
    <path d="M3.4 1.9 L10 6 L3.4 10.1 Z" />
  </svg>
);
// three bars that rise and fall while a loop is playing
const Playing = () => (
  <span className="eq" aria-hidden="true">
    <i />
    <i />
    <i />
  </span>
);

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
      <div className="pillar-stage">
        <FeatureVideo key={current.media} id={current.media} label={`${current.title}, animated`} />
        <span className="pillar-now">
          <Playing />
          {current.title}
        </span>
      </div>
      <p className="pillar-hint">
        <Play /> Pick one to watch it in action
      </p>
      <ul className="pillar-list">
        {pillar.features.map((f, i) => {
          const open = i === active;
          return (
            <li key={f.title} className={open ? 'is-open' : undefined}>
              <button
                type="button"
                className="pillar-item"
                aria-pressed={open}
                aria-label={open ? `${f.title}, playing` : `Watch ${f.title}`}
                onClick={() => setActive(i)}
              >
                <span className="pillar-thumb">
                  {poster(f.media) && <img src={poster(f.media)} alt="" loading="lazy" />}
                  <span className="pillar-thumb-play">{open ? <Playing /> : <Play />}</span>
                </span>
                <span className="pillar-item-title">{f.title}</span>
                {f.badge && <span className="feature-badge">{f.badge}</span>}
                <span className="pillar-cue">{open ? 'Playing' : 'Watch ›'}</span>
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
