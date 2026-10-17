// "What's new": Spectra's latest releases, newest first, read straight from the
// documentation's changelog, so the two can never disagree. Each "## <release>
// (<date>)" heading in changelog.md becomes an entry: its tag, its date, a
// one-line summary and the highlights of its bullet list.
import { motion } from 'framer-motion';
import changelog from '../spectra-docs/pages/changelog.md?raw';

// markdown to plain text; inline code keeps its backticks unless `code` is false
const plain = (md, code = true) => {
  const text = md
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links → their text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .trim();
  return code ? text : text.replace(/`([^`]+)`/g, '$1');
};
// text with `inline code`, as React nodes
const Inline = ({ text }) => text.split(/`([^`]+)`/).map((part, i) => (i % 2 ? <code key={i}>{part}</code> : part));
const firstSentences = (text, max = 230) => {
  if (text.length <= max) return text.replace(/:$/, '.');
  const cut = text.slice(0, max);
  const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf(': '));
  return end > 60 ? cut.slice(0, end + 1).replace(/:$/, '.') : `${cut.slice(0, cut.lastIndexOf(' '))} …`;
};

/** The changelog as entries: { name, date, kind, summary, highlights }. */
export function releases(md = changelog) {
  return md
    .split(/^## /m)
    .slice(1)
    .map(section => {
      const [heading, ...rest] = section.split('\n');
      const m = heading.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
      const name = (m ? m[1] : heading).trim();
      const date = m ? m[2] : '';
      const lines = rest.map(l => l.trim()).filter(Boolean);
      const bullets = lines.filter(l => l.startsWith('- '));
      const paragraph = lines.find(l => !l.startsWith('- ')) || '';
      // a bullet's lead is its bold opening ("**`spectra mcp`**: …"); otherwise the bullet itself
      const lead = b => {
        const bold = b.match(/^- \*\*(.+?)\*\*/);
        return plain(bold ? bold[1] : b.slice(2), false).replace(/[.:]$/, '');
      };
      // the first lines, without the cross-references ("See Compare.") that only make sense in the docs
      const summary = firstSentences(plain(paragraph || (bullets[0] ? bullets[0].slice(2) : '')).replace(/\s*See [^.]+\.\s*$/, ''));
      const highlights = paragraph ? bullets.slice(0, 4).map(lead) : bullets.slice(1, 4).map(lead);
      const kind = /^GitHub Action/.test(name) ? 'CI' : /^VS Code/.test(name) ? 'Editor' : /^\d/.test(name) ? 'npm' : 'Release';
      const title = /^\d/.test(name) ? `Spectra ${name}` : name;
      // the tag names the product and its version: v0.4.1, action v1, vscode 0.1.0
      const version = (name.match(/v?\d+(\.\d+)*$/) || [''])[0];
      const tag = kind === 'npm' ? `v${name}` : kind === 'CI' ? `action ${version}` : kind === 'Editor' ? `vscode ${version}` : name;
      return { name, title, date, kind, tag, summary, highlights: highlights.filter(h => h.length < 60) };
    });
}

export default function WhatsNew({ onDoc, limit = 5 }) {
  const list = releases().slice(0, limit);
  return (
    <div className="whats-new">
      <ol className="release-list">
        {list.map((r, i) => (
          <motion.li
            key={r.name}
            className="release"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.05 }}
          >
            <div className="release-when">
              <span className={`release-tag kind-${r.kind.toLowerCase()}`}>{r.tag}</span>
              <time>{r.date}</time>
            </div>
            <div className="release-what">
              <h3>{r.title}{i === 0 && <span className="release-latest">Latest</span>}</h3>
              <p>
                <Inline text={r.summary} />
              </p>
              {r.highlights.length > 0 && (
                <ul className="release-highlights">
                  {r.highlights.map(h => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          </motion.li>
        ))}
      </ol>
      <a
        className="feature-link"
        href="#spectra/docs/changelog"
        onClick={e => {
          e.preventDefault();
          onDoc('changelog');
        }}
      >
        The full changelog →
      </a>
    </div>
  );
}
