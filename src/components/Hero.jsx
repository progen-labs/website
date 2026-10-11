import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import SpectrumField from './SpectrumField.jsx';
import { LINKS } from '../data.js';

const ease = [0.22, 1, 0.36, 1];

export default function Hero() {
  const pointer = useRef({ x: 0, y: 0 });

  const onMove = e => {
    pointer.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
    pointer.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
  };

  return (
    <header className="hero" onPointerMove={onMove}>
      <div className="hero-canvas">
        <Canvas
          camera={{ position: [0, 3.2, 9.5], fov: 62 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
        >
          <fog attach="fog" args={['#05060e', 12, 30]} />
          <SpectrumField pointer={pointer} />
        </Canvas>
        <div className="hero-canvas-fade" />
      </div>

      <div className="hero-content">
        <motion.div
          className="eyebrow"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
        >
          <span className="eyebrow-dot" /> Nonprofit · Open source · Always free
        </motion.div>

        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.08 }}
        >
          Developer tools for the
          <br />
          <span className="grad-text">whole spectrum</span> of the web.
        </motion.h1>

        <motion.p
          className="hero-sub"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.18 }}
        >
          Progen Labs is a nonprofit, completely open-source community building
          tools that solve real developer problems — free today and free
          forever. Starting with <strong>Spectra</strong>, a profiler that shows
          you exactly what makes your frontend slow.
        </motion.p>

        <motion.div
          className="hero-cta"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.28 }}
        >
          <a className="btn btn-primary" href="#spectra">
            Explore Spectra
          </a>
          <a
            className="btn btn-ghost"
            href={LINKS.github}
            target="_blank"
            rel="noreferrer"
          >
            View on GitHub ↗
          </a>
        </motion.div>
      </div>

      <motion.div
        className="scroll-hint"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
      >
        <span>scroll</span>
        <div className="scroll-line" />
      </motion.div>
    </header>
  );
}
