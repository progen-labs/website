From the root of your project, after [installing](doc:installation):

```bash
npx spectra
```

That prints what Spectra can do and, the first time, teaches your AI coding agent about it. Then:

## Ask your agent

In Claude Code, Cursor, GitHub Copilot, Codex, Gemini CLI, Windsurf or any other coding agent:

> improve the performance

The agent runs Spectra's loop: Spectra measures the app and names the first problem; the agent changes the code; Spectra runs your checks, measures again and says keep or undo; and so on. At the end the agent tells you what got faster, with the before → after numbers. The changes are in your working tree for you to review. See [Improve the performance](doc:improve).

## Or run it yourself

```bash
npx spectra improve
```

Unattended: Spectra finds a coding agent on your machine (Claude Code, Codex, Gemini CLI, Copilot CLI, Cursor…), works in a copy of your last commit, and puts the kept fixes on a branch. Without an agent installed, it names the first problem and waits for you: make the change, then `npx spectra improve check`.

## Measure only

```bash
npx spectra performance
```

With no `--url`, Spectra detects your framework and starts your dev server, records a page load, discovers the actionable elements on the page (links, buttons, inputs, forms), runs **golden-path journeys** through them (skipping anything destructive), prints a performance matrix, saves a report for every journey, and stops the server.

```
#  Golden path              Result     TBT     LCP  LongT  Top finding
·  Initial page load        PASS       0ms    84ms      0  [critical] Row is slow to render: 1443ms
1  Click "Long task"        PASS     213ms       —      1  [critical] src/heavy.js spent 586ms of J
2  Click "Layout thrash"    PASS       0ms       —      0  [critical] Row is slow to render: 360ms
Automation: 2/2 golden paths passed.
```

The full suite takes a minute or two. While you work on one page, profile just its load, which takes seconds: `npx spectra performance --quick`. See [Measure a page](doc:cli-performance) and [Quick and repeated profiles](doc:quick-profiles).

## Open the dashboard

```bash
npx spectra dashboard --open
```

Every report from this project is listed there, with the culprits, the page map, the call tree and more. See [Dashboard](doc:dashboard).

## Next steps

- Prove a change of your own: [Compare before and after](doc:compare).
- Set [budgets](doc:budgets) and run Spectra in CI.
- Learn to read [the Culprits tab](doc:culprits).
- See how a change is kept or undone: [How improve decides](doc:harness).
