export const LINKS = {
  github: 'https://github.com/progen-labs',
  spectraRepo: 'https://github.com/progen-labs/spectra',
  npm: 'https://www.npmjs.com/package/@progen-labs/spectra',
};

export const VALUES = [
  {
    key: 'independent',
    title: 'Independent',
    body: 'No investors, no growth targets, no dark patterns. Progen Labs is maintained by one developer to ship useful tools for everyone — not to extract value from the people it serves.',
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

// What Spectra does, in four groups. Each capability has a 3D loop (media,
// from Spectra's video/ project) and the docs page that explains it.
export const SPECTRA_PILLARS = [
  {
    id: 'find',
    title: 'Find',
    line: 'what makes your app slow',
    features: [
      { title: 'One command', media: 'one-command', doc: 'quick-start', body: 'Run spectra performance. It starts your dev server, profiles the app, and shuts the server down again.' },
      { title: 'Real user journeys', media: 'journeys', doc: 'golden-paths', body: 'Finds the buttons, links and forms on your page and drives safe golden-path journeys through them.' },
      { title: 'The exact culprit', media: 'culprit', doc: 'culprits', body: 'Every finding names the function, file and line responsible, with the evidence and a suggested fix.' },
      { title: 'Component insight', media: 'components', doc: 'frameworks', body: 'Render counts, render time and wasted renders for React, Next.js, Vue and Angular components.' },
    ],
  },
  {
    id: 'prove',
    title: 'Prove',
    line: 'that a change really helped',
    features: [
      { title: 'Compare two commits', media: 'compare', doc: 'compare-commits', body: 'In the dashboard, put the runs of two commits side by side and see what improved, file by file. Export it as a PDF summary or a detailed report.' },
      { title: 'Proof, not guesses', media: 'proof', doc: 'compare', body: 'spectra compare shows what changed between two sets of runs, beyond run-to-run noise.' },
      { title: 'Budgets that hold', media: 'budgets', doc: 'budgets', body: 'Set limits in spectra.config.json. Any run over budget fails with exit code 2.' },
      { title: 'Pull request checks', media: 'pull-requests', doc: 'github-action', body: 'The GitHub Action profiles each pull request against its base commit and posts the verdict.' },
    ],
  },
  {
    id: 'fix',
    title: 'Fix',
    line: 'with your AI agent, measured',
    features: [
      { title: 'Ask your agent to improve it', media: 'fix', doc: 'improve', badge: 'New in 0.7', body: 'spectra improve: Spectra measures and names the problem, your AI agent changes the code, Spectra measures again and keeps only what helped. Or unattended, with a coding agent on your machine, on a branch.' },
      { title: 'Any AI agent', media: 'ai', doc: 'agents', body: 'Spectra teaches your AI agent (Claude Code, GitHub Copilot, Cursor, Codex, Gemini and more) what it does, so you ask in plain words. An MCP server and a Claude Code plugin give it the same loop as tools.' },
      { title: 'In your editor', media: 'editor', doc: 'vscode', body: 'The VS Code extension shows each finding at its line and render counts above your components.' },
    ],
  },
  {
    id: 'fit',
    title: 'Fit in',
    line: 'wherever you work',
    features: [
      { title: 'Visual dashboard', media: 'dashboard', doc: 'dashboard', body: 'Culprits, a page map, the call tree and long tasks for every run, on your own machine.' },
      { title: 'Behind a login', media: 'signin', doc: 'signing-in', badge: 'New in 0.5', body: 'Signs in first: a login form (one or two steps, single sign-on, authenticator codes), the browser prompt, a token or cookie, or you, in the window. Secrets stay in memory.' },
      { title: 'JSON for any tool', media: 'json', doc: 'json-output', body: 'A versioned, schema-described result for scripts, dashboards and AI agents.' },
      { title: 'Safe by default', media: 'safe', doc: 'privacy', body: 'Never clicks delete, pay or log out, and never submits a form that changes data.' },
    ],
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
    code: `# add Spectra to your project, then run it once: it teaches your AI agent about Spectra
npm install --save-dev @progen-labs/spectra
npx spectra`,
    note: 'Needs Node.js 22.12 or newer and Chrome, Chromium or Edge. Spectra drives the browser you already have.',
  },
  {
    id: 'improve',
    label: 'Improve',
    lang: 'bash',
    code: `# ask your AI agent, in plain words:  "improve the performance"
# it runs this loop: Spectra names the problem, the agent changes the code, Spectra measures it
npx spectra improve next
npx spectra improve check

# or unattended, with a coding agent on your machine, on a branch
npx spectra improve`,
    note: 'New in 0.7.0. Spectra measures, picks the problem and decides; a change is kept only when your checks pass and it measures faster beyond run-to-run noise.',
  },
  {
    id: 'profile',
    label: 'Profile',
    lang: 'bash',
    code: `# measure only: starts the dev server and runs the user journeys
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
- uses: actions/checkout@v7
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
    note: 'Then ask Claude to "improve the performance". Spectra measures each change and says keep or undo. Other MCP clients run npx -y @progen-labs/spectra mcp.',
  },
  {
    id: 'vscode',
    label: 'VS Code',
    lang: 'bash',
    code: `# install from the VS Code Marketplace
code --install-extension progen-labs.spectra-performance`,
    note: 'Or search for "Spectra frontend performance" in the Extensions view. Then run "Spectra: Profile page load" from the Command Palette.',
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
