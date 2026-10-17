// A short demo video, from a ```video <name> fence whose body is the caption.
// Each video lives in ./videos as <name>.mp4 with a <name>.jpg poster, and
// nothing but the poster loads until the reader presses play.
const VIDEOS = import.meta.glob('./videos/*.mp4', { eager: true, query: '?url', import: 'default' });
const POSTERS = import.meta.glob('./videos/*.jpg', { eager: true, query: '?url', import: 'default' });

export default function Video({ name, caption }) {
  const src = VIDEOS[`./videos/${name}.mp4`];
  if (!src) return <p className="md-note">Missing video “{name}”.</p>;
  return (
    // keyed, so moving to another page's video swaps the element, not just its source
    <figure key={name} className="shot demo-video">
      <div className="shot-frame">
        <video src={src} controls preload="none" playsInline poster={POSTERS[`./videos/${name}.jpg`]} aria-label={caption} />
      </div>
      <figcaption>
        <span>{caption}</span>
      </figcaption>
    </figure>
  );
}

export const parseVideo = (arg, text) => ({ name: (arg || '').trim(), caption: text.trim().replace(/\s*\n\s*/g, ' ') });
