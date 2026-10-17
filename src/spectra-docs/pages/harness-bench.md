The **test bench** checks that the [AI fix harness](doc:harness) makes the right decisions, and measures what a real agent achieves with it. It lives in Spectra's repository (`bench/`) and runs in CI on every change.

## The cases

Each case copies Spectra's React demo app into a fresh git project with a behaviour check (`npm test` loads the running app at `$SPECTRA_FIX_URL` and checks its heading, three buttons and all 120 rows), runs `spectra fix` on it, and states what the harness must decide. A scripted agent applies each case's change, so the decision is the only thing being tested.

| Case | The change | The harness must |
| --- | --- | --- |
| `memoize` | A real fix: Row's expensive work moves into `useMemo`, so it runs once per row instead of on every render | **keep** it |
| `breaks-page` | "Faster" by cheating: Row stops rendering anything | **undo** it: the behaviour check fails |
| `no-gain` | A cosmetic change: a comment | **undo** it: no measurable improvement |
| `touches-config` | An edit to `package.json` | **undo** it: out of scope |

The latest run:

```
Case            Expected        Got             Result
memoize         kept            kept            ✓  JavaScript CPU time: 1.56 s → 153 ms (−90%)
breaks-page     checks-failed   checks-failed   ✓  "npm test" failed
no-gain         no-gain         no-gain         ✓  no measurable improvement: every change was within run-to-run noise
touches-config  out-of-scope    out-of-scope    ✓  changed package.json, which a fix may not touch (dependencies, configuration, tests and CI are off limits)

4/4 cases decided correctly.
```

The `breaks-page` case matters most: its change makes the page faster by rendering nothing, and the harness still undoes it.

## Run it

From Spectra's repository, with the dependencies installed:

```bash
npm run bench
```

Every case with the scripted agent, about 40 seconds each. The exit code is 0 only when every case is decided correctly.

```bash
npm run bench -- --case memoize
```

One case.

```bash
npm run bench -- --agent claude
```

A real agent instead: Claude Code (signed in) works on the demo app for up to three findings, with a spending cap of $1 per finding (`--budget` to change it). The bench reports which findings it fixed, by how much, what it cost, and why each other attempt was undone. `--agent "<cmd>"` runs any agent the same way.

`--keep` leaves each case's project in your temp directory to inspect.

## Add a case

Cases are in `bench/cases.js`: an id, a description, the change the scripted agent applies (a file, the code to find and its replacement) and the decision expected: `kept`, `checks-failed`, `no-gain`, `out-of-scope`, `slower`, `mixed`, `new-problem` or `unproven`.
