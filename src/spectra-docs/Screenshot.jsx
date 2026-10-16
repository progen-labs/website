// An annotated screenshot: numbered boxes over the image, explained by the
// legend underneath. Hovering a box or a legend entry highlights the pair.
// Region positions come from images/manifest.json, written together with the
// images by Spectra's scripts/docs-screenshots.mjs, so the boxes stay aligned
// whenever the screenshots are refreshed. The legend carries the meaning for
// screen readers; the boxes are a visual aid.
import { useEffect, useRef, useState } from 'react';
import MANIFEST from './images/manifest.json';

const IMAGES = import.meta.glob('./images/*.webp', { eager: true, query: '?url', import: 'default' });

export default function Screenshot({ name, caption, items, renderText }) {
  const [active, setActive] = useState(null);
  const [ready, setReady] = useState(false); // boxes wait for the image
  const img = useRef(null);
  useEffect(() => {
    if (img.current?.complete && img.current.naturalWidth) setReady(true);
  }, []);
  const shot = MANIFEST[name];
  const url = IMAGES[`./images/${name}.webp`];
  if (!shot || !url) return <p className="md-note">Missing screenshot “{name}”.</p>;

  const numbered = items.map((item, i) => ({ ...item, n: i + 1, box: shot.regions[item.key] }));
  const hover = n => ({ onMouseEnter: () => setActive(n), onMouseLeave: () => setActive(null) });

  return (
    <figure
      className={`shot${active ? ' has-active' : ''}${ready ? ' is-ready' : ''}${shot.width >= 900 ? ' is-wide' : ''}`}
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
                  {...hover(item.n)}
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
      {numbered.length > 0 && (
        <ol className="shot-legend">
          {numbered.map(item => (
            <li key={item.n} className={active === item.n ? 'is-active' : undefined} {...hover(item.n)}>
              <span className="shot-num" aria-hidden="true">
                {item.n}
              </span>
              <span>{renderText(item.text)}</span>
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
