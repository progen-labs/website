Spectra's GitHub Action checks the performance of every pull request: it profiles the change and its base commit on the same runner, compares them beyond run-to-run noise, enforces your [budgets](doc:budgets), and reports in the job summary or as a pull request comment.

## Add it to a workflow

`.github/workflows/performance.yml`:

```yaml
name: Performance
on: pull_request

permissions:
  contents: read
  pull-requests: write   # only needed for comment: true

jobs:
  spectra:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - uses: progen-labs/spectra@v1
        with:
          compare-to-base: true
          fail-on-regression: true
          comment: true
```

With no `url`, Spectra starts your dev server as [`spectra performance`](doc:cli-performance) does. GitHub-hosted runners already have Chrome.

## What it does

1. **Profiles this commit**: three page loads, reported as medians. With `mode: golden-paths` it runs the page's [user journeys](doc:golden-paths) instead.
2. **Profiles the base commit** (`compare-to-base: true` on pull requests): it checks the base out in a separate git worktree, installs its dependencies, and profiles it the same way on the same runner with the same Spectra, so the two sides are comparable.
3. **Compares** them with [`spectra compare`](doc:compare): a change counts only when it is bigger than the noise between runs.
4. **Reports**: a summary on the workflow run, an optional pull request comment that is updated on every push, and the full reports as an artifact you can open with [`spectra dashboard`](doc:dashboard).
5. **Decides**: the check fails when Spectra could not run, when a budget is exceeded, or (with `fail-on-regression`) when the change made performance worse.

## The report

Real output from a pull request that took a one-second loop out of a page:

```
⚡ Spectra performance: ✅ Improved

Confidence: medium. A change counts only when it is bigger than the run-to-run noise.

- ✅ Total blocking time: 587 ms → 0 ms (−100%)
- ✅ Long tasks (> 50 ms): 1 → 0 (−100%)
- ✅ JavaScript CPU time: 640 ms → 5.3 ms (−99%)

| Metric                   | Base   | This change |            |
| Total blocking time      | 587 ms | 0 ms        | ✅ better  |
| Largest contentful paint | 656 ms | 24 ms       | ✅ better  |
| Scripting time           | 637 ms | 1.5 ms      | ✅ better  |

Findings that changed
- ✅ resolved: work.js spent 640ms of JavaScript (99% of CPU)
- ✅ resolved: 640ms long task at 0.02s (HTML parsing)
```

## Inputs

| Input | Default | What it does |
| --- | --- | --- |
| `working-directory` | `.` | The frontend project's folder |
| `url` | empty | A page the workflow already serves; empty starts the dev server |
| `command` | your npm dev script | The command that starts the dev server, e.g. `npm run preview` |
| `mode` | `quick` | `quick` (page-load profile) or `golden-paths` |
| `runs` | `3` | Page loads per side, in quick mode |
| `paths` | `6` | Maximum journeys, in golden-paths mode |
| `config` | `spectra.config.json` | The budgets file |
| `compare-to-base` | `false` | Also profile the pull request's base commit and compare |
| `install-command` | from the lockfile | How to install the base commit (`npm ci`, `yarn install --frozen-lockfile` or `pnpm install --frozen-lockfile`) |
| `base-sha` | the pull request's base | The commit to compare with |
| `fail-on-budget` | `true` | Fail when a budget is exceeded |
| `fail-on-regression` | `false` | Fail when the verdict is *regressed* or *mixed* |
| `comment` | `false` | Post the report on the pull request and keep it updated |
| `spectra-version` | the project's, else latest | The Spectra version to run |
| `chrome-sandbox` | `false` | Keep Chrome's sandbox on Linux runners |
| `artifact-name` | `spectra-reports` | The artifact that holds the reports |

## Outputs

| Output | Value |
| --- | --- |
| `result-file` | The [JSON result](doc:json-output) of this commit |
| `summary-file` | The Markdown report |
| `verdict` | `improved`, `regressed`, `mixed` or `neutral` (with `compare-to-base`) |
| `over-budget` | `true` when a budget was exceeded |

## Tips

- **Runner noise.** Shared CI machines are noisier than laptops. Comparing on the same runner, as `compare-to-base` does, cancels most of it; keep budgets generous and `runs` at 3 or more.
- **Already serving the app?** Pass `url`, and Spectra profiles that instead of starting a dev server.
- **Monorepos.** Point `working-directory` at the frontend package.
