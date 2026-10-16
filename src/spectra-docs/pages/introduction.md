Spectra finds the **file, function and component** that make a frontend slow, and tells you how to fix it.

It drives the Chrome you already have through the Chrome DevTools Protocol, records a trace and a CPU profile, and injects a small probe that watches component renders and Web Vitals. The result is a ranked list of culprits. Each one names the exact function, file and line, shows the evidence, and suggests a fix.

## What it does

- **Profiles in one command.** `npx spectra performance` starts your dev server, finds the things a user can do on the page, drives real journeys and reports the slowest parts of each. See [Quick start](doc:quick-start).
- **Points at code, not symptoms.** Every finding names the function, file and line responsible, mapped back through source maps. See [The Culprits tab](doc:culprits).
- **Understands your framework.** Per-component render counts and timings for React, Next.js, Vue and Angular, and source-mapped file and function attribution for everything else. See [Frameworks](doc:frameworks).
- **Proves a fix worked.** Record a few runs before and after a change, and `spectra compare` reports what got better or worse beyond run-to-run noise. See [Compare](doc:compare).
- **Gates your CI.** Budgets in `spectra.config.json` turn any run into a pass or fail check with exit codes. See [Budgets and CI](doc:budgets).
- **Speaks JSON.** `--json` prints a versioned, schema-described result for scripts, editors and AI agents. See [JSON output](doc:json-output).
- **Comes with a dashboard.** A local web app to record live sessions, explore reports, compare commits and export PDFs. See [Dashboard](doc:dashboard).

```screenshot dashboard-overview
The Spectra dashboard: a click handler in the demo app is the top culprit, with its file, line and fix.
```

## How a run works

```
your app (dev server) ──▶ Chrome, launched by Spectra
                              │  trace + CPU samples + in-page probe
                              ▼
               analysis: tasks → functions → files → components
                              ▼
         findings ──▶ terminal · .spectra/reports · dashboard · JSON
```

## Principles

- **Local.** Everything runs on your machine. No account, no telemetry, no uploads.
- **Safe.** Automatic exploration never clicks delete, pay, log out or anything else destructive. See [Golden paths](doc:golden-paths).
- **Honest numbers.** Spectra profiles development builds, so trust the *ranking* of what is slow more than the absolute milliseconds, and compare runs taken the same way.
- **Free and open source.** MIT licensed, made by [Progen Labs](https://github.com/progen-labs).
