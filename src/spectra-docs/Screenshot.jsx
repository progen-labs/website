// An annotated screenshot: numbered boxes over the image, explained by the
// legend underneath. When it comes into view it plays a short guided tour:
// each numbered part is lit in turn (the rest of the screenshot dims) while its
// legend entry is highlighted, so it is plain which text belongs to which part.
// Hovering, focusing or tapping a number or a legend entry takes over; the tour
// can be paused and played, and it never starts by itself for people who ask
// for less motion. Region positions come from images/manifest.json, written
// together with the images by Spectra's scripts/docs-screenshots.mjs, so the
// boxes stay aligned whenever the screenshots are refreshed. The legend carries
// the meaning for screen readers; the boxes are a visual aid.
import { useEffect, useRef, useState } from 'react';
import MANIFEST from './images/manifest.json';

const IMAGES = import.meta.glob('./images/*.webp', { eager: true, query: '?url', import: 'default' });
const DWELL = 3200; // ms on each part during the tour
const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export default function Screenshot({ name, caption, items, renderText }) {
  const [step, setStep] = useState(1); // the tour's part
  const [hovered, setHovered] = useState(null); // under the pointer or focused
  const [pinned, setPinned] = useState(null); // tapped or clicked
  const [playing, setPlaying] = useState(() => !reducedMotion());
  const [inView, setInView] = useState(false);
  const [ready, setReady] = useState(false); // boxes wait for the image
  const img = useRef(null);
  const figure = useRef(null);
  const shot = MANIFEST[name];
  const numbered = items.map((item, i) => ({ ...item, n: i + 1, box: shot?.regions[item.key] }));
  const count = numbered.length;

  useEffect(() => {
    if (img.current?.complete && img.current.naturalWidth) setReady(true);
  }, []);
  // the tour runs only while the screenshot is on screen
  useEffect(() => {
    if (!figure.current || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.45 });
    io.observe(figure.current);
    return () => io.disconnect();
  }, []);
  const touring = playing && inView && ready && hovered == null && pinned == null && count > 1;
  useEffect(() => {
    if (!touring) return undefined;
    const t = setTimeout(() => setStep(s => (s % count) + 1), DWELL);
    return () => clearTimeout(t);
  }, [touring, step, count]);

  if (!shot) return <p className="md-note">Missing screenshot “{name}”.</p>;
  const url = IMAGES[`./images/${name}.webp`];
  if (!url) return <p className="md-note">Missing screenshot “{name}”.</p>;

  const active = hovered ?? pinned ?? (playing && inView ? step : null);
  const activeBox = numbered.find(i => i.n === active)?.box;
  const pick = n => ({
    onMouseEnter: () => setHovered(n),
    onMouseLeave: () => setHovered(null),
    onFocus: () => setHovered(n),
    onBlur: () => setHovered(null),
    onClick: () => {
      // a tap pins that part (and stops the tour); tapping it again lets go
      setPinned(p => (p === n ? null : n));
      setPlaying(false);
      setStep(n);
    },
  });
  const toggleTour = () => {
    setPinned(null);
    setPlaying(p => !p);
  };

  return (
    <figure
      ref={figure}
      className={`shot${active ? ' has-active' : ''}${ready ? ' is-ready' : ''}${shot.width >= 900 ? ' is-wide' : ''}${touring ? ' is-touring' : ''}`}
    >
      {/* on phones a wide screenshot keeps a legible size and scrolls sideways */}
      <div className="shot-scroll">
        <div className="shot-frame">
          <img
            ref={img}
            src={url}
            alt={caption}
            width={shot.width}
            height={shot.height}
            loading="lazy"
            decoding="async"
            onLoad={() => setReady(true)}
          />
          {/* the rest of the screenshot dims around the part being explained */}
          {activeBox && (
            <span className="shot-dim" aria-hidden="true">
              <span
                className="shot-spot"
                style={{ left: `${activeBox[0]}%`, top: `${activeBox[1]}%`, width: `${activeBox[2]}%`, height: `${activeBox[3]}%` }}
              />
            </span>
          )}
          {numbered.map(
            item =>
              item.box && (
                <span
                  key={item.n}
                  className={`shot-box${active === item.n ? ' is-active' : ''}`}
                  style={{
                    left: `${item.box[0]}%`,
                    top: `${item.box[1]}%`,
                    width: `${item.box[2]}%`,
                    height: `${item.box[3]}%`,
                  }}
                  aria-hidden="true"
                  onMouseEnter={() => setHovered(item.n)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={pick(item.n).onClick}
                >
                  <span className="shot-badge">{item.n}</span>
                </span>
              ),
          )}
        </div>
      </div>
      <figcaption>
        <span>{caption}</span>
        <a href={url} target="_blank" rel="noreferrer">
          Full size
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </figcaption>
      {count > 1 && (
        <div className="shot-tour">
          <button type="button" className="shot-tour-btn" onClick={toggleTour} aria-pressed={playing && pinned == null}>
            {playing && pinned == null ? (
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <rect x="4" y="3" width="3" height="10" rx="1" />
                <rect x="9" y="3" width="3" height="10" rx="1" />
              </svg>
            ) : (
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M5 3.2v9.6L13 8z" />
              </svg>
            )}
            {playing && pinned == null ? 'Pause tour' : 'Play tour'}
          </button>
          <span className="shot-tour-dots" aria-hidden="true">
            {numbered.map(item => (
              <i key={item.n} className={active === item.n ? 'is-on' : undefined} />
            ))}
          </span>
          <span className="shot-tour-hint">{active ? `${active} of ${count}` : `${count} parts`} · hover or tap a number to explore</span>
        </div>
      )}
      {count > 0 && (
        <ol className="shot-legend">
          {numbered.map(item => (
            <li
              key={item.n}
              className={active === item.n ? 'is-active' : undefined}
              aria-current={active === item.n ? 'true' : undefined}
              tabIndex={0}
              {...pick(item.n)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  pick(item.n).onClick();
                }
              }}
            >
              <span className="shot-num" aria-hidden="true">
                {item.n}
              </span>
              <span>{renderText(item.text)}</span>
              {/* how long the tour stays on this part */}
              {touring && active === item.n && <span key={`${item.n}-${step}`} className="shot-progress" style={{ animationDuration: `${DWELL}ms` }} aria-hidden="true" />}
            </li>
          ))}
        </ol>
      )}
    </figure>
  );
}

/**
 * The body of a ```screenshot <name> fence: the first line is the caption (and
 * the image's alt text), every further line is `region: legend text`.
 */
export function parseScreenshot(arg, text) {
  const [caption = '', ...lines] = text.split('\n').filter(l => l.trim());
  const items = lines.map(line => {
    const at = line.indexOf(':');
    return { key: line.slice(0, at).trim(), text: line.slice(at + 1).trim() };
  });
  return { name: (arg || '').trim(), caption: caption.trim(), items };
}
