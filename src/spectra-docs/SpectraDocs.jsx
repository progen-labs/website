// The Spectra documentation browser: grouped navigation (a menu on phones),
// search across every page, the page itself, and previous / next links. The
// current page lives in the URL (#spectra/docs/<id>), so pages can be shared.
import { useMemo, useState } from 'react';
import Markdown from './Markdown.jsx';
import { DOC_GROUPS, DOC_PAGES, docById } from './index.js';
import './docs.css';

const EDIT_BASE = 'https://github.com/progen-labs/website/blob/main/src/spectra-docs/pages';

const plain = md =>
  md
    .replace(/```\w*/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[`*#>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

function search(query) {
  const needle = query.trim().toLowerCase();
  return DOC_PAGES.map(page => {
    const inTitle = page.title.toLowerCase().includes(needle);
    const text = plain(page.body);
    const at = text.toLowerCase().indexOf(needle);
    if (!inTitle && at === -1) return null;
    // about a line either side of the match, trimmed to whole words
    let from = Math.max(0, at - 60);
    if (from > 0) from = text.indexOf(' ', from) + 1;
    const snippet = at === -1 ? '' : `${from > 0 ? '…' : ''}${text.slice(from, at + needle.length + 80).replace(/\s\S*$/, '')}…`;
    return { page, inTitle, snippet };
  })
    .filter(Boolean)
    .sort((a, b) => Number(b.inTitle) - Number(a.inTitle));
}

function PageLink({ page, current, onGo, className, children }) {
  return (
    <a
      className={className}
      href={`#spectra/docs/${page.id}`}
      aria-current={current ? 'page' : undefined}
      onClick={e => {
        e.preventDefault();
        onGo(page.id);
      }}
    >
      {children}
    </a>
  );
}

export default function SpectraDocs({ page, onNavigate, titleRef }) {
  const [query, setQuery] = useState('');
  const current = docById(page) || DOC_PAGES[0];
  const index = DOC_PAGES.findIndex(p => p.id === current.id);
  const prev = DOC_PAGES[index - 1];
  const next = DOC_PAGES[index + 1];
  const results = useMemo(() => (query.trim().length > 1 ? search(query) : null), [query]);
  const go = id => {
    setQuery('');
    onNavigate(id);
  };

  return (
    <div className="docs">
      <div className="docs-side">
        <div className="docs-search">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4.5 4.5" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search the docs"
            aria-label="Search the documentation"
          />
        </div>
        <p className="sr-only" role="status">
          {results ? `${results.length} ${results.length === 1 ? 'page matches' : 'pages match'}` : ''}
        </p>

        {results ? (
          <ul className="docs-results">
            {results.map(r => (
              <li key={r.page.id}>
                <PageLink page={r.page} onGo={go}>
                  <span className="docs-result-title">{r.page.title}</span>
                  <span className="docs-result-group">{r.page.group}</span>
                  {r.snippet && <span className="docs-result-snippet">{r.snippet}</span>}
                </PageLink>
              </li>
            ))}
            {!results.length && <li className="docs-empty">No page mentions “{query.trim()}”.</li>}
          </ul>
        ) : (
          <>
            <nav className="docs-nav" aria-label="Documentation pages">
              {DOC_GROUPS.map(g => (
                <div key={g.title} className="docs-group">
                  <p className="docs-group-title">{g.title}</p>
                  <ul>
                    {g.pages.map(p => (
                      <li key={p.id}>
                        <PageLink page={p} current={p.id === current.id} onGo={go}>
                          {p.title}
                        </PageLink>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
            <label className="docs-picker">
              <span>Page</span>
              <select value={current.id} onChange={e => go(e.target.value)}>
                {DOC_GROUPS.map(g => (
                  <optgroup key={g.title} label={g.title}>
                    {g.pages.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
          </>
        )}
      </div>

      <article className="docs-page" aria-labelledby="docs-title">
        <p className="docs-kicker">{current.group}</p>
        <h3 id="docs-title" className="docs-title" ref={titleRef} tabIndex={-1}>
          {current.title}
        </h3>
        <Markdown source={current.body} onNavigate={go} />

        <nav className="docs-pager" aria-label="Previous and next page">
          {prev ? (
            <PageLink page={prev} onGo={go} className="docs-pager-link">
              <span className="docs-pager-dir">← Previous</span>
              <span className="docs-pager-title">{prev.title}</span>
            </PageLink>
          ) : (
            <span />
          )}
          {next && (
            <PageLink page={next} onGo={go} className="docs-pager-link is-next">
              <span className="docs-pager-dir">Next →</span>
              <span className="docs-pager-title">{next.title}</span>
            </PageLink>
          )}
        </nav>
        <p className="docs-edit">
          <a href={`${EDIT_BASE}/${current.id}.md`} target="_blank" rel="noreferrer">
            Edit this page on GitHub
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </p>
      </article>
    </div>
  );
}
