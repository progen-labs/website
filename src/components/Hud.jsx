import { AnimatePresence, motion } from 'framer-motion';
import { Logo } from './Icons.jsx';

const spring = { type: 'spring', stiffness: 400, damping: 22 };

const GATE_LABELS = {
  spectra: 'SPECTRA · performance profiler',
  funzone: 'THE CORE · browser & react internals',
};

export default function Hud({ phase, nearGate, muted, onMute, touch, onAction }) {
  const show = phase === 'explore';

  return (
    <div className="hud">
      {/* top bar */}
      <div className="hud-top">
        <motion.div className="hud-brand panel" initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={spring}>
          <Logo size={22} />
          <div>
            <strong>PROGEN LABS</strong>
            <span>a 3D world</span>
          </div>
        </motion.div>

        <div className="hud-top-right">
          <motion.button className="icon-btn panel" onClick={onMute} initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...spring, delay: 0.1 }} whileTap={{ scale: 0.88 }} aria-label="Toggle sound">
            {muted ? '🔇' : '🔊'}
          </motion.button>
        </div>
      </div>

      {/* controls hint */}
      <AnimatePresence>
        {show && !nearGate && (
          <motion.div className="hud-controls panel" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}>
            {touch ? (
              <p>
                <b>Drag</b> to move · roam the realm and step into a glowing <b>gate</b> to enter its world.
              </p>
            ) : (
              <div className="keys-row">
                <span className="keycap">W</span>
                <span className="keycap">A</span>
                <span className="keycap">S</span>
                <span className="keycap">D</span>
                <em>roam the realm · step into a glowing gate to enter its world</em>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* gate prompt */}
      <AnimatePresence>
        {show && nearGate && (
          <motion.div
            className="hud-prompt panel"
            initial={{ opacity: 0, scale: 0.8, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 24 }}
            transition={spring}
          >
            <span className="prompt-label">{GATE_LABELS[nearGate]}</span>
            <span className="prompt-key">
              {touch ? 'Tap the button to open the gate' : <>Press <kbd>Enter</kbd> to open the gate</>}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* mobile action button */}
      {touch && show && (
        <motion.button
          className={`action-btn ${nearGate ? 'ready' : ''}`}
          onClick={onAction}
          whileTap={{ scale: 0.86 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={spring}
        >
          <span>{nearGate ? 'ENTER' : '◎'}</span>
        </motion.button>
      )}

    </div>
  );
}
