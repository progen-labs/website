// A short, silent 3D loop that shows what a Spectra feature does. It loads and
// plays only while it is on screen, and stays a still poster for people who
// prefer reduced motion. The loops come from Spectra's video/ project.
import { useEffect, useRef, useState } from 'react';

const VIDEOS = import.meta.glob('../assets/spectra/features/*.mp4', { eager: true, query: '?url', import: 'default' });
const POSTERS = import.meta.glob('../assets/spectra/features/*.jpg', { eager: true, query: '?url', import: 'default' });

export default function FeatureVideo({ id, label }) {
  const ref = useRef(null);
  const [src, setSrc] = useState(null);
  const poster = POSTERS[`../assets/spectra/features/${id}.jpg`];
  const url = VIDEOS[`../assets/spectra/features/${id}.mp4`];

  useEffect(() => {
    const video = ref.current;
    if (!video || !url) return;
    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (still) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSrc(url);
          video.play?.().catch(() => {});
        } else video.pause?.();
      },
      { threshold: 0.35 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, [url]);

  useEffect(() => {
    if (src) ref.current?.play?.().catch(() => {});
  }, [src]);

  if (!url) return null;
  return (
    <div className="feature-media">
      <video ref={ref} src={src || undefined} poster={poster} muted loop playsInline preload="none" aria-label={label} />
    </div>
  );
}
