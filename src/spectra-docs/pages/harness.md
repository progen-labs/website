[`spectra improve`](doc:improve) makes every decision itself; the agent only edits. This page is the rules. They are the same whether the AI agent you are talking to makes the changes (the guided loop: `next`, `check`, `report`) or a coding agent on your machine does, unattended, in a copy of your code. The unattended mode, Spectra's **harness**, is what the diagram below shows.

> Since 0.4.0 (as `spectra fix`); the guided loop since 0.7.0.

```video fix-harness
A test-bench run on Spectra's demo app: the harness keeps a real fix (JavaScript CPU time 1.57 s → 152 ms) and undoes a "faster" change that broke the page.
```

## What a harness is

A coding agent is a model that can read and edit code: Claude Code, for example. A **harness** is the program around the agent. It decides what the agent works on, what it may change, how its work is checked, and what happens when the work isn't good enough.

Spectra keeps every one of those decisions in its own code rather than in the agent's instructions. A change is never kept because the agent says it worked: it is kept because your checks passed and Spectra measured the improvement. In the guided loop the agent is told to undo a change that failed, and the report records what happened either way.

## Who does what

| Job | The agent | The harness |
| --- | --- | --- |
| Choose what to fix | | Ranks the findings in your own files, most costly first |
| Change the code | One focused change per finding | |
| Check the app still works | | Runs your tests, type check and build |
| Measure | | Profiles the page before and after, and compares beyond the noise |
| Decide | | Keeps the change as a commit, or undoes it, by fixed rules |
| Record | One sentence about its change | The commit with its evidence, a report and a history |

Unattended, the agent is one Spectra finds on your machine (Claude Code, Codex, Gemini CLI, Copilot CLI, Cursor, OpenCode or Amp); Claude Code runs allowed only to read and edit files. Any other agent works through `--agent`. See [Your own agent](doc:cli-fix).

## The loop

```
your last commit ──▶ a copy on branch spectra/improve-<time>   (your files are never touched)
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

Each fix is measured against the code as it stands after the fixes kept before it, and the report compares the original baseline with the final result. One fix often clears several findings (memoising a slow row also quiets the file its render work lives in), so after each kept fix the harness skips any finding the new measurement no longer shows, rather than paying an agent to fix it again. The details are in [Checks and safety](doc:harness-safety).

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

The [test bench](doc:harness-bench) runs the harness against Spectra's demo app in CI on every change: a real fix must be kept, a change that breaks the page must be caught by the checks, a cosmetic change must not count, and an edit to `package.json` must be refused. The guided loop shares the code that ranks problems and judges changes, and has its own tests.
