// Spectra's two-minute launch film, full screen, with chapters to jump to.
// It lives at #spectra/demo, so it can be shared and closed with the back
// button or Escape.
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import film from '../assets/spectra/launch.mp4?url';
import poster from '../assets/spectra/launch.jpg?url';

// chapter starts, in seconds (Spectra's video/src/launch/timeline.js)
export const CHAPTERS = [
  { t: 0, label: 'Intro' },
  { t: 8.4, label: 'The problem' },
  { t: 15.9, label: 'MCP server' },
  { t: 30.9, label: 'Claude Code' },
  { t: 45.9, label: 'VS Code' },
  { t: 60.9, label: 'One free package' },
  { t: 68.4, label: 'The CLI' },
  { t: 98.4, label: 'AI fix harness' },
  { t: 105.9, label: 'Frameworks' },
  { t: 113.4, label: 'Open source' },
];
const clock = t => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;

export default function DemoVideo({ onClose }) {
  const video = useRef(null);
  const close = useRef(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    close.current?.focus();
    // opened by a click, so the film may start with its sound on
    video.current?.play?.().catch(() => {});
    const onKey = e => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const active = [...CHAPTERS].reverse().find(c => now >= c.t - 0.05)?.t;
  return (
    <motion.div
      className="demo-film"
      role="dialog"
      aria-modal="true"
      aria-label="Spectra demo video"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, pointerEvents: 'none' }}
      transition={{ duration: 0.35 }}
    >
      <div className="demo-film-inner">
        <div className="demo-film-head">
          <div>
            <p className="sw-kicker">The demo · 2 minutes</p>
            <h2 className="demo-film-title">Spectra, from your AI assistant to its own AI fix harness</h2>
          </div>
          <button ref={close} className="demo-film-close" onClick={onClose} aria-label="Close the demo">
            ✕
          </button>
        </div>
        <video ref={video} className="demo-film-video" src={film} poster={poster} controls playsInline preload="metadata" onTimeUpdate={e => setNow(e.currentTarget.currentTime)} />
        <nav className="demo-film-chapters" aria-label="Chapters">
          {CHAPTERS.map(c => (
            <button
              key={c.t}
              className={`demo-chapter${active === c.t ? ' is-active' : ''}`}
              aria-current={active === c.t ? 'true' : undefined}
              onClick={() => {
                if (!video.current) return;
                video.current.currentTime = c.t;
                video.current.play?.().catch(() => {});
              }}
            >
              <span className="demo-chapter-time">{clock(c.t)}</span>
              {c.label}
            </button>
          ))}
        </nav>
      </div>
    </motion.div>
  );
}
