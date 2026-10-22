The dashboard's **Compare commits** tab answers a reviewer's question: *after this commit, what got better, what got worse, and what stayed the same?* It compares two groups of recordings, one on the base commit and one on the commit under review, and exports the result as a **PDF**. It uses the same engine as [`spectra compare`](doc:compare), so the two always agree.

## The workflow

1. **Base commit.** Check out the commit before the change, restart the dev server, and record the same scenario **three times**: same page, same mode, same CPU setting. Page-load recordings are the most repeatable.
2. **Snapshot each recording.** Press **Snapshot for comparison** in the report bar. A dialog shows the commit that was checked out when you recorded (hash, author, message); type another hash and press **Look up** to correct it. Add an optional scenario label, then **Download snapshot**. The file is named after the commit:

```
perf_3fa516cd22_load_20261001-073209_dashboard.json
     └ commit ┘ └mode┘ └ date-time ┘ └ label ┘
```

3. **Commit under review.** Check out the change, restart the dev server, record the same scenario three times and snapshot each recording.
4. **Compare.** On the **Compare commits** tab, add the base snapshots on the **Before** side and the others on the **After** side, by drag and drop or **Upload snapshot(s)**. Reports recorded on this machine can be added straight from the menu, so CLI runs need no snapshot step. If a file carries no commit information, the hash is read from its name.
5. **Export.** Read the verdict, then press **PDF summary** for the pull request or **PDF detailed report** for the record.

```screenshot compare-side
One side of a comparison, filled with three page-load runs on the base commit.
hash: **Commit hash**, read from the recordings. Type another one and press **Look up** to correct it.
facts: **The commit**: hash, author, date, message and branch.
upload: **Upload snapshot(s)**, or drop snapshot files here.
saved: **Add a report recorded on this machine**, including CLI runs.
runs: **The runs on this side.** Medians are used, so add three or more.
```

Why snapshots and not raw traces? A raw Chrome trace has no component data and no source-file attribution. A snapshot is the Spectra report, which holds everything that is compared, and is usually under 1 MB.

## What you see

- **Commits**: each side's hash, author, date, message and branch, with a warning if it was recorded with **uncommitted changes**. Only the author's name is read from git, never the email. **⇄** swaps the sides.
- **Verdict**: *Improved*, *Regressed*, *Mixed* or *No significant change*, with a **confidence** level and the number of metrics that improved, degraded or stayed the same. See [how a change is decided](doc:compare).
- **Highlights**: the biggest moves in plain sentences, such as `Total blocking time: 423 ms → 61.4 ms (−85%)`.
- **Can this comparison be trusted?**: checks that both sides used the same page, mode and CPU throttling, have similar lengths and enough runs, contain component timings, used the same attribution mode, and include no error pages, near-idle recordings or uncommitted changes.
- **Metrics**: about 27 metrics in groups (responsiveness, loading, CPU and main thread, layout work, components, memory and DOM, network), each with before, after, change and a label. Filter by result.
- **What changed, in detail**: for components, files and functions, what degraded, improved, became newly active or stopped being active, and which sub-metric moved. Plus **Problems**: findings that are new, resolved or persisting.

```screenshot compare-verdict
The result of comparing the base commit with one that memoises the list rows and moves the ticker out of `App`.
commits: **The two commits** being compared, with their authors.
pdf: **PDF summary** and **PDF detailed report**, printed locally.
verdict: **Verdict**, confidence and the count of metrics that improved, degraded or stayed the same.
highlights: **Highlights**: the biggest moves in plain sentences. The new `Chart` component is flagged as a new cost.
checks: **Can this comparison be trusted?** Each check passes or explains its concern.
```

```screenshot compare-metrics
The metrics, before and after.
filter: **Filter** by result: all, improved, degraded or unchanged.
table: **Every metric** in its group, with before, after, change and verdict.
```

```screenshot compare-details
What changed, component by component.
tabs: **Components, files, functions and problems**, with how many changed.
pane: **Each change**, naming exactly which sub-metric moved: here `Row` went from 7,200 renders to 120.
```

## The PDF

Both PDFs are printed by the headless Chrome Spectra already uses, on your machine; nothing is uploaded. The file is named `perf-compare_<before>_<after>_<summary|detailed>.pdf`.

```video compare-commits
The two PDFs taken apart: the summary's sections (the report, the two commits, the verdict, highlights and key metrics), then the detailed report's Files page, where each improved file says what changed. The demo app before and after the fixes Claude Code made in the fix-harness test bench.
```

| | **Summary** (about 4 pages) | **Detailed report** (about 10 pages) |
| --- | --- | --- |
| Commit cards, verdict, confidence and highlights | ✓ | ✓ |
| Key metrics with before, after and change | ✓ | all ~27 metrics, grouped |
| Components and files that changed | the top few | every changed component, file and function |
| Problems | the top new and resolved | all, with culprits and fixes |
| Comparability checks | the failed ones | all |
| Recordings used, method and thresholds | | ✓ |

Every page carries both commit hashes and a page number, and no result is shown by colour alone: each has an icon and a word.
