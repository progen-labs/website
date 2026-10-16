## 0.2.0 (next release)

Faster loops, honest comparisons and machine-readable output. Everything is additive: existing commands and options behave as before.

- **`--quick`**: a single page-load profile, the fast loop. See [Quick and repeated profiles](doc:quick-profiles).
- **`--runs N`**: record several times and report medians, the spread and how many runs saw each finding.
- **`spectra compare`**: noise-aware before and after, from `--out` result files, report ids or report files. `--fail-on-regression` exits with code 2. See [Compare](doc:compare).
- **`spectra reports`**: list saved reports. See [spectra reports](doc:reports).
- **Budgets** in `spectra.config.json`, checked on every run, with exit codes for CI. See [Budgets and CI](doc:budgets).
- **`--json` and `--out`**: a versioned result with published JSON Schemas. Saved reports carry a `schemaVersion`. See [JSON output](doc:json-output).
- **A lighter install**: 29 packages and 33 MB instead of 73 packages and 54 MB, because the dashboard ships prebuilt.
- **Fixed**: relative `--scenario` paths now resolve against your directory. Zero times read "0 ms", and a single run's summary line no longer prints "nullms".
- **Dashboard fixes**: on laptop-sized windows the report tabs wrap instead of hiding **Compare commits** off the edge, and the Long tasks cards keep file names, functions and times inside the card.

## 0.1.3

- **Angular**: per-component change-detection counts and self time from Angular's development-mode profiler.

## 0.1.2

- Fixed every reported dependency vulnerability.

## 0.1.1

- **Vue**: deep component support through Vue's DevTools hook.
- **Next.js**: profiled through React.

## 0.1.0

- First release on npm as `@progen-labs/spectra`.
- `spectra performance`: self-boots your dev server, discovers actionable elements and runs the safe [golden-path suite](doc:golden-paths).
- `spectra dashboard`: the full dashboard with no build step, including PDF export and commit comparison.
