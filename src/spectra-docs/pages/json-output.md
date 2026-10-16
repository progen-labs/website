Every `spectra` command can print a machine-readable result, for scripts, editors, CI and AI agents.

```bash
npx spectra performance --quick --runs 3 --json > result.json
npx spectra performance --quick --json | jq '.summary.tbtMs'
```

- `--json` prints the result on **stdout** and moves every human-readable line (progress, tables) to **stderr**, so the output can be piped safely.
- `--out <file>` writes the same result to a file, with or without `--json`.

## Kinds of result

Every result shares one envelope:

```json
{
  "schemaVersion": 1,
  "kind": "profile",
  "spectraVersion": "0.2.0",
  "createdAt": "2026-10-17T10:15:00.000Z"
}
```

| `kind` | Written by | Holds |
| --- | --- | --- |
| `profile` | `performance --quick` or `--mode` | `runs` (id, report file, summary), `summary` (medians), `spread`, `representativeRunId`, `findings`, `budgets` |
| `evaluation` | `performance` (golden paths) | `journeys` (a summary and the top 5 findings each), `passed`, `total`, `skippedDestructive`, `budgets` |
| `compare` | `compare` | `comparison`: verdict, confidence, headlines, metrics, findings added, resolved and persisting, comparability checks |
| `reports` | `reports --json` | `reports` |

A result points at the full reports on disk (`runs[].file`, `journeys[].reportFile`) instead of embedding them, so it stays small.

## A finding

```json
{
  "id": "slow-component-Row-src/Row.jsx",
  "severity": "critical",
  "category": "React",
  "title": "Row is slow to render: 1444ms total, 0.2ms per render (7200×)",
  "impactMs": 1444.1,
  "file": "src/Row.jsx",
  "line": 3,
  "fix": "Move expensive calculations into useMemo, virtualise long lists, and avoid deriving large data structures inside render.",
  "culprits": [
    { "fn": "Row", "file": "src/Row.jsx", "line": 3, "lineKind": "exact", "ms": 1444.1, "note": "slow render" }
  ],
  "seenIn": 3
}
```

`lineKind` is `exact` (from a source map) or `located` (found by searching the source for the function's name). `seenIn` appears on profiles with several runs. Each culprit also carries `abs`, the absolute path on the machine that recorded it.

## Summary metrics

`summary`, `runs[].summary` and `journeys[].summary` hold the same headline numbers as [budgets](doc:budgets): `tbtMs`, `lcpMs`, `fcpMs`, `cls`, `inpMs`, `ttfbMs`, `longTaskCount`, `maxLongTaskMs`, `scriptingMs`, `forcedLayoutCount`, `domNodes`, `heapUsedMb`, `transferKb`, `criticalFindings` and `findingCount`. A metric is `null` when the recording did not measure it.

## Schemas and stability

The package ships JSON Schemas:

- `@progen-labs/spectra/schema/result.schema.json` describes every kind of result.
- `@progen-labs/spectra/schema/config.schema.json` describes `spectra.config.json`.

Additive changes keep `schemaVersion`; a breaking change bumps it. Saved reports carry their own `schemaVersion` too. From JavaScript, the helpers that build results are exported:

```js
import { summarize, checkBudgets, SUMMARY_METRICS } from '@progen-labs/spectra/result';
```
