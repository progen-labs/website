Spectra makes your web app faster. It measures the app in Chrome, finds the problems in **your own code** (the exact file, function, line and component, with a suggested fix), has each one fixed, measures the change, and keeps only what measurably helped. It works with the AI coding agent you already use, or on its own.

## Three steps

1. **Install** it in your project, and run it once so your AI agent learns what it does:
   ```bash
   npm install --save-dev @progen-labs/spectra
   npx spectra
   ```
2. **Ask your agent**, in plain words: *"improve the performance"*. Spectra measures and names the problem; the agent changes the code; Spectra measures again and says keep or undo; repeat. Or run `npx spectra improve` and let a coding agent on your machine do it unattended, on a branch.
3. **Review** the changes, and commit.

See [Improve the performance](doc:improve) for a whole session, and [Your AI agent](doc:agents) for the agents it works with.

```screenshot dashboard-overview
The Spectra dashboard: a click handler in the demo app is the top culprit, with its file, line and fix.
```

## What else it does

- **Measures without changing anything.** `npx spectra performance` starts your dev server, finds the things a user can do on the page, drives real journeys and reports the slowest parts of each. See [Measure a page](doc:cli-performance).
- **Points at code, not symptoms.** Every finding names the function, file and line responsible, mapped back through source maps. See [The Culprits tab](doc:culprits).
- **Understands your framework.** Per-component render counts and timings for React, Next.js, Vue and Angular, and source-mapped file and function attribution for everything else. See [Frameworks](doc:frameworks).
- **Proves a fix worked.** `spectra compare` reports what got better or worse between two sets of runs, beyond run-to-run noise. See [Compare](doc:compare).
- **Gates your CI.** Budgets in `spectra.config.json` turn any run into a pass or fail check, and the GitHub Action compares every pull request with its base commit. See [Budgets and CI](doc:budgets) and [GitHub Action](doc:github-action).
- **Speaks JSON and MCP.** `--json` prints a versioned, schema-described result; `spectra mcp` gives any MCP client the same loop as tools. See [JSON output](doc:json-output) and [MCP server](doc:mcp-server).
- **Lives in your editor.** The VS Code extension shows each finding at its line and render counts above components. See [VS Code extension](doc:vscode).
- **Comes with a dashboard.** A local web app to record live sessions, explore reports, compare commits and export PDFs. See [Dashboard](doc:dashboard).
- **Works behind a login.** A login form, the browser prompt, a token or cookie, or you in the window. See [Signing in](doc:signing-in).

## How a run works

```
your app (dev server) ──▶ Chrome, launched by Spectra
                              │  trace + CPU samples + in-page probe
                              ▼
               analysis: tasks → functions → files → components
                              ▼
         findings ──▶ your agent · terminal · .spectra/ · dashboard · JSON
```

## Principles

- **Local.** Everything runs on your machine. No account, no telemetry, no uploads.
- **Measured.** A change is kept because the numbers say so, not because the code looks right. See [How improve decides](doc:harness).
- **Safe.** Automatic exploration never clicks delete, pay, log out or anything else destructive, and unattended fixes happen in a copy of your code. See [Golden paths](doc:golden-paths) and [Checks and safety](doc:harness-safety).
- **Honest numbers.** Spectra profiles development builds, so trust the *ranking* of what is slow more than the absolute milliseconds, and compare runs taken the same way.
- **Free and open source.** MIT licensed, made by [Progen Labs](https://github.com/progen-labs).
