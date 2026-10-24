## Requirements

| Need | Details |
| --- | --- |
| **Node.js 22.12 or newer** | Check with `node -v`. |
| **Chrome, Chromium or Edge** | Spectra drives the browser you already have and never downloads one. It is found automatically on macOS, Linux and Windows; otherwise set `CHROME_PATH`. |
| **Your app's dev server** | Spectra can start it for you, or profile a URL that is already running. |

## Install

```bash
npm install --save-dev @progen-labs/spectra
npx spectra
```

The first command adds the `spectra` command to your project. The second prints what Spectra can do and, the first time it runs in the project, teaches your AI coding agent (Claude Code, GitHub Copilot, Cursor, Codex and others) what Spectra does, so you can ask it in plain words: see [Your AI agent](doc:agents). Nothing happens at install time. Run Spectra with `npx spectra …`, or from your own npm scripts:

```json
{
  "scripts": {
    "perf": "spectra improve",
    "perf:measure": "spectra performance --quick --runs 3"
  }
}
```

Spectra keeps its reports in `.spectra/` inside your project. Keep them out of git:

```bash
echo ".spectra/" >> .gitignore
```

## Profile a development build

Production bundles are minified and drop the per-file and per-component information Spectra needs, and React, Vue and Angular only report component timings in development mode. Development builds are slower than production, so read the **ranking** of what is slow rather than the absolute milliseconds.

## Check that it works

```bash
npx spectra --version
npx spectra --help
```

If Chrome is not found, point Spectra at it:

```bash
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npx spectra performance --quick
```
