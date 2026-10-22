// The Spectra changelog page comes from Spectra's own CHANGELOG.md, so the two
// never disagree. Before each build it is fetched from GitHub and its links to
// these docs become doc:<id> links; offline, the copy in the repository stays.
//   node scripts/changelog.mjs   (runs as npm's prebuild)
import fs from 'node:fs';

const SOURCE = 'https://raw.githubusercontent.com/progen-labs/spectra/main/CHANGELOG.md';
const PAGE = new URL('../src/spectra-docs/pages/changelog.md', import.meta.url);

try {
  const res = await fetch(SOURCE, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  // from the install line on: the title and the intro are the repository's
  const start = text.search(/^Update an existing install/m);
  if (start < 0 || !/^## /m.test(text)) throw new Error('unexpected CHANGELOG.md layout');
  const page = `${text
    .slice(start)
    .replace(/\]\(https:\/\/progen-labs\.github\.io\/website\/#spectra\/docs\/([\w-]+)\)/g, '](doc:$1)')
    .trimEnd()}\n`;
  const before = fs.readFileSync(PAGE, 'utf8');
  if (page !== before) {
    fs.writeFileSync(PAGE, page);
    console.log('changelog: updated from Spectra’s CHANGELOG.md');
  } else console.log('changelog: up to date');
} catch (err) {
  console.warn(`changelog: kept the copy in the repository (${err.message})`);
}
