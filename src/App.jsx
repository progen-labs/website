import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Landing, { PROJECTS } from './landing/Landing.jsx';
import SpectraWorld from './components/SpectraWorld.jsx';
import InternalsExplorer from './internals/InternalsExplorer.jsx';

const DESTINATIONS = ['spectra', 'core'];
const fromHash = () => {
  const h = typeof window !== 'undefined' ? window.location.hash.slice(1) : '';
  return DESTINATIONS.includes(h) ? h : null;
};
const reducedMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export default function App() {
  // home → entering (camera flies to the project) → spectra | core
  const [phase, setPhase] = useState(() => fromHash() || 'home');
  const [target, setTarget] = useState(null);
  const timer = useRef(null);

  const open = useCallback(id => {
    setPhase(id);
    if (window.location.hash !== `#${id}`) window.history.pushState(null, '', `#${id}`);
  }, []);

  const enter = useCallback(
    id => {
      if (phase !== 'home' || !DESTINATIONS.includes(id)) return;
      setTarget(id);
      setPhase('entering');
      clearTimeout(timer.current);
      timer.current = setTimeout(() => open(id), reducedMotion() ? 150 : 1500);
    },
    [phase, open],
  );

  const back = useCallback(() => {
    setPhase('home');
    setTarget(null);
    if (window.location.hash) window.history.pushState(null, '', window.location.pathname + window.location.search);
  }, []);

  // keep the back/forward buttons and shared links (#spectra, #core) working
  useEffect(() => {
    const onPop = () => {
      const h = fromHash();
      setPhase(h || 'home');
      setTarget(null);
    };
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      clearTimeout(timer.current);
    };
  }, []);

  const flashColor = PROJECTS.find(p => p.id === target)?.color || '#8fdcff';

  return (
    <>
      {(phase === 'home' || phase === 'entering') && <Landing onEnter={enter} entering={phase === 'entering' ? target : null} />}

      <AnimatePresence>
        {phase === 'entering' && (
          <motion.div
            className="ld-flash"
            style={{ '--flash': flashColor }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, times: [0, 0.55, 1], ease: 'easeIn' }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'spectra' && <SpectraWorld key="spectra" onBack={back} />}
        {phase === 'core' && <InternalsExplorer key="core" onBack={back} />}
      </AnimatePresence>
    </>
  );
}
