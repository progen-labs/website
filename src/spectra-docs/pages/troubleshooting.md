| Symptom | Cause and fix |
| --- | --- |
| **Chrome was not found** | Set `CHROME_PATH` to the executable, for example `CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"`. The same applies when printing a PDF |
| Syntax or engine errors when starting | Spectra needs Node.js 22.12 or newer. Check with `node -v` |
| **No --url given** and the dev server never becomes ready | Spectra waits for your dev command to print a localhost URL. Pass `--command "<your dev command>"`, raise `--boot-timeout`, or start the server yourself and pass `--url` |
| Red banner: **The page answered HTTP 4xx/5xx** | The page failed to load: usually signed out, or the backend or dev server is down. See [Signing in](doc:signing-in) |
| Amber pill: **No React seen** | Press **Reload**, or record a page load. The probe must be installed before the framework loads |
| **Production build: no timings** | You are profiling a built bundle. Profile the dev server |
| **Almost nothing ran** | The recording was idle. Interact while recording, use a [scenario](doc:quick-profiles), or use `--quick` |
| Everything is attributed to one bundle, and the notes say there are no source maps | A production or minified bundle. Use the dev server |
| Lines show `≈` | Expected without source maps: the line was found by the function's name |
| Analysing takes very long or fails | The trace is huge. Record for less time, close other heavy tabs, and avoid 6× throttling on long sessions |
| **Attach** can't connect | Start Chrome with `--remote-debugging-port=9222 --user-data-dir=/tmp/spectra-chrome` and attach to `http://127.0.0.1:9222` |
| Chrome can't start because **another Chrome is using the profile** | Close the dashboard's Chrome first, or give the second run its own profile: `PERF_CHROME_PROFILE_DIR=/tmp/spectra-2 npx spectra …` |
| The dashboard's port is in use | `npx spectra dashboard --port 5000` |
| `compare`: **This is a raw Chrome trace** | Compare needs Spectra reports, not `.trace.json` files. Use a report id, a report file or an `--out` result |
| `compare`: **is a golden-path evaluation** | Compare single-page profiles: run `--quick --runs 5 --out` for each side, or compare two journey reports by id |
| `compare`: **No commit … in this repository** | The hash is not in your local clone. `git fetch` it first, then **Look up** again |
| **The raw trace of this recording was not kept** | Only the newest recording's trace stays in memory. Tick **Save raw trace**, or pass `--save-trace`, before recording |
| The launched Chrome has none of your extensions or logins | Expected: Spectra uses a clean, separate profile so extensions can't distort measurements |
| The MCP server won't connect in Claude Code (`/mcp` shows it failed) | Needs Spectra 0.3.0 or later: if your project pins an older version, update it with `npm install --save-dev @progen-labs/spectra@latest`. On Windows, start it through `cmd /c npx …`. See [MCP server](doc:mcp-server) |
| `spectra fix`: **commit or stash your changes first** | The harness works on a copy of your last commit. Commit or stash, then run it again |
| `spectra fix`: **no checks to run** | Add a `test` script, pass `--check "<cmd>"`, or pass `--no-checks` on purpose. See [Checks and safety](doc:harness-safety) |
| `spectra fix`: **fails before any change** | One of your checks already fails on your last commit. Fix it, or choose other checks with `--check` |
| `spectra fix`: **Claude Code cannot work: Not logged in** | Sign in to Claude Code first (run `claude` once), set `SPECTRA_CLAUDE` to its path, or use `--agent "<command>"` |
| An exit code of `2` | A budget was exceeded, or `compare --fail-on-regression` found a regression. The tables above the exit say which. See [Budgets and CI](doc:budgets) |

If something else goes wrong, the terminal prints the error, and the dashboard shows it in a red bar. Please [open an issue](https://github.com/progen-labs/spectra/issues) with the message.
