Budgets turn Spectra into a check: set upper limits, and any run that goes over one fails with exit code 2.

> **New in 0.2.0.**

## spectra.config.json

Create `spectra.config.json` in your project root:

```json
{
  "$schema": "./node_modules/@progen-labs/spectra/schema/config.schema.json",
  "budgets": {
    "tbtMs": 200,
    "lcpMs": 2500,
    "cls": 0.1,
    "criticalFindings": 0
  }
}
```

The `$schema` line is optional. It gives your editor autocompletion and validation. Use `--config <file>` to read budgets from another file.

## Available budgets

Every budget is an upper limit, and lower is better for all of them.

| Budget | Measures |
| --- | --- |
| `tbtMs` | Total blocking time (ms) |
| `lcpMs` | Largest contentful paint (ms), page loads only |
| `fcpMs` | First contentful paint (ms), page loads only |
| `cls` | Cumulative layout shift |
| `inpMs` | Slowest interaction (ms), when the page was interacted with |
| `ttfbMs` | Time to first byte (ms) |
| `longTaskCount` | Number of tasks over 50 ms |
| `maxLongTaskMs` | The longest task (ms) |
| `scriptingMs` | JavaScript scripting time (ms) |
| `forcedLayoutCount` | Forced synchronous layouts |
| `domNodes` | DOM nodes |
| `heapUsedMb` | JavaScript heap in use (MB) |
| `transferKb` | Bytes transferred (KB) |
| `criticalFindings` | Number of critical findings |
| `findingCount` | Number of findings of any severity |

An unknown budget name or a negative limit is an error (exit code 1), so a typo can never pass silently.

## What gets checked

- **Single-page profiles** (`--quick`, `--mode`): the **median** across all `--runs`.
- **The golden-path suite**: **every journey**. The table names the journey that broke a budget.
- A metric the recording did not measure, such as LCP during an interaction, is **skipped**, never failed.

```
Budgets: 2 over budget
  ✓ Total blocking time                0 ms  limit 200 ms
  ✗ Scripting time                   1.46 s  limit 500 ms
  ✗ Critical findings                     3  limit 0
```

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | Done, and within budget |
| `1` | Could not run: no Chrome, the server is down, or bad options or config |
| `2` | Ran, but a budget was exceeded, or `compare --fail-on-regression` found a regression |

## In CI

Any CI system that can run Node and Chrome can run Spectra. The exit code fails the job:

```bash
npm ci
npx spectra performance --quick --runs 3 --out spectra-result.json
```

Keep `spectra-result.json` and `.spectra/reports/` as build artifacts, so failures can be opened in the dashboard afterwards. CI machines are slower and noisier than laptops: leave headroom in your budgets and use `--runs 3` or more.
