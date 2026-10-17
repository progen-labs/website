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
    title: 'One command',
    body: 'Run spectra performance. It starts your dev server, profiles the app, and shuts the server down again.',
  },
  {
    title: 'Real user journeys',
    body: 'Finds the buttons, links and forms on your page and drives safe golden-path journeys through them.',
  },
  {
    title: 'The exact culprit',
    body: 'Every finding names the function, file and line responsible, with the evidence and a suggested fix.',
  },
  {
    title: 'Component insight',
    body: 'Render counts, render time and wasted renders for React, Next.js, Vue and Angular components.',
  },
  {
    title: 'Proof, not guesses',
    body: 'spectra compare shows what changed between two sets of runs, and ignores run-to-run noise.',
  },
  {
    title: 'Budgets that hold',
    body: 'Set limits in spectra.config.json. Any run over budget fails with exit code 2.',
  },
  {
    title: 'Pull request checks',
    body: 'The GitHub Action profiles each pull request against its base commit and posts the verdict.',
  },
  {
    title: 'AI that verifies',
    body: 'An MCP server and a Claude Code plugin let your assistant fix one finding, then prove it helped.',
  },
  {
    title: 'In your editor',
    body: 'The VS Code extension shows each finding at its line and render counts above your components.',
  },
  {
    title: 'Visual dashboard',
    body: 'Culprits, a page map, the call tree, long tasks, commit comparisons and PDF reports.',
  },
  {
    title: 'JSON for any tool',
    body: 'A versioned, schema-described result for scripts, dashboards and AI agents.',
  },
  {
    title: 'Safe by default',
    body: 'Never clicks delete, pay or log out, and never submits a form that changes data.',
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
    code: `# add Spectra to your project
npm install --save-dev @progen-labs/spectra`,
    note: 'Needs Node.js 18 or newer and Chrome, Chromium or Edge. Spectra drives the browser you already have.',
  },
  {
    id: 'profile',
    label: 'Profile',
    lang: 'bash',
    code: `# from your project root: starts the dev server and runs the user journeys
npx spectra performance

# the fast loop: one page, three loads, medians
npx spectra performance --quick --runs 3`,
    note: 'Every run is saved in .spectra/reports. Open the reports with npx spectra dashboard.',
  },
  {
    id: 'verify',
    label: 'Verify a fix',
    lang: 'bash',
    code: `# five page loads before and after your change, then compare
npx spectra performance --quick --runs 5 --out before.json
npx spectra performance --quick --runs 5 --out after.json
npx spectra compare before.json after.json`,
    note: 'Each side is reduced to its median, and a change counts only when it is bigger than the noise between runs.',
  },
  {
    id: 'ci',
    label: 'Pull requests',
    lang: 'yaml',
    code: `# .github/workflows/performance.yml (steps)
- uses: actions/checkout@v4
- run: npm ci
- uses: progen-labs/spectra@v1
  with:
    compare-to-base: true
    comment: true`,
    note: 'Profiles the pull request and its base commit on the same runner, enforces your budgets, and comments the verdict.',
  },
  {
    id: 'ai',
    label: 'AI assistant',
    lang: 'bash',
    code: `# in Claude Code
/plugin marketplace add progen-labs/spectra
/plugin install spectra@progen-labs`,
    note: 'Then ask Claude to "make the dashboard page faster". It keeps a change only when Spectra measures an improvement. Other MCP clients run npx -y @progen-labs/spectra mcp. Requires Spectra 0.3.0.',
  },
  {
    id: 'vscode',
    label: 'VS Code',
    lang: 'bash',
    code: `# build and install the extension from the Spectra repository
cd spectra/vscode
npx @vscode/vsce package --no-dependencies
code --install-extension spectra-0.1.0.vsix`,
    note: 'Then run "Spectra: Profile page load" from the Command Palette. Marketplace and Open VSX listings are on the way.',
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    lang: 'bash',
    code: `# open the visual dashboard
npx spectra dashboard --open`,
    note: 'Culprits, a page map, the call tree, long tasks, commit comparisons and PDF reports. Everything stays on your machine.',
  },
];

export const MATRIX = [
  { path: 'Initial page load', result: 'PASS', top: 'Row is slow to render: 1,443 ms', critical: true },
  { path: 'Click "Long task"', result: 'PASS', top: 'src/heavy.js spent 606 ms of JavaScript', critical: true },
  { path: 'Click "Layout thrash"', result: 'PASS', top: 'Row is slow to render: 336 ms', critical: true },
  { path: 'Click "Layout shift"', result: 'PASS', top: 'Row is slow to render: 336 ms', critical: true },
];
