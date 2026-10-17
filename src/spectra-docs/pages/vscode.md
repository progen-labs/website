The Spectra extension for VS Code puts every finding where you work: at the file and line responsible, with render counts above your components and before/after verification of every change.

> **New.** Until the extension is listed on the VS Code Marketplace and Open VSX, build it from the Spectra repository, as described under Install below.

## What you get

- **Problems at the right line.** Every finding appears in the Problems panel and as a squiggle at the line responsible, with its cost and the suggested fix, such as *Row is slow to render: 1442ms total, 0.2ms per render (7200×)* at `src/Row.jsx:3`.
- **CodeLens above the costly code.** Components show their render count and time, and your own hot functions show their own time: `⚡ Spectra: Row · 7,200 renders · 1.44 s rendering`.
- **The status bar** shows blocking time, LCP and scripting time of the last run, with a warning when a [budget](doc:budgets) is over. Click it to profile again.
- **Verify against baseline.** After a change, Spectra re-profiles the page the same way and tells you whether it measurably helped, beyond run-to-run noise. See [Compare before and after](doc:compare).
- **Golden paths** and the **dashboard**, without leaving the editor.
- **Shared with your AI assistant.** Results that Claude Code (through the [MCP server](doc:mcp-server)) or the CLI (`--out`) write to `.spectra/results` appear in the editor automatically. On VS Code 1.101 and later, the extension also offers Spectra's MCP server to agent mode.

## Install

You need Node.js 18 or newer and Chrome, Chromium or Edge. Add Spectra to your project, so the extension uses your version:

```bash
npm install --save-dev @progen-labs/spectra
```

Then build and install the extension from the Spectra repository:

```bash
git clone https://github.com/progen-labs/spectra.git
cd spectra/vscode
npx @vscode/vsce package --no-dependencies
code --install-extension spectra-0.1.0.vsix
```

## Commands

Open the Command Palette and type **Spectra**:

| Command | What it does |
| --- | --- |
| Spectra: Profile page load | Asks for the page (leave it empty to start your dev server), records it three times, and shows the findings, CodeLens and status |
| Spectra: Verify against baseline | Re-profiles the baseline's page with the same settings and compares. The first profile in a workspace becomes the baseline |
| Spectra: Choose baseline | Picks which earlier result to verify against |
| Spectra: Run golden paths | Profiles the page's discovered journeys; every journey's findings go to the Problems panel |
| Spectra: Open dashboard | Starts the [dashboard](doc:dashboard) and opens it in VS Code's Simple Browser |
| Spectra: Clear results | Removes the problems, CodeLens and status |
| Spectra: Show output | The CLI's output, including the full comparison |

Runs show progress in a notification and can be cancelled there; cancelling closes Chrome and any dev server Spectra started.

## Settings

| Setting | Default | What it does |
| --- | --- | --- |
| `spectra.url` | empty | The page to profile; empty starts your dev server |
| `spectra.runs` | `3` | Recordings per profile; the medians are reported |
| `spectra.goldenPaths` | `6` | Maximum journeys for Run golden paths |
| `spectra.problems.enabled` | `true` | Findings in the Problems panel |
| `spectra.codeLens.enabled` | `true` | CodeLens above components and functions |
| `spectra.watchResults` | `true` | Show results written to `.spectra/results` by the CLI or an AI assistant |
| `spectra.mcp.enabled` | `true` | Offer Spectra's MCP server to agent mode |
| `spectra.cliPath` | empty | Advanced: the Spectra CLI to run |

## Which Spectra it runs

The extension never brings its own profiler; it runs:

1. the CLI in `spectra.cliPath`, if set,
2. your project's `@progen-labs/spectra` (0.2.0 or later; it offers to update an older one),
3. otherwise `npx @progen-labs/spectra@latest`.

Results are the same as on the command line, so a teammate can reproduce any number with [`spectra performance`](doc:cli-performance).

## Remote development

The extension runs where your project is: in a dev container, over SSH or in WSL, Spectra runs on that machine, so Chrome must be installed there.
