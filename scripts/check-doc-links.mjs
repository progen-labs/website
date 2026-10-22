// Every doc:<id> link in the Spectra docs, and every `doc:` the site's data
// points at, must be a page in src/spectra-docs/index.js. Exits 1 and names
// each broken one (file and line) otherwise. Run by the Checks workflow.
import fs from 'node:fs';

const root = new URL('../src/', import.meta.url);
const index = fs.readFileSync(new URL('spectra-docs/index.js', root), 'utf8');
const ids = new Set([...index.matchAll(/\bid: '([\w-]+)'/g)].map(m => m[1]));
const broken = [];
const scan = (file, pattern) => {
  const text = fs.readFileSync(new URL(file, root), 'utf8');
  text.split('\n').forEach((line, i) => {
    for (const m of line.matchAll(pattern)) if (!ids.has(m[1])) broken.push(`src/${file}:${i + 1}: no page "${m[1]}"`);
  });
};
for (const f of fs.readdirSync(new URL('spectra-docs/pages/', root)).filter(f => f.endsWith('.md'))) scan(`spectra-docs/pages/${f}`, /\(doc:([\w-]+)\)/g);
scan('data.js', /\bdoc: '([\w-]+)'/g);

if (broken.length) {
  for (const b of broken) console.log(`::error file=${b.split(':')[0]},line=${b.split(':')[1]}::${b}`);
  console.error(`${broken.length} broken doc: link${broken.length === 1 ? '' : 's'}.`);
  process.exit(1);
}
console.log(`Every doc: link points at one of the ${ids.size} pages.`);
