import { AnimatePresence, motion } from 'framer-motion';
import { Logo } from './Icons.jsx';

/** On-screen UI for the explore phase: title, controls, and the gate prompt. */
export default function Hud({ phase, nearSpectra }) {
  const show = phase === 'explore';
  return (
    <div className="hud">
      <div className="hud-top">
        <div className="hud-brand">
          <Logo size={22} />
          <div>
            <strong>PROGEN LABS</strong>
            <span>a 3D world · nonprofit · open source · always free</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {show && !nearSpectra && (
          <motion.div
            className="hud-controls"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
          >
            <div className="keys">
              <span className="key">W</span>
              <span className="key">A</span>
              <span className="key">S</span>
              <span className="key">D</span>
              <em>/ arrow keys to move</em>
            </div>
            <p>Explore the world and find the glowing project gates.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {show && nearSpectra && (
          <motion.div
            className="hud-prompt"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="prompt-label">SPECTRA — frontend performance profiler</span>
            <span className="prompt-key">
              Press <kbd>Enter</kbd> to open the gate
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
