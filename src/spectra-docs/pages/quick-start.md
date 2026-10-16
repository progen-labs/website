From the root of your project:

```bash
npx spectra performance
```

With no `--url`, Spectra:

1. detects your framework and starts your dev server,
2. records a baseline page load,
3. discovers the actionable elements on the page (links, buttons, inputs, forms),
4. synthesizes and runs **golden-path journeys**, skipping anything destructive,
5. prints a performance matrix, saves a report for every journey, and stops the server.

```
#  Golden path              Result     TBT     LCP  LongT  Top finding
·  Initial page load        PASS       0ms    84ms      0  [critical] Row is slow to render: 1443ms
1  Click "Long task"        PASS     213ms       —      1  [critical] src/heavy.js spent 586ms of J
2  Click "Layout thrash"    PASS       0ms       —      0  [critical] Row is slow to render: 360ms
Automation: 2/2 golden paths passed.
```

## The fast loop

The full suite takes a minute or two. While you work on one page, profile just its load, which takes seconds:

```bash
npx spectra performance --quick
```

> **New in 0.2.0.** `--quick`, `--runs`, `spectra compare`, `spectra reports`, budgets and `--json` arrive in version 0.2.0. See the [Changelog](doc:changelog).

## Open the dashboard

```bash
npx spectra dashboard --open
```

Every report from this project is listed there, with the culprits, the page map, the call tree and more. See [Dashboard](doc:dashboard).

## Next steps

- [Measure, change, verify](doc:compare) a fix.
- Set [budgets](doc:budgets) and run Spectra in CI.
- Learn to read [the Culprits tab](doc:culprits).
