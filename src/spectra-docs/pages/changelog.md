Update an existing install with `npm install --save-dev @progen-labs/spectra@latest`, and check yours with `npx spectra --version`.

## 0.5.0 (22 October 2026)

Spectra signs in, and every label names your framework.

- **Signing in, every kind of login.** Most production frontends sit behind a login; now Spectra signs in before it profiles. A **login form** (one or two steps, forms that render late, in iframes or web components, behind a **Sign in** button, on your identity provider), with **authenticator codes** from a TOTP secret; **signing in yourself** in the Chrome window for SMS or email codes, passkeys and CAPTCHAs; the **browser's login prompt** (HTTP Basic or Digest); a **token, cookie or localStorage entry**; or a **sign-in link**. In the dashboard, turn on **My app needs a sign-in**; on the command line use `--login-url` and `--login-user` with `SPECTRA_LOGIN_PASSWORD`, or put the non-secret parts in `spectra.config.json` for every tool. Secrets stay in memory, are never written to disk, a report or a log, and the config file refuses them. See [Signing in](doc:signing-in).
- **Framework-agnostic labels.** The dashboard, findings, comparisons and PDFs say **Components**, **Component render time** and the framework the page runs (React, Vue or Angular), instead of "React" everywhere.
- **The framework is detected in the page.** The probe is ready for React, Vue and Angular on every page, so an Angular or Vue app is profiled as itself even when Spectra starts from another folder, a monorepo root or an editor. Before, it took the framework from the `package.json` where Spectra started and fell back to React.
- **Page map for every app.** The page screenshot is now always taken, and Vue and Angular components are pinned on it, not only React ones.
- **Fixed**: a plain JavaScript page no longer gets a "No React renderer was seen" finding, and the dashboard's pill says **No component framework seen** without looking like an error.

## 0.4.1 (17 October 2026)

- **`spectra fix` skips findings that are already fixed.** One fix often clears several findings. After each kept fix, a finding the new measurement no longer shows is listed as skipped ("already resolved by an earlier kept change") instead of being handed to the agent, which saves its time and cost. Found by the first [real-agent bench run](doc:harness-bench), where one of three attempts went to a finding the first fix had cleared.

## 0.4.0 (17 October 2026)

The [AI fix harness](doc:harness). `spectra fix` hands the costliest findings in your own code to a coding agent (Claude Code by default, or any command), one at a time, in a git worktree of your last commit. A change is kept as a commit on a new branch only when it stays within scope, your checks pass (they can test the running app at `$SPECTRA_FIX_URL`) and Spectra measures it faster beyond run-to-run noise; otherwise it is undone. Each session leaves a Markdown report and a history, so failed findings aren't retried. A [test bench](doc:harness-bench) checks the harness's decisions in CI. See [spectra fix](doc:cli-fix) and [Checks and safety](doc:harness-safety).

## GitHub Action v1 (17 October 2026)

`uses: progen-labs/spectra@v1` profiles each pull request and its base commit on the same runner, compares them, enforces budgets, and reports in the job summary and an optional pull request comment. See [GitHub Action](doc:github-action).

## VS Code extension 0.1.0 (17 October 2026)

The first release of the [VS Code extension](doc:vscode), on the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=progen-labs.spectra-performance) as `progen-labs.spectra-performance`: findings in the Problems panel at the exact line, CodeLens above costly components and functions, headline numbers in the status bar, verify against a baseline, golden paths, the dashboard in the editor, results shared with the CLI and AI assistants, and Spectra's MCP server offered to agent mode.

## 0.3.0 (17 October 2026)

Spectra works inside your AI assistant.

- **`spectra mcp`**: Spectra as an MCP server, with `profile_page`, `verify_change`, `compare_profiles`, `run_golden_paths`, `list_reports` and `get_report`. Local pages only by default; one browser at a time; progress notifications and cancellation. See [MCP server](doc:mcp-server).
- **Claude Code plugin**: `/plugin marketplace add progen-labs/spectra`, then `/plugin install spectra@progen-labs`. Claude fixes performance problems one at a time and keeps a change only when Spectra measures an improvement; `/spectra:audit` reports without editing. See [Claude Code plugin](doc:claude-code).
- **Cleaner stops**: stopping or cancelling a run now also closes Chrome and stops the dev server Spectra started.

## 0.2.0 (17 October 2026)

Faster loops, honest comparisons and machine-readable output. Everything is additive: existing commands and options behave as before.

- **`--quick`**: a single page-load profile, the fast loop. See [Quick and repeated profiles](doc:quick-profiles).
- **`--runs N`**: record several times and report medians, the spread and how many runs saw each finding.
- **`spectra compare`**: noise-aware before and after, from `--out` result files, report ids or report files. `--fail-on-regression` exits with code 2. See [Compare](doc:compare).
- **`spectra reports`**: list saved reports. See [spectra reports](doc:reports).
- **Budgets** in `spectra.config.json`, checked on every run, with exit codes for CI. See [Budgets and CI](doc:budgets).
- **`--json` and `--out`**: a versioned result with published JSON Schemas. Saved reports carry a `schemaVersion`. See [JSON output](doc:json-output).
- **A lighter install**: 29 packages and 33 MB instead of 73 packages and 54 MB, because the dashboard ships prebuilt.
- **Fixed**: relative `--scenario` paths now resolve against your directory. Zero times read "0 ms", and a single run's summary line no longer prints "nullms".
- **Dashboard fixes**: on laptop-sized windows the report tabs wrap instead of hiding **Compare commits** off the edge, and the Long tasks cards keep file names, functions and times inside the card.

## 0.1.3 (11 October 2026)

- **Angular**: per-component change-detection counts and self time from Angular's development-mode profiler.

## 0.1.2 (11 October 2026)

- Fixed every reported dependency vulnerability.

## 0.1.1 (11 October 2026)

- **Vue**: deep component support through Vue's DevTools hook.
- **Next.js**: profiled through React.

## 0.1.0 (11 October 2026)

- First release on npm as `@progen-labs/spectra`.
- `spectra performance`: self-boots your dev server, discovers actionable elements and runs the safe [golden-path suite](doc:golden-paths).
- `spectra dashboard`: the full dashboard with no build step, including PDF export and commit comparison.
