Lists the reports saved for this project, newest first.

```bash
npx spectra reports
```

```
Report id                 Mode    Findings  Critical  URL
20261016T190528-load      load          13         3  http://localhost:5188/
20261016T190524-load      load          13         3  http://localhost:5188/

2 shown · /my-app/.spectra/reports
```

| Option | Default | Description |
| --- | --- | --- |
| `--limit <n>` | `20` | How many reports to show |
| `--json` | off | Print them as JSON (`kind: "reports"`) |

## Where reports live

Every recording is saved in `.spectra/reports/` in your project:

| File | What it is |
| --- | --- |
| `<id>.json` | The full report: vitals, totals, files, functions, components, network and findings |
| `<id>.page.jpg` | A screenshot of the page when recording stopped, used by the [Page map](doc:dashboard-tabs) |
| `<id>.trace.json` | The raw Chrome trace, only with `--save-trace` or when exported from the dashboard |
| `evaluation-<time>.json` | The summary of a golden-path run |

A report id is the recording's start time in UTC plus its mode, for example `20261017T101500-load` or `20261017T101500-live`. Pass ids to [`spectra compare`](doc:compare), or open the reports in the [dashboard](doc:dashboard).

Reports contain file paths, URLs and a screenshot of your page. Review them before sharing; see [Privacy and safety](doc:privacy).
