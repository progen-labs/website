`spectra fix` runs the [AI fix harness](doc:harness) in your project.

> **New in 0.4.0.** Update with `npm install --save-dev @progen-labs/spectra@latest`.

```bash
npx spectra fix
```

## Before you start

- **A git repository, with your changes committed.** The harness works on a copy of your last commit, so it refuses to start while there are uncommitted changes that would not be in it.
- **A dev script** (`dev`, `start`, `serve` or `develop` in `package.json`), as for [`spectra performance`](doc:cli-performance), or `--command`.
- **At least one check.** By default: your `test` script, a type-check script (`typecheck`, `type-check`, `check-types` or `tsc`) and your `build` script. See [Checks and safety](doc:harness-safety).
- **An agent.** By default, [Claude Code](https://claude.com/claude-code), signed in. Spectra runs `claude`, or the path in `SPECTRA_CLAUDE`. Or pass `--agent "<command>"`.
- Node.js 22.12 or newer and Chrome, Chromium or Edge, as for any Spectra run.

## A session

Real output from the [test bench](doc:harness-bench) on Spectra's demo app, shortened:

```
spectra: working in a copy of cedc8cd on branch spectra/fix-20261017-082152 …
spectra: dev server ready at http://localhost:5300
spectra: running the checks before any change (npm test) …
spectra: measuring the baseline …
spectra: 1 finding to attempt, most costly first.
spectra: [1/1] Row is slow to render: 1442ms total, 0.2ms per render (7200×) — src/Row.jsx:3
spectra: [1/1] changed src/Row.jsx (+2 −1)
spectra: [1/1] running the checks …
spectra: [1/1] measuring the change …
spectra: [1/1] ✓ kept (7cae6fa): JavaScript CPU time: 1.57 s → 152 ms (−90%)

Spectra fix — 1 of 1 finding fixed
  ✓ kept      Row is slow to render: 1442ms total, 0.2ms per render (7200×) (src/Row.jsx:3)

Overall: IMPROVED (confidence: medium)
  ✓ JavaScript CPU time: 1.57 s → 152 ms (−90%)
  ✓ Row (src/Row.jsx) — render time: 1.44 s → 35.3 ms (−98%)

The fixes are on branch spectra/fix-20261017-082152. Review them with:
  git log -p HEAD..spectra/fix-20261017-082152
then merge the branch or open a pull request.
```

Each kept change is one commit, and its message carries the evidence:

```
perf: Row is slow to render: 1442ms total, 0.2ms per render (7200×)

Verified by spectra fix: improved (confidence: medium).
- JavaScript CPU time: 1.57 s → 152 ms (−90%)
- Row (src/Row.jsx) — render time: 1.44 s → 35.3 ms (−98%)
Checks passed: npm test.
Finding: src/Row.jsx:3
```

## Options

| Option | Default | What it does |
| --- | --- | --- |
| `--max-fixes <n>` | `3` | How many findings to attempt |
| `--runs <n>` | `3` | Page loads per measurement; the medians are compared |
| `--check "<cmd>"` | your test, type-check and build scripts | A check that must pass after every change. Repeat it for several. It can test the running app at `$SPECTRA_FIX_URL` |
| `--no-checks` | | Rely on the measurements alone. Not recommended |
| `--agent "<cmd>"` | Claude Code | Your own agent. See below |
| `--model <name>` | Claude Code's default | The model Claude Code uses |
| `--max-budget-usd <n>` | `2` | Claude Code's spending cap for each finding |
| `--command "<cmd>"` | your npm dev script | How to start the dev server |
| `--boot-timeout <s>` | `60` | How long to wait for the dev server |
| `--install` | | Install dependencies in the copy (`npm ci`, `pnpm install` or `yarn install`, from your lockfile) instead of linking yours |
| `--branch <name>` | `spectra/fix-<time>` | The branch for the fixes |
| `--max-lines <n>` | `150` | The largest change accepted for one finding |
| `--retry` | | Try findings that failed in an earlier session again |
| `--keep-worktree` | | Keep the copy in `.spectra/fix/` to inspect it |
| `--json`, `--out <file>` | | The session report as JSON, on stdout or in a file |

`spectra fix` starts its own dev server in the copy, so it does not take `--url`.

## What it leaves behind

- **The branch** `spectra/fix-<time>`, with one commit per kept fix. It is deleted if nothing was kept.
- **`.spectra/fix/<time>/report.md`**: the session as Markdown, ready to paste into a pull request. `report.json` holds the same data.
- **`.spectra/fix/<time>/reports/`**: every profile the session recorded. Open them in the [dashboard](doc:dashboard).
- **`.spectra/fix/history.json`**: what happened to each finding. A finding that was not fixed is skipped in later sessions unless you pass `--retry`.

Spectra adds `.spectra/` to your repository's local exclude file (`.git/info/exclude`), so none of this ever shows up as a change.

To take the fixes, review and merge the branch:

```bash
git log -p HEAD..spectra/fix-20261017-082152
git merge spectra/fix-20261017-082152
```

## Your own agent

`--agent` runs any command in the copy of your project:

- The instructions arrive on **stdin**, and in the file named by `$SPECTRA_FIX_PROMPT_FILE`.
- `$SPECTRA_FIX_FINDING` holds the finding as JSON: its title, file, line and cost.
- The agent edits the files and exits with code 0. Its last line of output is recorded as the summary of its change.

```bash
npx spectra fix --agent "./scripts/my-agent.sh"
```

Everything after the agent finishes, from the scope rules to the measurements, is the harness's job, whichever agent you use.

## What the agent is told

The finding (its title, file and line, cost, where the time went and Spectra's suggested fix) and these rules:

- keep the behaviour exactly the same, and never delete features or hide content to look faster;
- edit only the source files involved, not `package.json`, lockfiles, configuration, tests or CI;
- keep the change small;
- don't run commands: Spectra runs the checks and the measurements afterwards.

The rules guide the agent; they are not what keeps your code safe. The harness enforces them itself. See [Checks and safety](doc:harness-safety).

## Exit codes

`0`: the session finished, whether or not any fix was kept. `1`: it could not run, for example because a check failed before any change or the agent could not start.
