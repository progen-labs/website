Most settings are command-line options. Budgets and how to sign in live in [`spectra.config.json`](doc:budgets). Everything else is an environment variable, all of them optional.

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
| `SPECTRA_AGENT_DOCS` | unset | Set to `0` so Spectra doesn't write its [knowledge doc for AI agents](doc:agents) on its first run |
| `SPECTRA_LOGIN_PASSWORD` | unset | The password for [signing in](doc:signing-in), with a login form or the browser prompt |
| `SPECTRA_LOGIN_USER` | unset | The username, when `--login-user` and `spectra.config.json` don't give one |
| `SPECTRA_LOGIN_TOTP_SECRET` | unset | An authenticator app's secret, so Spectra can answer one-time code steps |
| `SPECTRA_LOGIN_HEADER` | unset | A header to sign in with, as `Name: value`, sent only to the page's own origin |
| `SPECTRA_LOGIN_COOKIES` | unset | Cookies to sign in with, as `name=value; name2=value2` |
| `SPECTRA_LOGIN_STORAGE` | unset | localStorage entries to sign in with, as `key=value; key2=value2` |

## Data on disk

| Location | Contents |
| --- | --- |
| `.spectra/reports/` | Reports, page screenshots, optional raw traces and golden-path summaries. Keep it out of git |
| `.spectra/fix/` | [spectra fix](doc:cli-fix) sessions: each one's report, profiles and (while it runs) its copy of your project, plus `history.json`. Spectra keeps it out of git for you |
| `spectra.config.json` | Your budgets, how to sign in, and `agentDocs`, if any (never secrets: Spectra refuses them). Commit it |
| `AGENTS.md`, `.claude/skills/spectra/`, `.github/instructions/spectra.instructions.md` and the like | Spectra's [knowledge doc for AI agents](doc:agents). Commit them; `npx spectra agents --remove` takes them out |
| Temp directory, `spectra-chrome/<project>-<hash>` | Spectra's private Chrome profile, separate from your own, so your extensions can't distort measurements |
