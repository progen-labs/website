import { Canvas } from '@react-three/fiber';
import InfinityLogo from './InfinityLogo.jsx';
import Reveal from './Reveal.jsx';

export default function BrandMark() {
  return (
    <section className="brand" id="about-brand" aria-label="Progen Labs mark">
      <div className="brand-canvas">
        <Canvas camera={{ position: [0, 0, 9], fov: 50 }} dpr={[1, 2]} gl={{ alpha: true, antialias: true }}>
          <InfinityLogo />
        </Canvas>
      </div>
      <div className="brand-overlay">
        <Reveal>
          <p className="brand-kicker">The mark</p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="brand-title">
            Free today. Free <span className="grad-text">forever</span>.
          </h2>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="brand-body">
            The infinity loop is a promise: the tools Progen Labs builds stay
            open and stay free, with no end date and no catch.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
