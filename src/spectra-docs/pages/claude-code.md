Spectra's Claude Code plugin lets you ask Claude to improve your app's performance, and have every change **measured before it is kept**, all from a conversation.

> Since 0.3.0; the improve loop since 0.7.0.

```video claude-code
Install the plugin, ask for a faster page, and watch the change get verified. Every number is real output from Spectra's MCP server on its demo app.
```

## Install

In Claude Code:

```
/plugin marketplace add progen-labs/spectra
/plugin install spectra@progen-labs
```

You also need Node.js 22.12 or newer and Chrome, Chromium or Edge. For the fastest start, add Spectra to your project too, so the plugin doesn't download it on first use:

```bash
npm install --save-dev @progen-labs/spectra
```

## Ask for a faster page

Ask in plain words: *"improve the performance"*, *"make the dashboard page faster"*, *"why does clicking Save feel slow?"*. Claude picks up the plugin's **improve-performance** skill and runs [Spectra's loop](doc:improve):

1. **`improve_next`**: Spectra measures the page three times (starting your dev server if no URL is given), finds the problems in your own code, and returns the first: file, line, cost, suggested change.
2. **Claude makes that one change**, such as memoising a component, keeping a prop stable, virtualising a list, or batching DOM reads.
3. **`improve_check`**: Spectra runs your checks, measures the page again and compares it with the measurement before the change, beyond run-to-run noise. It says **keep** or **undo** (Claude reverts the files it changed), and returns the next problem.
4. **Repeat**, then **`improve_report`**: Claude tells you each fix with its before → after numbers, what was undone and why, and what remains. The kept changes are in your working tree for you to review.

What `improve_check` returns on Spectra's demo app, after a real fix:

```
✓ Kept: JavaScript CPU time: 1.55 s → 162 ms (−90%)
  also Row (src/Row.jsx) — render time: 1.44 s → 35.4 ms (−98%)
  Checks passed: npm test.
  Keep this change.

Problem 2 of 4: App rendered 60× (19/s)
  Where: src/main.jsx:15
  …
```

The older tools are still there for Claude to measure on its own: `profile_page` and `verify_change` give it a baseline and a comparison, as in this verification:

```
Verdict: IMPROVED (confidence: medium; 3 run(s) before, 3 after).
✓ JavaScript CPU time: 1.55 s → 107 ms (−93%)
✓ Row (src/Row.jsx) — render time: 1.44 s → 8.3 ms (−99%)

Metrics beyond the noise:
- JavaScript CPU time: 1.55 s → 107 ms (improved, key metric)
- Scripting: 1.49 s → 52 ms (improved)
- DOM nodes: 816 → 1652 (degraded)

Findings: 2 resolved, 1 new, 11 still present.
- resolved: [critical] Row is slow to render: 1443ms total, 0.2ms per render (7200×)
- resolved: [critical] src/heavy.js spent 1426ms of JavaScript (91% of CPU)
- new: [warning] Large DOM: 2,063 nodes
```

A comparison reports what got worse as well as what got better: here the fix traded CPU time for more DOM nodes.

## Audit without changing code

```
/spectra:audit http://localhost:3000/settings
```

Profiles the page and runs its [golden paths](doc:golden-paths), then reports the headline numbers, the top problems with file, line and fix, and the slow journeys. It never edits files.

## Slow interactions

For a slow click or keystroke rather than a slow load, Claude writes a small scenario file that performs the interaction (a Puppeteer script) and profiles with it, so the "before" and "after" record exactly the same thing. See [Quick and repeated profiles](doc:quick-profiles).

## Without the plugin

The plugin is a convenience around Spectra's [MCP server](doc:mcp-server). To add only the server:

```bash
claude mcp add spectra -- npx -y @progen-labs/spectra mcp
```

You get the same tools, without the skills.

## Good to know

- **Development builds.** Spectra measures your dev server; production builds hide component timings.
- **This machine only.** The server profiles local pages, so a prompt can't send it off to profile someone else's site.
- **Budgets.** If your project has a [`spectra.config.json`](doc:budgets), Claude reports which budgets are still over.
- **Status.** Run `/mcp` in Claude Code to see that the Spectra server is connected. The tools appear to the model as `mcp__plugin_spectra_spectra__improve_next` and so on.
- **Long runs.** Golden paths take about ten seconds per journey. Claude Code waits for them, and shows progress as Spectra reports it.

Even without the plugin, Claude Code learns what Spectra does from a `spectra` skill that Spectra adds to the project on its first run, and drives the same loop with `npx spectra improve next` and `check`: see [Your AI agent](doc:agents).
