// A small, safe Markdown renderer for the Spectra docs. It builds React
// elements (never HTML strings), and supports exactly the subset the docs use:
//
//   ## heading, ### subheading       paragraphs
//   - and 1. lists (one nested level, continuation lines indented)
//   ```lang fences (copy button for bash/js/json)    | tables |
//   > notes                          `code`, **bold**, *italic*, [links](url)
//   ```screenshot <name>  an annotated screenshot (see Screenshot.jsx)
//   ```video <name>       a demo video; the body is its caption (see Video.jsx)
//
// A link to `doc:<page-id>` opens another page of the docs.
import { CopyButton, commandsOf } from '../components/CopyButton.jsx';
import Screenshot, { parseScreenshot } from './Screenshot.jsx';
import Video, { parseVideo } from './Video.jsx';

const INLINE = String.raw`(\x60[^\x60]+\x60)|(\[[^\]]+\]\([^)\s]+\))|(\*\*[^*]+?\*\*)|(\*[^*\s][^*]*?\*)`;
const COPYABLE = new Set(['bash', 'sh', 'js', 'json', 'yaml']);

function Inline({ text, onNavigate }) {
  const re = new RegExp(INLINE, 'g');
  const out = [];
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const [token] = m;
    const key = out.length;
    if (m[1]) out.push(<code key={key}>{token.slice(1, -1)}</code>);
    else if (m[2]) {
      const [, label, href] = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(token);
      out.push(<DocLink key={key} href={href} label={label} onNavigate={onNavigate} />);
    } else if (m[3])
      out.push(
        <strong key={key}>
          <Inline text={token.slice(2, -2)} onNavigate={onNavigate} />
        </strong>,
      );
    else
      out.push(
        <em key={key}>
          <Inline text={token.slice(1, -1)} onNavigate={onNavigate} />
        </em>,
      );
    last = m.index + token.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function DocLink({ href, label, onNavigate }) {
  const body = <Inline text={label} onNavigate={onNavigate} />;
  if (href.startsWith('doc:')) {
    const id = href.slice(4);
    return (
      <a
        href={`#spectra/docs/${id}`}
        onClick={e => {
          e.preventDefault();
          onNavigate(id);
        }}
      >
        {body}
      </a>
    );
  }
  // the site navigates by URL hash, so an in-page #anchor would leave the docs
  if (href.startsWith('#')) return <span>{body}</span>;
  if (/^https?:\/\//.test(href))
    return (
      <a href={href} target="_blank" rel="noreferrer">
        {body}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  return <a href={href}>{body}</a>;
}

// ------------------------------------------------------------------ blocks

const FENCE = /^```([\w-]*)(?:\s+(\S.*))?$/;
const HEADING = /^(#{2,3})\s+(.*)$/;
const ITEM = /^([-*]|\d+\.)\s+(.*)$/;
const NESTED = /^\s{2,}([-*]|\d+\.)\s+(.*)$/;
const isBlockStart = l => FENCE.test(l) || HEADING.test(l) || l.startsWith('|') || l.startsWith('>') || ITEM.test(l);

function parseList(lines, i) {
  const ordered = /^\d/.test(lines[i]);
  const start = ordered ? parseInt(lines[i], 10) : undefined;
  const items = [];
  while (i < lines.length) {
    const l = lines[i];
    const top = ITEM.exec(l);
    const nested = NESTED.exec(l);
    if (top) items.push({ text: top[2], children: [], childOrdered: false });
    else if (nested && items.length) {
      const item = items[items.length - 1];
      if (!item.children.length) item.childOrdered = /^\d/.test(nested[1]);
      item.children.push(nested[2]);
    } else if (/^\s{2,}\S/.test(l) && items.length) {
      const item = items[items.length - 1];
      if (item.children.length) item.children[item.children.length - 1] += ` ${l.trim()}`;
      else item.text += ` ${l.trim()}`;
    } else if (!l.trim()) {
      // a blank line ends the list unless another item follows
      const next = lines[i + 1] || '';
      if (!(ITEM.test(next) || NESTED.test(next))) break;
    } else break;
    i++;
  }
  return [{ type: 'list', ordered, start, items }, i];
}

export function parse(source) {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    const fence = FENCE.exec(line);
    if (fence) {
      const body = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) body.push(lines[i++]);
      i++;
      blocks.push({ type: 'code', lang: fence[1], arg: fence[2], text: body.join('\n') });
      continue;
    }
    const heading = HEADING.exec(line);
    if (heading) {
      blocks.push({ type: 'heading', level: heading[1].length, text: heading[2] });
      i++;
      continue;
    }
    if (line.startsWith('|')) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith('|')) rows.push(lines[i++]);
      blocks.push({ type: 'table', rows });
      continue;
    }
    if (line.startsWith('>')) {
      const body = [];
      while (i < lines.length && lines[i].startsWith('>')) body.push(lines[i++].replace(/^>\s?/, ''));
      blocks.push({ type: 'note', text: body.join(' ') });
      continue;
    }
    if (ITEM.test(line)) {
      const [block, next] = parseList(lines, i);
      blocks.push(block);
      i = next;
      continue;
    }
    const body = [];
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) body.push(lines[i++].trim());
    blocks.push({ type: 'p', text: body.join(' ') });
  }
  return blocks;
}

// cells split on unescaped pipes; `\|` stands for a literal pipe
const cellsOf = row =>
  row
    .trim()
    .replace(/^\||\|$/g, '')
    .split(/(?<!\\)\|/)
    .map(c => c.trim().replace(/\\\|/g, '|'));

function Table({ rows, onNavigate }) {
  const [head, , ...body] = rows.map(cellsOf);
  return (
    <div className="md-table" role="region" aria-label="Table" tabIndex={0}>
      <table>
        <thead>
          <tr>
            {head.map((c, i) => (
              <th key={i} scope="col">
                <Inline text={c} onNavigate={onNavigate} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j}>
                  <Inline text={c} onNavigate={onNavigate} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CodeBlock({ lang, text }) {
  const comment = lang === 'bash' || lang === 'sh' || lang === 'yaml' ? /^\s*#/ : lang === 'js' ? /^\s*\/\// : null;
  const copyable = COPYABLE.has(lang);
  return (
    <div className={`md-code ${copyable ? '' : 'is-output'}`}>
      {/* the language and Copy sit in a bar above the code, so a long line never runs under them */}
      {(lang || copyable) && (
        <div className="md-code-bar">
          <span className="md-code-lang">{lang}</span>
          {copyable && (
            <CopyButton
              text={lang === 'bash' || lang === 'sh' ? commandsOf(text) : text}
              label={lang === 'bash' || lang === 'sh' ? 'Copy the commands' : 'Copy the code'}
            />
          )}
        </div>
      )}
      <pre>
        <code>
          {text.split('\n').map((line, i) => (
            <span key={i} className={comment && comment.test(line) ? 'code-comment' : undefined}>
              {line}
              {'\n'}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

function List({ ordered, start, items, onNavigate }) {
  const Tag = ordered ? 'ol' : 'ul';
  return (
    <Tag start={start !== 1 ? start : undefined}>
      {items.map((item, i) => {
        const Child = item.childOrdered ? 'ol' : 'ul';
        return (
          <li key={i}>
            <Inline text={item.text} onNavigate={onNavigate} />
            {item.children.length > 0 && (
              <Child>
                {item.children.map((c, j) => (
                  <li key={j}>
                    <Inline text={c} onNavigate={onNavigate} />
                  </li>
                ))}
              </Child>
            )}
          </li>
        );
      })}
    </Tag>
  );
}

/** `##` renders as <h4> and `###` as <h5>: the page title above is the <h3>. */
export default function Markdown({ source, onNavigate }) {
  return (
    <div className="md">
      {parse(source).map((b, i) => {
        if (b.type === 'heading') {
          const H = b.level === 2 ? 'h4' : 'h5';
          return (
            <H key={i}>
              <Inline text={b.text} onNavigate={onNavigate} />
            </H>
          );
        }
        if (b.type === 'code' && b.lang === 'screenshot')
          return (
            <Screenshot
              key={i}
              {...parseScreenshot(b.arg, b.text)}
              renderText={text => <Inline text={text} onNavigate={onNavigate} />}
            />
          );
        if (b.type === 'code' && b.lang === 'video') return <Video key={i} {...parseVideo(b.arg, b.text)} />;
        if (b.type === 'code') return <CodeBlock key={i} lang={b.lang} text={b.text} />;
        if (b.type === 'table') return <Table key={i} rows={b.rows} onNavigate={onNavigate} />;
        if (b.type === 'list') return <List key={i} {...b} onNavigate={onNavigate} />;
        if (b.type === 'note')
          return (
            <aside key={i} className="md-note">
              <Inline text={b.text} onNavigate={onNavigate} />
            </aside>
          );
        return (
          <p key={i}>
            <Inline text={b.text} onNavigate={onNavigate} />
          </p>
        );
      })}
    </div>
  );
}
