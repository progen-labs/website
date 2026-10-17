Most settings are command-line options. Budgets live in [`spectra.config.json`](doc:budgets). Everything else is an environment variable, all of them optional.

| Variable | Default | Purpose |
| --- | --- | --- |
| `CHROME_PATH` | found automatically | The Chrome, Chromium or Edge executable to drive |
| `PERF_CHROME_ARGS` | none | Extra Chrome flags, separated by spaces |
| `PERF_CHROME_PROFILE_DIR` | a per-project folder in your temp directory | Spectra's private Chrome profile. Give a second run its own profile to record in parallel |
| `PERF_FRONTEND_DIR` | the current directory | The project root used to map files and show source |
| `PERF_REPORTS_DIR` | `.spectra/reports` in the project | Where reports are saved and read |
| `PERF_TARGET_URL` | `http://localhost:3000/` | The page pre-filled in the dashboard |
| `PERF_TARGET_NAME` | the `name` in your `package.json` | The project name shown in the dashboard and PDFs |
| `PORT` | `4321` | The dashboard's port, when `--port` is not given |
| `SPECTRA_MCP_ALLOW_REMOTE` | unset | Set to `1` to let the [MCP server](doc:mcp-server) profile pages that are not on this machine |

## Data on disk

| Location | Contents |
| --- | --- |
| `.spectra/reports/` | Reports, page screenshots, optional raw traces and golden-path summaries. Keep it out of git |
| `.spectra/fix/` | [spectra fix](doc:cli-fix) sessions: each one's report, profiles and (while it runs) its copy of your project, plus `history.json`. Spectra keeps it out of git for you |
| `spectra.config.json` | Your budgets, if any. Commit it |
| Temp directory, `spectra-chrome/<project>-<hash>` | Spectra's private Chrome profile, separate from your own, so your extensions can't distort measurements |
