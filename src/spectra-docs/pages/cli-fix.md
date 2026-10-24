`spectra improve` runs unattended with a coding agent it finds on your machine: Claude Code, Codex CLI, Gemini CLI, GitHub Copilot CLI, Cursor CLI, OpenCode or Amp. This page is about running it with an agent of your own, and about what the agent is told. For everything else, see [Improve the performance](doc:improve).

> `spectra fix` is the old name of `spectra improve`, from 0.4.0. It still works and does the same thing.

## Your own agent

`--agent "<command>"` runs any command in the copy of your project, once per problem:

- The instructions arrive on **stdin**, and in the file named by `$SPECTRA_FIX_PROMPT_FILE`.
- `$SPECTRA_FIX_FINDING` holds the problem as JSON: its title, file, line and cost.
- The agent edits the files and exits with code 0. Its last line of output is recorded as the summary of its change.

```bash
npx spectra improve --agent "./scripts/my-agent.sh"
```

Everything after the agent finishes, from the scope rules to the measurements, is Spectra's job, whichever agent you use.

## The named agents

`--agent <name>` picks one of the agents Spectra knows, when more than one is installed or the one it would choose is not the one you want:

| Name | Runs | Notes |
| --- | --- | --- |
| `claude` | `claude -p …` | Allowed only to read and edit files (no shell, web or MCP), no saved session, a spending cap per problem (`--max-budget-usd`, $2 by default), `--model` to choose the model. `SPECTRA_CLAUDE` names the executable when it is not on your `PATH` |
| `codex` | `codex exec --full-auto …` | |
| `gemini` | `gemini -p … --yolo` | |
| `copilot` | `copilot -p … --allow-all-tools` | |
| `cursor` | `cursor-agent -p … --force` | |
| `opencode` | `opencode run …` | |
| `amp` | `amp -x …` | |

Without `--agent`, Spectra takes the first of these that your project or home folder shows signs of (a `.claude`, `.cursor` or `.gemini` folder, for example), then any that is installed. Each agent run stops after 10 minutes, and an error such as "not logged in" ends the session at once instead of trying every problem.

## What the agent is told

The problem (its title, file and line, cost, where the time went and Spectra's suggested fix) and these rules:

- keep the behaviour exactly the same, and never delete features or hide content to look faster;
- edit only the source files involved, not `package.json`, lockfiles, configuration, tests or CI;
- keep the change small;
- don't run commands: Spectra runs the checks and the measurements afterwards.

The rules guide the agent; they are not what keeps your code safe. Spectra enforces them itself. See [Checks and safety](doc:harness-safety).

## Each kept fix is a commit

Its message carries the evidence:

```
perf: Row is slow to render: 1442ms total, 0.2ms per render (7200×)

Verified by spectra fix: improved (confidence: medium).
- JavaScript CPU time: 1.57 s → 152 ms (−90%)
- Row (src/Row.jsx) — render time: 1.44 s → 35.3 ms (−98%)
Checks passed: npm test.
Finding: src/Row.jsx:3
```

To take the fixes, review and merge the branch:

```bash
git log -p HEAD..spectra/improve-20261025-091201
git merge spectra/improve-20261025-091201
```
