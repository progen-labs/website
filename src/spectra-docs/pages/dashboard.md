`spectra dashboard` starts a local web app for recording live sessions and exploring reports. Nothing needs building: the UI ships prebuilt in the package.

```bash
npx spectra dashboard
npx spectra dashboard --port 5000 --open
```

| Option | Default | Description |
| --- | --- | --- |
| `--port <n>` | `4321`, or `PORT` | Port to serve on |
| `--open` | off | Open it in your browser |

The dashboard listens on `127.0.0.1` only, so it is not reachable from other machines.

```screenshot dashboard-overview
The Spectra dashboard with a recording open on the Culprits tab.
picker: **Report picker.** Every report in `.spectra/reports`, newest first, including the ones the CLI recorded. **Delete** sits beside it.
appearance: **Appearance.** Two themes, each with light and dark modes. See [Appearance](doc:appearance).
connect: **Page to profile.** The page to record, **Launch Chrome**, and **Advanced** for a sign-in URL, headless mode or attaching to a running Chrome.
reportbar: **Report bar.** How this report was recorded (mode, duration, source attribution, commit), with **Snapshot for comparison** and **Trace for Chrome DevTools**.
tabs: **Report tabs.** Culprits, Page map, File tree, Call tree, Components, Long tasks, Network & memory, Golden paths and Compare commits.
hide: **Hide node_modules.** Focuses every view on your own code.
content: **The open tab.** Here, [the Culprits tab](doc:culprits).
```

## Record from the dashboard

1. **Page to profile.** Enter the page to measure, for example `http://localhost:3000/settings`. Open **Advanced** for a **Sign-in URL** (see [Signing in](doc:signing-in)), **Headless**, or **Attach to a running Chrome**.
2. **Launch Chrome.** A separate Chrome window opens on your page. The session card shows the tab, its URL, **Go**, **Reload**, a framework pill such as **✓ React 18.x**, and **Close Chrome**. If it shows **No React seen**, press **Reload** once: the probe has to be installed before your framework loads.
3. **Choose what to measure.**
   - **Record interaction**: press it, use the page in the Chrome window for 10 to 30 seconds, then press **Stop & analyse**.
   - **Record page load**: reloads with the cache disabled and stops by itself a few seconds after the load event. Use it for startup cost, FCP and LCP.
   - **Options**: **CPU throttling** (4× or 6×) exposes problems a fast laptop hides; **Save raw trace for DevTools** keeps the trace.
4. **Read the report.** It opens automatically on the [Culprits](doc:culprits) tab after a few seconds of analysis.
5. **Close Chrome** when you are done.

```screenshot dashboard-session
The session card once Chrome is running on the page.
tab: **Tab.** The tab of the launched Chrome that will be recorded.
address: **Address.** Type a URL and press **Go** to navigate. The sign-in URL is used when the page needs it.
nav: **Go and Reload.** Reload once if the framework pill reports that nothing was seen.
pill: **Framework pill.** Confirms the probe sees your framework, and which version.
close: **Close Chrome.** Ends the session.
interaction: **Record interaction.** Records while you use the page; press **Stop & analyse** when done.
pageload: **Record page load.** Reloads without the cache and stops by itself after the load.
options: **Options.** CPU throttling, and keeping the raw trace for DevTools.
```

To attach to a Chrome you started yourself, launch it with `--remote-debugging-port=9222 --user-data-dir=/tmp/spectra-chrome` and attach to `http://127.0.0.1:9222`. Recent Chrome refuses the debugging port on your default profile.

## Finding your way around

- **The report picker** (top right) lists every report in `.spectra/reports`, including the ones the CLI recorded. **Delete** removes a report together with its screenshot and trace.
- **The report bar** above the tabs shows how the report was recorded (mode, duration, CPU slowdown, source attribution, commit) and holds **Snapshot for comparison** and **Trace for Chrome DevTools**.
- **Hide node_modules** focuses every view on your own code.
- **The tabs**: [Culprits](doc:culprits), then Page map, File tree, Call tree, Components, Long tasks, Network & memory and Golden paths (see [Report tabs](doc:dashboard-tabs)), and [Compare commits](doc:compare-commits).
- **Appearance** switches between two themes, each with light and dark modes. See [Appearance](doc:appearance).
