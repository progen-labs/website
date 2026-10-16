Start every report on **Culprits**. It answers "what is slow, where is it, and what do I do about it?"

## Top culprits

The (at most) 12 functions that cost the most, as labels on a slowly rotating sphere. Label size shows time, and colour shows severity: red for critical, amber for warning, blue for a note, always with an icon and a word as well. **Drag** to spin it; hovering a label pauses it. The rotation is off when your system asks for reduced motion.

Next to it, the same culprits as a ranked list, and an **insight card** for the hovered or clicked one: its file and line with an **↗ editor** link, its time, how many findings it appears in, **What to do**, and **Show the finding**, which jumps to the full finding below.

```screenshot culprits-top
Top culprits for a recording of the demo app: a 2.58 s click handler leads.
sphere: **Culprit sphere.** Label size is time, colour is severity. Drag to spin it; hover a label to pause.
insight: **Insight card.** The selected culprit's file and line, its time, the findings it appears in, and what to do about it.
rank: **Ranked list.** The same culprits in order, easier to read exactly. Click one to select it.
```

## Vital signs

Four headline cards: **total blocking time**, **longest task**, **slowest interaction** and **wasted renders**. Each has a value, a rating (**Good**, **Needs work** or **Poor**, always as an icon and a word) and a gauge marking the good, needs-work and poor ranges. Six more appear as compact chips: LCP, FCP, layout shift, DOM nodes, JS heap growth and forced reflows. LCP and FCP appear for page-load recordings only.

## Where main-thread time went

One bar split into scripting, layout, style, paint, garbage collection, compile and parse, and other.

```screenshot culprits-vitals
Vital signs and where the main thread's time went.
hero: **Vital signs.** Value, rating and a gauge with the good and poor thresholds written underneath.
chips: **More vitals.** LCP and FCP (page loads only), layout shift, DOM nodes, heap growth and forced reflows.
breakdown: **Main-thread time.** Here 97% went to scripting: a JavaScript problem, not a rendering one.
```

## Slowest functions

The functions that spent the most time *in themselves*, with file and line and an **↗ editor** link that opens VS Code at that spot.

```screenshot culprits-functions
The slowest functions, by their own time.
own: **Your code** is shown in full strength, with its file and line.
editor: **↗ editor** opens the file at that line in VS Code.
vendor: **Library code** is dimmed. **Hide node_modules** removes it.
```

## Findings

The ranked list of concrete problems, built to be scanned:

- **One line each**: a severity badge (✕, ! or i), the title, the file, the category and an impact bar. Click a line to expand it; **Expand all** and **Collapse all** are in the toolbar.
- **Root causes are grouped.** Findings whose main culprit is the same function become one row, such as "`e.insertRule()` is behind 3 findings", with the findings nested inside. The row's impact is the *largest* of its members, not their sum, because they often overlap.
- **Expanded**, a finding reads top-down: **What to do** (the fix), **Why it matters** (the evidence), then a table of the exact culprits: `functionName()`, `path/to/File.tsx:line` and its time.
- **Filters**: All, Critical, Warnings or Notes, with counts, and a category menu.

```screenshot culprits-findings
Findings, with one root cause expanded.
filters: **Severity filter**, with the number of findings of each kind.
category: **Category** menu: CPU, React, Main thread, Layout, Network and so on.
expand: **Expand all** and **Collapse all.**
group: **A root cause.** One function, `burn()`, is behind six findings, so they are grouped under it.
fix: **What to do**: the suggested fix comes first.
culprits: **The culprits**: function, file and line, and time.
members: **Findings it causes**, each of which expands in turn.
next: **The next problem**, collapsed. Its bar shows its impact.
```

See the [Findings reference](doc:findings) for what each finding means.

## Reading line numbers

- `File.ts:102` is **exact**, from a source map.
- `File.ts:≈102` means the bundle had no source map, so Spectra found the function's *definition* by searching the real file for its name. The file and function are exact; the line is a best-effort match.
- **Anonymous callbacks** are named after the function they live in, such as `(anonymous in rebuildRows)()`.
- **Minified code** such as `n()` or `t()` inside a pre-built bundle can't be mapped to source, but Spectra still names the bundle and its cost, and the call tree shows which of your code calls into it.
