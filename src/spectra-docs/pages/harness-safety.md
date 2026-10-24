[`spectra improve`](doc:improve) lets an agent change your code, unattended or step by step, so it is built to make a bad change impossible to keep. These are the rules, all enforced in Spectra's code. The first section is about the unattended mode; everything from **Your checks decide** on applies to the guided loop too.

## Your files are never touched

- Unattended, Spectra works in a **git worktree** of your last commit, on a new branch, inside `.spectra/improve/<time>/`. Your working tree, your branch and your uncommitted work are never touched. (It refuses to start while there are uncommitted changes, because they would not be in the copy.)
- Your `node_modules` is **linked** into the copy, so nothing is installed. Use `--install` for a fresh install instead.
- Every attempt ends as a **commit** on the session branch or is **undone** with `git reset --hard` and `git clean`, so the next attempt always starts from known code.
- Spectra never pushes or merges. The copy is removed when the session ends.

In the **guided loop**, the agent you are talking to edits your working tree directly, the way it does for any other request, and Spectra measures what it did. A change Spectra rejects is for the agent to revert (the instructions say so, and the report records it), so review the working tree before you commit.

## Your checks decide whether the app still works

Speed alone proves nothing: deleting the slow code is always faster. So a change must pass your checks before it is even measured.

- **Default checks**: your `test` script (unless it is npm's "no test specified" placeholder), a type-check script (`typecheck`, `type-check`, `check-types` or `tsc`) and your `build` script, in that order.
- **Your own checks**: `--check "<cmd>"`, as many as you like. Each runs in the copy, with `CI=1`.
- **Checks can test the live app.** `$SPECTRA_FIX_URL` is the copy's running dev server, so a smoke test can load the page and look at it, the way the [test bench](doc:harness-bench) checks that all 120 rows of its demo still render.
- **Checks must pass before any change.** A check that already fails cannot tell a good fix from a bad one, so the session stops and says which one.
- **No checks, no unattended session**, unless you pass `--no-checks` on purpose. The guided loop goes on without checks when your project has none, and says so.

## What a change may touch

Unattended, a change is undone, without being checked or measured, when it:

- edits `package.json` or a lockfile;
- edits configuration: `*.config.*`, `tsconfig*.json`, ESLint, Prettier or Babel settings, or `spectra.config.json`;
- edits tests: `*.test.*`, `*.spec.*`, or files in `__tests__`, `test`, `tests`, `e2e`, `cypress` or `playwright` folders;
- edits CI files in `.github/`;
- deletes a file;
- changes more than 150 lines in total (`--max-lines`).

The guided loop tells the agent the same rules, but does not inspect your working tree, which may hold other work of yours.

## When a change is kept

After the checks pass, the page is profiled again (three page loads by default) and [compared](doc:compare) with the code before the change. The change is kept only when:

- the verdict is **improved**: a key metric got better beyond the run-to-run noise, and none got worse;
- the confidence is **medium or high**;
- it introduced **no new critical finding in your own code** (a dependency, or a vendor chunk the dev server renamed between measurements, does not count).

If the page improved but with **low confidence**, Spectra records more page loads and compares again. If the confidence is still low, the change is undone as *not proven*. A change that is slower, mixed or within the noise is undone.

## What gets attempted

- Only **critical and warning** findings whose file is in your project: never a dependency in `node_modules`, a URL or a file that doesn't exist.
- **One finding per place in the code**, most costly first, up to `--max-fixes` (3 by default).
- A finding that was not fixed in an earlier session is **skipped** (`--retry` tries it again), so Spectra doesn't spend time and money on the same dead end.
- A finding that an earlier kept fix already cleared is skipped too.

## The agents' permissions

Unattended, Claude Code runs with `--permission-mode acceptEdits`, the tools `Read`, `Edit`, `Write`, `Glob` and `Grep` only (`Bash`, `WebFetch` and `WebSearch` are disallowed), no MCP servers (`--strict-mcp-config`), no saved session, and a spending cap per finding (`--max-budget-usd`, $2 by default). Each agent run stops after 10 minutes.

The other agents Spectra can run (Codex, Gemini CLI, Copilot CLI, Cursor, OpenCode, Amp) are given the same instructions, with whatever permissions their own print modes allow; Spectra's rules above still decide what is kept. If an agent cannot work at all, for example because it is not signed in, the session stops at the first finding instead of trying the rest.

## Your code and the agent

Spectra itself sends nothing anywhere. The **agent you choose** reads the files it works on and, if it is a hosted model such as Claude, sends them to its provider. Use an agent and an account that your project's rules allow. See [Privacy and safety](doc:privacy).

## Limits to keep in mind

- **Development builds.** Spectra measures your dev server, where component timings exist. A gain measured there usually carries over to production, but not always; confirm important fixes with the [GitHub Action](doc:github-action) or a production build.
- **Measurements on a busy machine** are noisier. Close heavy work while a session runs, or raise `--runs`.
- **Your checks are the safety net.** Spectra can only protect behaviour that your checks test.
