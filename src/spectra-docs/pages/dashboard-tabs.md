Beyond [Culprits](doc:culprits), every report has these tabs. **Hide node_modules** applies to all of them.

## Page map

A screenshot of the page *as it was when recording stopped*, with the slowest components pointed out by **numbers in the margins**, each joined by a thin line to its element. The numbers are spaced so they never overlap, however deeply the elements are nested.

**Hover or focus a number**, or its row in the list beside the map, to highlight the element and open a card with the component's file and line, self time, renders, wasted renders, why it rendered and a suggested fix. **Click** it to open the source. Orange marks the most time, amber mostly wasted renders, blue minor costs.

```screenshot tab-page-map
The page map: the page as it looked when recording stopped.
frame: **The page**, with each hot component outlined and joined to its number.
marker: **A number.** Hover or focus it for the component's details; click it to open the source.
list: **Hot spots**, the same components as a list, with file and time.
```

Limits: it needs a development build of the framework; it shows the **viewport**, not the whole scrollable page; when a component appears many times only its largest instance is marked; and it shows only what rendered *during the recording*.

## File tree

Every folder and file, **coloured and sized by heat**, hottest first, with the paths to the top culprits already expanded. Choose the metric: CPU self time, main-thread blocking, render time, wasted renders, render count or forced reflows.

Click a folder to expand it, or a file to open the side panel with its functions, its components and its source, with the hot functions marked in the gutter. The wheel scrolls; **Ctrl or Cmd + wheel**, or a pinch, zooms. Dashed circles are library code.

```screenshot tab-file-tree
The file tree, coloured and sized by CPU self time.
toolbar: **Colour and size by**: choose the metric, and expand or collapse everything.
tree: **The tree.** Hotter files are larger and brighter; `heavy.js` dominates here.
legend: **Legend.** Heat runs from low to high, and dashed circles mark library code.
```

## Call tree

Top-down call paths with total and self time. It opens on the function with the most self time. Click a circle to expand or collapse it, and a label to open its file.

```screenshot tab-call-tree
The call tree, opened on the function with the most self time.
toolbar: **Toolbar**, with what the sizes mean.
tree: **Call paths.** Click a circle to expand or collapse it, and a label to open its file.
```

## Components

Every component that rendered, with its renders, **wasted** renders, self time, and average and slowest render. Click a row to see *why it rendered* (props, state, hooks, context or parent) and which props changed, including the ones recreated with identical contents. It covers React, Next.js, Vue and Angular; see [Frameworks](doc:frameworks).

```screenshot tab-components
Components, with one row opened to show why it rendered.
summary: **Summary**: framework version, commits, total render time and the slowest commit.
columns: **Columns**: renders, wasted renders, self time, average and slowest render, and the file. Click a heading to sort.
row: **An opened row.** `Wasted` rendered 89 times, all of them wasted.
why: **Why it rendered**: every render came from its parent `App`, and no prop changed. A `React.memo` candidate.
```

## Long tasks

A timeline of main-thread tasks, and every task of 50 ms or more with its trigger, a scripting, layout, style, paint and garbage-collection breakdown, and its top files and functions. Below it, every **forced reflow** with the line that caused it.

```screenshot tab-long-tasks
Long tasks: two click handlers blocked the main thread for over 250 ms each.
timeline: **Timeline.** Every task in the recording; the dashed line marks 50 ms.
head: **A long task**: its length, when it started, and what triggered it.
breakdown: **Breakdown** of the task into scripting, layout, style, paint and garbage collection.
cols: **Files and functions** that used the task's time, each linked to its source.
```

## Network & memory

The slowest, largest, uncompressed and repeated requests; the layout shifts and the elements that moved; the DOM node count, event listeners and heap growth.

```screenshot tab-network
Network & memory for a page load.
summary: **Summary**: requests, bytes transferred and decoded, DOM nodes, event listeners, heap and layouts.
requests: **Slowest requests**, with type, time and size. Largest, uncompressed and repeated requests follow below.
```

## Golden paths

Every `spectra performance` run, with its matrix: the baseline page load and each journey with its automation result and key metrics. Each row opens that journey's full report. See [Golden paths](doc:golden-paths).

```screenshot tab-golden-paths
The golden-path matrix of a `spectra performance` run.
head: **Run picker** and summary: elements discovered, journeys run, and how many passed.
target: **What was evaluated**: the project and its URL.
matrix: **The matrix**: one row per journey with its result, TBT, LCP, long tasks, findings and top finding. **Open report** opens it.
```

## Trace for Chrome DevTools

**Trace for Chrome DevTools** in the report bar saves the raw trace as `<id>.trace.json`. In Chrome, open DevTools, then **Performance**, then **Load profile** (the ↑ icon) and pick the file. The report itself (`<id>.json`) is Spectra's own format and cannot be loaded into DevTools.

The trace of the **most recent recording** is kept in memory, so the button always works straight after recording. For older reports it works only if **Save raw trace** was ticked (or `--save-trace` passed) before recording.
