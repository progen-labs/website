export const LINKS = {
  github: 'https://github.com/progen-labs',
  spectraRepo: 'https://github.com/progen-labs/spectra',
  npm: 'https://www.npmjs.com/package/@progen-labs/spectra',
};

export const VALUES = [
  {
    key: 'nonprofit',
    title: 'Nonprofit',
    body: 'No investors, no growth targets, no dark patterns. Progen Labs exists to solve real developer problems — not to extract value from the people it serves.',
    glyph: 'heart',
  },
  {
    key: 'open',
    title: 'Completely open source',
    body: 'Every line ships in the open under permissive licenses. Read it, fork it, audit it, improve it. No telemetry, no accounts, no locked doors.',
    glyph: 'code',
  },
  {
    key: 'free',
    title: 'Always free',
    body: 'Free today and free forever. No paid tiers waiting to swallow the useful features, no “free for now.” Tools built for a community, given to it.',
    glyph: 'infinity',
  },
  {
    key: 'community',
    title: 'A community',
    body: 'Built by developers, for developers. Contributions, issues and ideas are the whole point — Progen Labs is only as good as the people around it.',
    glyph: 'people',
  },
];

export const SPECTRA_FEATURES = [
  {
    title: 'One command, zero config',
    body: 'Run spectra performance in your project. It detects your framework, starts your dev server, profiles it, and shuts it down — automatically.',
  },
  {
    title: 'Golden-path automation',
    body: 'Spectra discovers the actionable elements on your page, synthesizes real user journeys, drives them safely, and scores each one.',
  },
  {
    title: 'Per-component attribution',
    body: 'Chrome DevTools Protocol tracing plus a framework-aware probe pinpoints the exact file, function and component costing you time.',
  },
  {
    title: 'Proof, not guesses',
    body: 'Record a few runs before and after a change. spectra compare reports what got faster or slower, beyond run-to-run noise.',
  },
  {
    title: 'Budgets for CI',
    body: 'Set limits in spectra.config.json. A run over budget exits with code 2, so your pipeline catches a regression before your users do.',
  },
  {
    title: 'JSON for any tool',
    body: '--json prints a versioned, schema-described result: every finding with its file, line, cost and fix, ready for scripts, editors and AI agents.',
  },
  {
    title: 'A full visual dashboard',
    body: 'Culprit visualizations, React/Vue/Angular re-renders, long tasks, network and memory — plus PDF export and commit-to-commit compare.',
  },
  {
    title: 'Safe by default',
    body: 'Auto-exploration never submits destructive actions — delete, pay, logout and mutating form posts are detected and skipped unless allowlisted.',
  },
  {
    title: 'Multi-framework',
    body: 'Deep component-level metrics for React, Next.js, Vue and Angular. A source-mapped generic profile covers everything else.',
  },
];

export const FRAMEWORKS = [
  { name: 'React', depth: 'Deep' },
  { name: 'Next.js', depth: 'Deep' },
  { name: 'Vue', depth: 'Deep' },
  { name: 'Angular', depth: 'Deep' },
  { name: 'Svelte', depth: 'Generic' },
  { name: 'Any build', depth: 'Generic' },
];

export const USAGE = [
  {
    id: 'install',
    label: 'Install',
    lang: 'bash',
    code: `# add Spectra to your project as a dev dependency
npm install --save-dev @progen-labs/spectra`,
    note: 'Requires Node 18+ and a local Chrome / Chromium / Edge (Spectra drives your installed browser — it never downloads one).',
  },
  {
    id: 'profile',
    label: 'Profile',
    lang: 'bash',
    code: `# from the root of your project — no URL, no config
npx spectra performance`,
    note: 'Spectra self-boots your dev server, records a baseline load, runs golden-path journeys, and prints a performance matrix.',
  },
  {
    id: 'verify',
    label: 'Verify a fix',
    lang: 'bash',
    code: `# the median of 5 page loads, before and after your change
npx spectra performance --quick --runs 5 --out before.json
npx spectra performance --quick --runs 5 --out after.json
npx spectra compare before.json after.json`,
    note: 'Each side is reduced to its median, and a change only counts when it is bigger than the run-to-run noise.',
  },
  {
    id: 'budgets',
    label: 'Budgets & CI',
    lang: 'bash',
    code: `# spectra.config.json: { "budgets": { "tbtMs": 200, "lcpMs": 2500, "criticalFindings": 0 } }
npx spectra performance --quick --runs 3 --json > spectra-result.json`,
    note: 'A run over budget exits with code 2, so CI fails the build. --json prints a versioned result for scripts, editors and agents.',
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    lang: 'bash',
    code: `# open the full visual dashboard
npx spectra dashboard`,
    note: 'Ranked culprits, component re-renders, long tasks, the golden-path matrix, PDF export and commit compare — no dev toolchain required.',
  },
  {
    id: 'ci',
    label: 'Options',
    lang: 'bash',
    code: `# evaluate an already-running server
npx spectra performance --url http://localhost:3000/

# cap the golden-path suite, or profile a single page load
npx spectra performance --paths 8
npx spectra performance --quick

# list saved reports, to compare or open them
npx spectra reports`,
    note: 'Reports land in .spectra/reports in your project — open any of them in the dashboard.',
  },
];

export const MATRIX = [
  { path: 'Initial page load', result: 'PASS', top: 'main chunk served uncompressed' },
  { path: 'Click "Pricing"', result: 'PASS', top: 'Large DOM: 2,139 nodes' },
  {
    path: 'Click "Folders"',
    result: 'PASS',
    top: 'TreeNode re-rendered 1100× (96% wasted)',
    critical: true,
  },
  { path: 'Fill & submit "Search"', result: 'PASS', top: '—' },
];
