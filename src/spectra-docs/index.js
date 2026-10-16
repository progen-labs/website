// The Spectra documentation: one Markdown file per page in ./pages, in the
// order below (it drives the sidebar and the previous / next links). To add a
// page, write pages/<id>.md, import it here and list it in a group.

import introduction from './pages/introduction.md?raw';
import installation from './pages/installation.md?raw';
import quickStart from './pages/quick-start.md?raw';
import cliPerformance from './pages/cli-performance.md?raw';
import quickProfiles from './pages/quick-profiles.md?raw';
import compare from './pages/compare.md?raw';
import reports from './pages/reports.md?raw';
import budgets from './pages/budgets.md?raw';
import jsonOutput from './pages/json-output.md?raw';
import goldenPaths from './pages/golden-paths.md?raw';
import frameworks from './pages/frameworks.md?raw';
import dashboard from './pages/dashboard.md?raw';
import culprits from './pages/culprits.md?raw';
import dashboardTabs from './pages/dashboard-tabs.md?raw';
import compareCommits from './pages/compare-commits.md?raw';
import appearance from './pages/appearance.md?raw';
import signingIn from './pages/signing-in.md?raw';
import recordingTips from './pages/recording-tips.md?raw';
import configuration from './pages/configuration.md?raw';
import findings from './pages/findings.md?raw';
import howItWorks from './pages/how-it-works.md?raw';
import privacy from './pages/privacy.md?raw';
import troubleshooting from './pages/troubleshooting.md?raw';
import changelog from './pages/changelog.md?raw';
import contributing from './pages/contributing.md?raw';

export const DOC_GROUPS = [
  {
    title: 'Getting started',
    pages: [
      { id: 'introduction', title: 'Introduction', body: introduction },
      { id: 'installation', title: 'Installation', body: installation },
      { id: 'quick-start', title: 'Quick start', body: quickStart },
    ],
  },
  {
    title: 'Command line',
    pages: [
      { id: 'cli-performance', title: 'spectra performance', body: cliPerformance },
      { id: 'quick-profiles', title: 'Quick and repeated profiles', body: quickProfiles },
      { id: 'compare', title: 'Compare before and after', body: compare },
      { id: 'reports', title: 'spectra reports', body: reports },
      { id: 'budgets', title: 'Budgets and CI', body: budgets },
      { id: 'json-output', title: 'JSON output', body: jsonOutput },
    ],
  },
  {
    title: 'Automation',
    pages: [
      { id: 'golden-paths', title: 'Golden paths', body: goldenPaths },
      { id: 'frameworks', title: 'Frameworks', body: frameworks },
    ],
  },
  {
    title: 'Dashboard',
    pages: [
      { id: 'dashboard', title: 'Dashboard', body: dashboard },
      { id: 'culprits', title: 'The Culprits tab', body: culprits },
      { id: 'dashboard-tabs', title: 'Report tabs', body: dashboardTabs },
      { id: 'compare-commits', title: 'Compare commits and PDFs', body: compareCommits },
      { id: 'appearance', title: 'Appearance', body: appearance },
    ],
  },
  {
    title: 'Guides',
    pages: [
      { id: 'signing-in', title: 'Signing in', body: signingIn },
      { id: 'recording-tips', title: 'Recording tips', body: recordingTips },
      { id: 'configuration', title: 'Configuration', body: configuration },
    ],
  },
  {
    title: 'Reference',
    pages: [
      { id: 'findings', title: 'Findings reference', body: findings },
      { id: 'how-it-works', title: 'How it works', body: howItWorks },
      { id: 'privacy', title: 'Privacy and safety', body: privacy },
      { id: 'troubleshooting', title: 'Troubleshooting', body: troubleshooting },
      { id: 'changelog', title: 'Changelog', body: changelog },
      { id: 'contributing', title: 'Contributing', body: contributing },
    ],
  },
];

export const DOC_PAGES = DOC_GROUPS.flatMap(g => g.pages.map(p => ({ ...p, group: g.title })));
export const DEFAULT_DOC = DOC_PAGES[0].id;
export const docById = id => DOC_PAGES.find(p => p.id === id) || null;

/** The docs page named in the URL hash, e.g. #spectra/docs/compare. */
export const docFromHash = (hash = window.location.hash) => {
  const m = /^#spectra\/docs\/([\w-]+)/.exec(hash);
  return m && docById(m[1]) ? m[1] : null;
};
