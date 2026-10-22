Installing Spectra teaches your AI coding agent what Spectra does. You can then ask in plain words, and the agent runs the right Spectra command and reads the result for you:

- "Why is the checkout page slow?"
- "Profile the home page three times and tell me the worst problem."
- "Did my last change make it faster?"
- "Fail the build if total blocking time goes over 200 ms."
- "The app needs a login. Profile the dashboard behind it."

## What happens when you install it

```bash
npm install --save-dev @progen-labs/spectra
```

After the install, Spectra writes its **knowledge doc** where your agents read their project instructions. The doc covers what Spectra does, which command answers which request, how to read the JSON results, how to prove a change made things faster, budgets, signing in, and the rules an agent should follow, such as never asking for a password in the chat. You can read it with `npx spectra agents --print`.

| Agent | Where it goes |
| --- | --- |
| **Any agent that reads `AGENTS.md`**: OpenAI Codex, GitHub Copilot's coding agent, Cursor, Windsurf, Zed, Jules, Amp and others | A Spectra block in `AGENTS.md` at the project root (always) |
| **Claude Code** | A `spectra` skill in `.claude/skills/spectra/SKILL.md`, and a short note in `CLAUDE.md` |
| **GitHub Copilot** in VS Code, Visual Studio and JetBrains | `.github/instructions/spectra.instructions.md` |
| **Cursor** | `.cursor/rules/spectra.mdc` |
| **Windsurf** | `.windsurf/rules/spectra.md` |
| **Cline** and **Roo Code** | `.clinerules/spectra.md` and `.roo/rules/spectra.md` |
| **Gemini CLI** | A Spectra block in `GEMINI.md` |

`AGENTS.md` is always written. The others are written for the agents your project or machine uses: Spectra looks for each agent's folder in the project (such as `.cursor`) or in your home folder (such as `~/.claude`, or VS Code for Copilot). Commit the files, and everyone on the team gets the same help.

**Your own text is never touched.** In a shared file such as `AGENTS.md` or `CLAUDE.md`, Spectra only writes between `<!-- spectra:start -->` and `<!-- spectra:end -->`. A file of Spectra's own carries a `spectra:managed` marker, and Spectra never overwrites a file without it. Updating Spectra updates the doc, and only the doc.

## Do it by hand

pnpm and Bun don't run a package's install step until you allow it, and npm skips it with `--ignore-scripts`. In those cases, or to update or pick the agents yourself:

```bash
npx spectra agents                       # the agents this project or machine uses, and AGENTS.md
npx spectra agents --all                 # every supported agent
npx spectra agents --only claude,copilot # just these
npx spectra agents --list                # which agents were detected
npx spectra agents --remove              # take it all back out
```

The agent ids are `agents-md`, `claude`, `cursor`, `copilot`, `windsurf`, `cline`, `roo` and `gemini`.

## Turn it off

For one install, set `SPECTRA_AGENT_DOCS=0`. For the whole project, in `spectra.config.json`:

```json
{ "agentDocs": false }
```

Or list the agents to write for, such as `"agentDocs": ["copilot"]`. Spectra never writes the doc in CI, for a global install, or when you run it with `npx` without installing it.

## Going further

- The [MCP server](doc:mcp-server) gives agents Spectra's tools directly (`profile_page`, `verify_change` and more), with progress and cancellation.
- The [Claude Code plugin](doc:claude-code) adds skills that fix problems one at a time and keep a change only when Spectra measures an improvement.
- The [VS Code extension](doc:vscode) shows each finding on its line, and offers Spectra's MCP server to Copilot's agent mode.
