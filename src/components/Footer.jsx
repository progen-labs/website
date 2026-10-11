import Reveal from './Reveal.jsx';
import { Logo } from './Icons.jsx';
import { LINKS } from '../data.js';

export default function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="container">
        <Reveal>
          <div className="footer-cta">
            <h2>
              Build with us. <span className="grad-text">It’s all open.</span>
            </h2>
            <p>
              Progen Labs lives on contributions and ideas. Star a repo, open an
              issue, send a pull request — or just use the tools and tell us what
              hurts.
            </p>
            <div className="footer-buttons">
              <a className="btn btn-primary" href={LINKS.github} target="_blank" rel="noreferrer">
                Progen Labs on GitHub ↗
              </a>
              <a className="btn btn-ghost" href={LINKS.spectraRepo} target="_blank" rel="noreferrer">
                Contribute to Spectra ↗
              </a>
            </div>
          </div>
        </Reveal>

        <div className="footer-bar">
          <div className="footer-brand">
            <Logo size={20} />
            <span>Progen Labs</span>
          </div>
          <div className="footer-meta">
            <span>Nonprofit · Open source · Always free</span>
            <span className="footer-dim">MIT licensed · © {new Date().getFullYear()} Progen Labs</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
