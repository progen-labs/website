`spectra performance` measures your app without changing anything. By default it runs the **golden-path suite**: a baseline page load plus a set of automatically discovered user journeys. Add `--quick` or `--mode` for a [single-page profile](doc:quick-profiles) instead. To have the problems it finds fixed, see [Improve the performance](doc:improve).

```bash
npx spectra performance [options]
```

## Where it runs

- **No `--url`.** Spectra detects your framework, picks your dev command from `package.json` (the first of `dev`, `start`, `serve` and `develop`), starts it, waits for the localhost URL it prints, profiles, and stops it again. Status lines go to stderr.
- **`--url <page>`.** Profile a server that is already running. Nothing is started or stopped.

## Options

| Option | Default | Description |
| --- | --- | --- |
| `--url <page>` | self-boot | Profile an already-running page instead of starting your dev server |
| `--paths <n>` | `12` | Maximum number of golden paths to run |
| `--command "<cmd>"` | your npm dev script | The command that starts your dev server |
| `--boot-timeout <s>` | `60` | How long to wait for the dev server |
| `--headed` | off | Show the browser window while it runs |
| `--login-url <url>`, `--login-user <name>` | none | Sign in before profiling: the login page and the username. The password comes from `SPECTRA_LOGIN_PASSWORD`. See [Signing in](doc:signing-in) |
| `--login <method>` | guessed | `form`, `link`, `http`, `token` or `manual` (you sign in in the Chrome window), see [Signing in](doc:signing-in) |
| `--quick` | off | One page-load profile instead of the suite, see [Quick and repeated profiles](doc:quick-profiles) |
| `--json` | off | Print a machine-readable result on stdout, see [JSON output](doc:json-output) |
| `--out <file>` | none | Also write that result to a file |
| `--config <file>` | `spectra.config.json` | Budgets and sign-in file, see [Budgets and CI](doc:budgets) |

## Examples

```bash
# self-boot and run the full suite
npx spectra performance

# a running server, at most 6 journeys, watching the browser
npx spectra performance --url http://localhost:3000/ --paths 6 --headed

# a custom dev command that needs longer to start
npx spectra performance --command "pnpm dev --port 4000" --boot-timeout 120
```

## Output

The terminal shows the performance matrix: one row per journey with its result, total blocking time, LCP, long-task count and top finding. Below it are the destructive controls that were skipped and, when budgets are set, the budget table. Every journey is saved as a full report in `.spectra/reports/`, together with an `evaluation-<time>.json` summary of the run. Open them with [`spectra dashboard`](doc:dashboard).

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | Done, and within budget |
| `1` | Could not run: no Chrome, the server is down, or bad options or config |
| `2` | Ran, but a budget was exceeded |
