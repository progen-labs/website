`spectra improve` is Spectra's main command: it makes the app faster. Spectra measures the app, finds the problems in **your own code**, has each one fixed, measures the change, and keeps only what measurably helped.

> **New in 0.7.0.** Update with `npm install --save-dev @progen-labs/spectra@latest`. `spectra fix` is its old name and still works.

There are two ways to run it, with the same rules:

| | Who makes the changes | Where | What you get |
| --- | --- | --- | --- |
| **Guided**: `next`, `check`, `report`, `stop` | The AI agent you are talking to, or you | Your working tree | Changes in place, uncommitted, for you to review |
| **Unattended**: `spectra improve` | A coding agent installed on your machine | A copy of your last commit | A branch with one commit per kept fix, with the measurements |

## Ask your AI agent

After `npm install --save-dev @progen-labs/spectra` and one `npx spectra`, your agent knows Spectra (see [Your AI agent](doc:agents)). Ask it, in plain words:

> improve the performance

It runs the guided loop:

1. **`npx spectra improve next`** measures the page (three page loads; Spectra starts your dev server and stops it again) and prints the first problem: what it is, the file and line, the cost, where the time went, and the suggested fix.
2. The agent **makes that one change**, keeping the behaviour the same.
3. **`npx spectra improve check`** runs your checks (tests, type check, build), measures the page again, and compares it with the measurement before the change, beyond run-to-run noise. It prints **Kept** or **Undo this change**, then the next problem.
4. Repeat, until there are no more problems. **`npx spectra improve report`** sums it up, and the agent tells you what got faster, with the numbers.

Every step is one short command, so any coding agent can drive it: Claude Code, Cursor, GitHub Copilot, Codex, Gemini CLI, Windsurf and the rest. Agents with Spectra's [MCP server](doc:mcp-server) use the same loop as tools (`improve_next`, `improve_check`, `improve_report`); the [Claude Code plugin](doc:claude-code) wires that up for you.

You can drive it yourself the same way: run `next`, make the change in your editor, run `check`.

A session on Spectra's React demo app:

```
$ npx spectra improve next
spectra: measuring the baseline (3 page loads) …
Problem 1 of 5: Row is slow to render: 1442ms total, 0.2ms per render (7200×)
  Where: src/Row.jsx:3
  Cost: about 1.44 s, seen in 3 runs
  Where the time went:
    Row() in src/Row.jsx:3: 1.44 s (slow render)
  Suggested fix: Move expensive calculations into useMemo, virtualise long lists, …

Make ONE focused change in src/Row.jsx that removes or reduces this cost, keeping the behaviour exactly the same …
Then run:  npx spectra improve check

$ npx spectra improve check
spectra: running the checks (npm test) …
spectra: measuring the change …
✓ Kept: JavaScript CPU time: 1.55 s → 162 ms (−90%)
  also Row (src/Row.jsx) — render time: 1.44 s → 35.4 ms (−98%)
  Checks passed: npm test.
  Keep this change.

Problem 2 of 4: App rendered 60× (19/s)
  Where: src/main.jsx:15
  …

$ npx spectra improve check
✗ Undo this change: no measurable improvement: every change was within run-to-run noise.
  Revert the files you changed for this problem (and only those), then continue.

$ npx spectra improve report
Spectra improve — 1 of 2 problems fixed
  ✓ fixed       Row is slow to render … (src/Row.jsx:3): JavaScript CPU time: 1.55 s → 162 ms (−90%)
  ✗ undone      App rendered 60× (19/s) (src/main.jsx:15) — no measurable improvement
Overall, before → after: IMPROVED (confidence: medium)
  ✓ JavaScript CPU time: 1.55 s → 162 ms (−90%)
  ✓ Row (src/Row.jsx) — render time: 1.44 s → 35.4 ms (−98%)
```

The first fix also cleared "src/heavy.js spent 1394ms of JavaScript", so that problem was skipped rather than handed out. The session ended with `spectra improve stop`; the report is in `.spectra/improve/<time>/report.md`.

## Unattended

```bash
npx spectra improve
```

Spectra finds a coding agent on your machine and does the whole loop without you: in a git worktree of your last commit, with its own dev server, it hands each problem to the agent, runs your checks, measures, and commits the kept changes on a branch `spectra/improve-<time>`. Your working tree is never touched, and nothing is pushed or merged.

```
spectra: working in a copy of cedc8cd on branch spectra/improve-20261025-091201, with Claude Code …
spectra: dev server ready at http://localhost:5300
spectra: running the checks before any change (npm test) …
spectra: measuring the baseline …
spectra: 2 findings to attempt, most costly first.
spectra: [1/2] Row is slow to render: 1442ms total, 0.2ms per render (7200×) — src/Row.jsx:3
spectra: [1/2] changed src/Row.jsx (+2 −1)
spectra: [1/2] running the checks …
spectra: [1/2] measuring the change …
spectra: [1/2] ✓ kept (7cae6fa): JavaScript CPU time: 1.57 s → 152 ms (−90%)
spectra: [2/2] – src/heavy.js spent 1417ms of JavaScript: already resolved by an earlier kept change.

Spectra improve — 1 of 1 problem fixed
  ✓ fixed    Row is slow to render: 1442ms total, 0.2ms per render (7200×) (src/Row.jsx:3): JavaScript CPU time: 1.57 s → 152 ms (−90%)

Overall, before → after: IMPROVED (confidence: medium)
  ✓ JavaScript CPU time: 1.57 s → 152 ms (−90%)
  ✓ Row (src/Row.jsx) — render time: 1.44 s → 35.3 ms (−98%)

The fixes are on branch spectra/improve-20261025-091201, one commit each, with the measurements in the commit messages.
Review them with:  git log -p HEAD..spectra/improve-20261025-091201
then merge the branch or open a pull request. Your own files were not touched.
```

**The agent.** Spectra looks for Claude Code, Codex CLI, Gemini CLI, GitHub Copilot CLI, Cursor CLI, OpenCode and Amp, and prefers the one your project or machine already uses. `--agent <name>` picks one; `--agent "<command>"` runs your own (it gets the instructions on stdin and in `$SPECTRA_FIX_PROMPT_FILE`). Claude Code runs allowed only to read and edit files, with a spending cap per problem (`--max-budget-usd`, $2 by default). Each agent reads the files it works on and, if it is a hosted model, sends them to its provider: use an agent and account your project's rules allow. Without any agent installed, `spectra improve` starts a guided session instead.

**Before you start:** a git repository with your changes committed (it refuses to start otherwise, because uncommitted changes would not be in the copy); a dev script, or `--command`; and at least one check, see [Checks and safety](doc:harness-safety).

## Options

| Option | Default | What it does |
| --- | --- | --- |
| `--url <page>` | the dev server's home page | The page to make faster. Guided mode profiles a page that is already running when you give one; unattended mode always starts its own server in the copy, so it does not take `--url` |
| `--max-fixes <n>` | `3` unattended, `5` guided | How many problems to attempt |
| `--runs <n>` | `3` | Page loads per measurement; the medians are compared |
| `--check "<cmd>"` | your test, type-check and build scripts | A check that must pass after every change. Repeat it for several. It can test the running app at `$SPECTRA_FIX_URL` |
| `--no-checks` | | Rely on the measurements alone. Not recommended |
| `--command "<cmd>"`, `--boot-timeout <s>` | your npm dev script, `60` | How to start the dev server, and how long to wait |
| `--login-url`, `--login-user`, `--login <method>`, `--config <file>` | | Sign in first, as for [`spectra performance`](doc:cli-performance). See [Signing in](doc:signing-in) |
| `--json`, `--out <file>` | | Machine-readable output |
| `--agent <name\|"cmd">` | found on the machine | Unattended: which agent |
| `--model <name>`, `--max-budget-usd <n>` | Claude Code's default, `2` | Unattended: Claude Code's model and spending cap per problem |
| `--branch <name>` | `spectra/improve-<time>` | Unattended: the branch for the fixes |
| `--max-lines <n>` | `150` | Unattended: the largest change accepted for one problem |
| `--install` | | Unattended: install dependencies in the copy instead of linking yours |
| `--retry` | | Try problems that failed in an earlier session again |
| `--keep-worktree` | | Unattended: keep the copy in `.spectra/improve/` to inspect |
| `--restart` | | Guided `next`: end the current session and measure again from the start |

## What it leaves behind

- Guided: the kept changes in your working tree, uncommitted. Unattended: the branch, with one commit per kept fix; it is deleted if nothing was kept.
- `.spectra/improve/<time>/report.md`, the session as Markdown, ready for a pull request, with `session.json` or `report.json` beside it and every measurement under `results/` and `reports/` (open them in the [dashboard](doc:dashboard)).
- `.spectra/improve/history.json`: what happened to each problem. One that was not fixed is skipped in later sessions unless you pass `--retry`.
- `.spectra/improve/current.json` while a guided session is open.

Spectra adds `.spectra/` to your repository's local exclude file, so none of this shows up as a change.

## How it decides

The rules are the same in both modes, and they are Spectra's code, not the agent's judgement: see [How improve decides](doc:harness) and [Checks and safety](doc:harness-safety). In short: a change is kept only when your checks pass, the page measures faster beyond run-to-run noise with medium or high confidence, and no new critical problem appeared in your own code. The unattended mode also refuses changes outside the source (dependencies, configuration, tests, CI), deletions and large edits.

## Exit codes

`0`: the session finished, whether or not anything was fixed. `1`: it could not run, for example because a check failed before any change, there is no session to check, or the agent could not start.
