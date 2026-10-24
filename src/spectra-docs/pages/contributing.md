Spectra is open source under the MIT licence, and contributions are welcome: bug reports, new finding rules, framework adapters and documentation.

- **Code**: [github.com/progen-labs/spectra](https://github.com/progen-labs/spectra)
- **Issues and ideas**: [github.com/progen-labs/spectra/issues](https://github.com/progen-labs/spectra/issues), with forms for bug reports and feature requests
- **How to contribute**: [CONTRIBUTING.md](https://github.com/progen-labs/spectra/blob/main/CONTRIBUTING.md), and the [Code of Conduct](https://github.com/progen-labs/spectra/blob/main/CODE_OF_CONDUCT.md)
- **Security problems**: privately, as [SECURITY.md](https://github.com/progen-labs/spectra/blob/main/SECURITY.md) explains

## Develop locally

```bash
git clone https://github.com/progen-labs/spectra.git
cd spectra
npm ci
npm test          # the analysis, result, CLI, MCP and harness tests
npm run lint      # ESLint
npm run bench     # the AI fix harness's test bench (needs Chrome)
npm run demo      # a demo app with deliberate performance bugs, on :5188
npm run dev       # the dashboard in development, on :5178
```

The demo app has a slow component, a 260 ms click handler, a component that re-renders for nothing, layout thrashing and a layout shift. Open the dashboard, launch Chrome on `http://localhost:5188/`, and each bug appears among the culprits. Add `?fixed=1` for an "optimised" variant to compare against.

## Project layout

```
bin/spectra.js             the CLI
server/recorder.js         drives Chrome: start, stop, trace, metrics, sign-in
server/agents.js           the knowledge doc for AI agents (agents/spectra.md): where each agent reads it
.github/workflows/         checks.yml: every check, and spectra-bot's pull request report (pr-comment.yml)
server/signin.js           signing in: login forms, authenticator codes, prompts, tokens, links
server/probe.browser.js    the in-page probe: framework hooks and vitals
server/analysis/           trace, CPU profile, source mapping, report, findings
server/explore/            dev-server boot, discovery and the golden-path runner
server/cli.js              single-page profiles (--quick, --mode, --runs)
server/compare-cli.js      spectra compare
server/mcp.js              spectra mcp: the MCP server
server/fix/                spectra improve, unattended: the harness (policy, loop, git copy, agents, checks)
server/improve/            spectra improve: the command, and the guided session (next, check, report, stop)
bench/                     the harness's test bench (npm run bench)
shared/compare.js          the comparison engine, shared by the CLI, dashboard and PDF
shared/result.js           summaries, budgets and the JSON results
schema/                    JSON Schemas for results and spectra.config.json
src/                       the dashboard (React and d3)
fixtures/                  demo apps for React, Vue and Angular
plugins/spectra/           the Claude Code plugin; .claude-plugin/ holds its marketplace
vscode/                    the VS Code extension
action.yml, action/        the GitHub Action
```

## Add a finding rule

Add a rule to `buildFindings` in `server/analysis/findings.js`. Return the evidence, the `culprits` and a `fix`, and cover it with a test in `server/test-analysis.js`. Test files are named `test-*.js` and run with `node --test`.

## Docs

These pages live in the Progen Labs website repository, one Markdown file per page. Every page has an **Edit this page** link at the bottom.

## Refresh the docs screenshots

The annotated screenshots are captured from a real dashboard by `scripts/docs-screenshots.mjs`, which also measures where each numbered region is, so the call-outs stay aligned. In a scratch project with a `package.json` and a git repository:

```bash
# terminal 1, in the Spectra repo: the demo app
npm run demo

# terminal 2, in the scratch project: record, then serve the dashboard
npx spectra performance --url http://localhost:5188/ --scenario scenario.mjs
npx spectra performance --url http://localhost:5188/ --paths 4
npx spectra performance --quick --runs 3 --url http://localhost:5188/ --out before.json
git commit --allow-empty -m "Optimise the list"
npx spectra performance --quick --runs 3 --url "http://localhost:5188/?fixed=1" --out after.json
npx spectra dashboard --port 4400

# terminal 3, in the Spectra repo
node scripts/docs-screenshots.mjs --live <live report id> \
  --before <ids from before.json> --after <ids from after.json> \
  --out ../website/src/spectra-docs/images
```

The scenario clicks the demo's **Long task**, **Layout thrash** and **Layout shift** buttons. The script writes one `.webp` per screenshot and a `manifest.json` of region positions. A docs page then shows a screenshot with a fenced block naming it, a caption line, and one `region: explanation` line per numbered call-out.

## Checks and releases

Every pull request runs lint, the tests on Linux and macOS (with a coverage minimum), the packed package on Linux and Windows, a check of every link in the docs, size budgets, dependency review, the fix harness's bench and the GitHub Action. CodeQL and Socket check it too, and **spectra-bot** comments with every result, linking the failing step, file and line for anything that fails.

Releases are published from GitHub Actions after every check and the maintainer's approval: to npm with provenance, and as a GitHub Release with the [changelog](doc:changelog)'s notes, the package and its SBOM, each with a signed build attestation. Every workflow action is pinned to a commit, and CI installs from the committed lockfile.

