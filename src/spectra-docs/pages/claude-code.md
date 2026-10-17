Spectra's Claude Code plugin lets Claude profile your app, fix what it finds, and **prove each fix with before/after measurements**, all from a conversation.

> **New in 0.3.0.**

## Install

In Claude Code:

```
/plugin marketplace add progen-labs/spectra
/plugin install spectra@progen-labs
```

You also need Node.js 18 or newer and Chrome, Chromium or Edge. For the fastest start, add Spectra to your project too, so the plugin doesn't download it on first use:

```bash
npm install --save-dev @progen-labs/spectra
```

## Ask for a faster page

Ask in plain words: *"make the dashboard page faster"*, *"why does clicking Save feel slow?"*, *"fix the wasted re-renders on /settings"*. Claude picks up the plugin's **improve-performance** skill and works in a loop:

1. **Profiles** the page three times with `profile_page`, starting your dev server if no URL is given, and keeps the result as the baseline.
2. **Picks the costliest finding** in your own code, and reads its file and line.
3. **Makes one focused change**, such as memoising a component, keeping a prop stable, virtualising a list, or batching DOM reads.
4. **Verifies** with `verify_change`: Spectra re-profiles the page the same way and compares it with the baseline, beyond run-to-run noise.
5. **Keeps the change only if it measurably helped**, and reverts it otherwise, then moves on to the next finding (three at most, unless you ask for more).

A verification on Spectra's demo app looks like this:

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

It reports what got worse as well as what got better: here the fix traded CPU time for more DOM nodes, which Claude can weigh up or address next.

Claude then reports each kept change with its measured before → after, what it tried and reverted, and what is left.

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
- **Status.** Run `/mcp` in Claude Code to see that the Spectra server is connected. The tools appear to the model as `mcp__plugin_spectra_spectra__profile_page` and so on.
- **Long runs.** Golden paths take about ten seconds per journey. Claude Code waits for them, and shows progress as Spectra reports it.
