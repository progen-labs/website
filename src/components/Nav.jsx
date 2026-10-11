import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Logo } from './Icons.jsx';
import { LINKS } from '../data.js';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      className={`nav ${scrolled ? 'nav-scrolled' : ''}`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <a className="nav-brand" href="#top" aria-label="Progen Labs home">
        <Logo size={24} />
        <span>Progen Labs</span>
      </a>
      <div className="nav-links">
        <a href="#about">About</a>
        <a href="#spectra">Spectra</a>
        <a href="#usage">Usage</a>
        <a className="nav-cta" href={LINKS.github} target="_blank" rel="noreferrer">
          GitHub ↗
        </a>
      </div>
    </motion.nav>
  );
}
