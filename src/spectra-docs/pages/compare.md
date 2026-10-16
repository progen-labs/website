Performance numbers are noisy. `spectra compare` answers "did my change make it faster?" without being fooled by that noise.

## Measure, change, verify

```bash
npx spectra performance --quick --runs 5 --out before.json
# make your change, then:
npx spectra performance --quick --runs 5 --out after.json
npx spectra compare before.json after.json
```

```
Spectra compare — IMPROVED (confidence: medium)
Before: 3 runs · commit 4342a06
After:  3 runs · commit 4342a06

  ✓ JavaScript CPU time: 1.52 s → 92.1 ms (−94%)
  ✓ Row (src/Row.jsx) — render time: 1.44 s → 7.4 ms (−99%)

Key metric                       Before      After   Change  Verdict
Total blocking time                0 ms       0 ms       0%  same
Largest contentful paint         100 ms    72.0 ms     −28%  same
JavaScript CPU time              1.52 s    92.1 ms     −94%  improved
…
Findings: 3 resolved · 2 new · 10 still present
  resolved  [critical] Row is slow to render: 1444ms total, 0.2ms per render (7200×)
```

## What a side can be

| Input | Example |
| --- | --- |
| A result file written by `--out` (all of its runs) | `before.json` |
| A report id from [`spectra reports`](doc:reports) | `20261017T101500-load` |
| A report file | `./perf_3fa516c_load.json` |
| Several ids or files, joined by commas | `20261017T101500-load,20261017T101510-load` |

## How a change is decided

- Each side is reduced to the **median** of its runs.
- A difference counts only when it is bigger than **all three** of: the metric's absolute floor (for example 50 ms of blocking time), its relative floor (for example 10%), and the **spread** between runs on either side. Anything smaller is *within noise*.
- A finding exists on a side when it appears in at least half of that side's runs. Findings are matched across sides by identity, not by position.
- A metric that was not measured on both sides is reported as *n/a*, never as unchanged.

## The verdict

The overall verdict uses only the **key metrics**: total blocking time, long tasks, slowest interaction, LCP, layout shift, JavaScript CPU time, forced reflows, wasted renders and JS heap growth.

| Verdict | Meaning |
| --- | --- |
| **Improved** | Some key metrics improved and none got worse |
| **Regressed** | Some got worse and none improved |
| **Mixed** | Some of each |
| **No significant change** | Every difference is within noise |

**Confidence** is *high* with three or more runs per side and comparable recordings, *medium* with fewer runs or a warning, and *low* when the recordings are not really comparable. The **Comparability** list explains why: different pages, modes or CPU throttling, very different lengths, too few runs, error pages, near-idle recordings, uncommitted changes, and so on.

## Options

| Option | Description |
| --- | --- |
| `--json` | Print the comparison as JSON on stdout, see [JSON output](doc:json-output) |
| `--out <file>` | Also write it to a file |
| `--fail-on-regression` | Exit with code 2 when the verdict is *regressed* or *mixed* |

## Tips for a trustworthy comparison

- Use the same machine, browser, page and options on both sides.
- Record three or more runs per side (`--runs 3` or more).
- Page-load profiles (`--quick`) are the most repeatable. For interactions, use the same [scenario](doc:quick-profiles) on both sides.
- Commit or stash your work between sides, so each side's commit hash describes what was measured.

To compare commits visually and export a PDF for a pull request, use the dashboard's [Compare commits](doc:compare-commits) tab.
