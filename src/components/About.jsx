import { motion } from 'framer-motion';
import Reveal from './Reveal.jsx';
import { Glyph } from './Icons.jsx';
import { VALUES } from '../data.js';

export default function About() {
  return (
    <section className="section" id="about">
      <div className="container">
        <Reveal>
          <p className="kicker">What is Progen Labs</p>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="section-title">
            A nonprofit building developer tools, out in the open.
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="section-lead">
            Progen Labs is a community, not a company. We build genuinely useful
            tools for the real problems developers hit every day, release every
            line as open source, and keep it free forever. No investors, no
            upsells, no telemetry — just software made to be shared.
          </p>
        </Reveal>

        <div className="value-grid">
          {VALUES.map((v, i) => (
            <motion.article
              key={v.key}
              className="value-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
              whileHover={{ y: -6 }}
            >
              <span className="value-icon">
                <Glyph name={v.glyph} />
              </span>
              <h3>{v.title}</h3>
              <p>{v.body}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
