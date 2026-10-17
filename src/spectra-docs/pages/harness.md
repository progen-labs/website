Spectra's **AI fix harness** turns "find the slow code, fix it, check the fix" into one unattended step. `spectra fix` hands the costliest findings in your own code to a coding agent, one at a time, and keeps a change only when your checks still pass and Spectra measures the page faster, beyond run-to-run noise. Kept changes arrive as commits on a new branch, ready for you to review.

> **New in 0.4.0** (the next release).

```video fix-harness
A test-bench run on Spectra's demo app: the harness keeps a real fix (JavaScript CPU time 1.57 s → 152 ms) and undoes a "faster" change that broke the page.
```

## What a harness is

A coding agent is a model that can read and edit code: Claude Code, for example. A **harness** is the program around the agent. It decides what the agent works on, what it may change, how its work is checked, and what happens when the work isn't good enough.

Spectra's harness keeps every one of those decisions in Spectra's own code rather than in the agent's instructions. A change is never kept because the agent says it worked: it is kept because your checks passed and Spectra measured the improvement.

## Who does what

| Job | The agent | The harness |
| --- | --- | --- |
| Choose what to fix | | Ranks the findings in your own files, most costly first |
| Change the code | One focused change per finding | |
| Check the app still works | | Runs your tests, type check and build |
| Measure | | Profiles the page before and after, and compares beyond the noise |
| Decide | | Keeps the change as a commit, or undoes it, by fixed rules |
| Record | One sentence about its change | The commit with its evidence, a report and a history |

By default the agent is [Claude Code](https://claude.com/claude-code) in headless mode, allowed only to read and edit files: no shell, no web access, no MCP servers. Any other agent works through `--agent`. See [spectra fix](doc:cli-fix).

## The loop

```
your last commit ──▶ a copy on branch spectra/fix-<time>   (your files are never touched)
                         │  its own dev server · your checks must pass first
                         ▼
                     baseline: 3 page loads
                         ▼
        ┌──▶ the costliest finding in your code
        │        ▼
        │    the agent makes one change
        │        ▼
        │    scope rules ──✗──┐
        │        ▼            │
        │    your checks ─✗───┤
        │        ▼            │
        │    measure + compare ─✗── undo
        │        ▼ improved, beyond the noise
        └─── commit: the change and its evidence
                         ▼
          report: before → after for all kept fixes
```

Each fix is measured against the code as it stands after the fixes kept before it, and the report compares the original baseline with the final result. The details are in [Checks and safety](doc:harness-safety).

## When it helps

The harness works best on problems with a clear, local cause and a measurable cost:

- components that render far more often, or far more slowly, than they need to;
- props recreated on every render, and expensive work repeated inside render;
- long lists, layout thrashing, and heavy code that could load later.

It makes one small change per finding. Architectural problems, such as data-fetching waterfalls or how the app is split into bundles, rarely have a one-change fix: the harness reports them as not fixed rather than forcing a large change.

## What it is not

- **Not a model.** You bring the agent; Spectra supplies the measurements, the rules and the record.
- **Not an auto-merge.** It never pushes, never merges, and never touches your working tree. You review the branch like any pull request.
- **Not a replacement for your tests.** It can only keep behaviour that your checks protect. See [Checks and safety](doc:harness-safety).

## How we know it works

The [test bench](doc:harness-bench) runs the harness against Spectra's demo app in CI on every change: a real fix must be kept, a change that breaks the page must be caught by the checks, a cosmetic change must not count, and an edit to `package.json` must be refused.
