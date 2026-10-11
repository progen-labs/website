import { motion } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1];

/** Fade + rise into view once, with an optional stagger delay. */
export default function Reveal({ children, delay = 0, y = 26, className }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, ease, delay }}
    >
      {children}
    </motion.div>
  );
}
