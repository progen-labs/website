`spectra mcp` runs Spectra as a [Model Context Protocol](https://modelcontextprotocol.io) server, so AI coding assistants can profile a page, read the findings, change the code and verify the change. It works with any MCP client: Claude Code, Claude Desktop, Cursor, VS Code, Windsurf and others.

> **New in 0.3.0.** Needs Spectra 0.3.0 or later.

```video mcp-server
Set-up, the six tools, a profile_page call with progress, and verify_change. Every result shown is real output from the server.
```

```bash
npx -y @progen-labs/spectra mcp [--project <dir>] [--allow-remote]
```

The server speaks MCP over stdio, so your client starts it; you don't run it yourself.

## Add it to your client

**Claude Code.** Use the [plugin](doc:claude-code), or add the server alone:

```bash
claude mcp add spectra -- npx -y @progen-labs/spectra mcp
```

**Claude Desktop**, in `claude_desktop_config.json`, and other clients that use the same `mcpServers` format:

```json
{
  "mcpServers": {
    "spectra": {
      "command": "npx",
      "args": ["-y", "@progen-labs/spectra", "mcp", "--project", "/absolute/path/to/your/app"]
    }
  }
}
```

**Cursor**, in `.cursor/mcp.json` in your project: the same `mcpServers` block.

**VS Code** (agent mode): the [Spectra extension](doc:vscode) offers the server automatically on VS Code 1.101 and later. Without the extension, add it in `.vscode/mcp.json`:

```json
{
  "servers": {
    "spectra": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@progen-labs/spectra", "mcp", "--project", "${workspaceFolder}"]
    }
  }
}
```

On Windows, if your client can't start `npx` directly, use `"command": "cmd"` with `"args": ["/c", "npx", "-y", "@progen-labs/spectra", "mcp", …]`.

## Tools

| Tool | Arguments | Returns |
| --- | --- | --- |
| `profile_page` | `url`, `runs` (1–10, default 3), `mode` (`load` or `live`), `scenario`, `duration`, `throttle`, `maxFindings` | Medians and spread, budgets, the ranked findings with file, line and fix, report ids, and a **result file** |
| `verify_change` | `baseline` (a `profile_page` result file), `runs`, `scenario`, `maxFindings` | Re-profiles the same page the same way, then the verdict, confidence, metrics beyond the noise, and findings resolved or new |
| `compare_profiles` | `before`, `after`: result files, report ids or comma-joined ids | The same comparison, without recording |
| `run_golden_paths` | `url`, `paths` (1–12, default 6) | The [golden-path](doc:golden-paths) matrix, in safe mode |
| `list_reports` | `limit` | Saved reports, newest first |
| `get_report` | `id`, `section` (`overview`, `findings`, `components`, `functions`, `files`, `long_tasks`, `network`), `limit` | One section of a report |

Leave out `url` and Spectra starts the project's dev server, as [`spectra performance`](doc:cli-performance) does. Every profiling tool runs the regular CLI with `--json`, so the numbers match a run by hand, and every report lands in `.spectra/reports` where the [dashboard](doc:dashboard) can open it.

Each result is a short text written for the model, plus the full data as structured content:

```
Profiled http://localhost:5188/ — 3 page-load runs (medians).
Result file: .spectra/results/profile-20261017T045006.json  (pass it to verify_change as "baseline", or to compare_profiles)

TBT 0 ms · LCP 120 ms (116 ms–132 ms) · FCP 120 ms · CLS 0.002 · long tasks 0 · scripting 1.49 s (1.47 s–1.49 s) · DOM 816 nodes
Budgets: none set (add a spectra.config.json to enforce limits).

Findings (13, most costly first; showing 3):
1. [critical] Row is slow to render: 1441ms total, 0.2ms per render (7200×) — src/Row.jsx:3 (1.44 s), seen in 3/3 runs
   Fix: Move expensive calculations into useMemo, virtualise long lists, and avoid deriving large data structures inside render.
```

## Which project

The first that applies:

1. `--project <dir>`.
2. The first root your client shares (MCP roots), which is usually your open workspace.
3. The directory the client starts the server in.

## Safety

- **Local pages only.** The server profiles `localhost`, `127.x.x.x`, `::1` and `*.localhost` pages, so a prompt can't point it at someone else's site. Start it with `--allow-remote` (or set `SPECTRA_MCP_ALLOW_REMOTE=1`) to lift that.
- **Scenario files** must be inside the project.
- **Untrusted text.** Results remind the model that titles, URLs and labels come from the page and are data, not instructions.
- **Safe journeys.** `run_golden_paths` skips destructive controls, as the CLI does.

## Long runs

- Profiling calls run **one at a time**, because they share the project's Chrome profile.
- The server sends **progress notifications** (run 2 of 3, journey 4 of 6) when the client asks for them.
- **Cancelling** a call stops it, closes Chrome, and stops any dev server Spectra started.
- A page load takes about 5 seconds per run; golden paths take about 10 seconds per journey.
