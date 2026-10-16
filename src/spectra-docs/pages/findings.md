A finding is one concrete problem, with its evidence, its culprits and a suggested fix. Findings are sorted by severity (critical, then warning, then note) and, within a severity, by their impact in milliseconds. The thresholds are deliberately conservative, so a finding is worth reading.

## Severities

| Badge | Severity | Meaning |
| --- | --- | --- |
| ✕ | Critical | A large, certain cost. Fix these first |
| ! | Warning | A real cost, or a pattern that becomes one at scale |
| i | Note | Context about the recording itself |

## Main thread

| Finding | Fires when | Typical fix |
| --- | --- | --- |
| **Long task** (with its trigger, such as "click handler") | A task blocks the main thread for over 50 ms. Critical at 200 ms of CPU time | Split the work (`requestIdleCallback`, `startTransition`), memoise, or move it off the main thread |
| **Total blocking time** | Blocking time reaches 200 ms. Critical at 600 ms | Fix the long tasks it lists |
| **File spent N ms of JavaScript** | A file uses 80 ms of its own CPU time, or 10% of all CPU once there is enough activity | Look at its slowest functions |
| **Library X used N ms** | A library is busy. The culprit is the app function that calls it most | Call it less often, or with less data |
| **Forced reflow in `fn()`** | Code reads layout (`offsetHeight`, `getBoundingClientRect` …) right after changing the DOM | Batch reads before writes; use `ResizeObserver` |
| **Layout thrashing** | Three or more forced layouts happen inside one task | Read everything first, then write |
| **Garbage collection took N ms** | Garbage collection takes a large share of CPU | Allocate less in hot paths; reuse objects and arrays |
| **Script compile and parse took N ms** | Compiling and parsing JavaScript is expensive | Ship less JavaScript; split bundles |

## Components

These come from the framework probe: React, Next.js, Vue and Angular. See [Frameworks](doc:frameworks).

| Finding | Fires when | Typical fix |
| --- | --- | --- |
| **Component is slow to render** | One component's own render time is large | `useMemo` for expensive work; virtualise long lists |
| **Component rendered N×** | A component renders very often | Find what keeps triggering it |
| **Re-rendered N× with nothing changed** | At least 5 re-renders, and at least 30% of them had identical props, state and context | `React.memo`, or stop the parent re-rendering |
| **Gets a new function or object for a prop on every render** | A prop is recreated each render with identical contents, defeating `memo` | `useCallback` or `useMemo`, or move it out of the component |
| **Commit took N ms** | One commit takes 50 ms or more. Critical at 100 ms | Render fewer components per update |
| **Production build: render timings are unavailable** | The framework is a production build | Profile the dev server |
| **No renderer was seen** | The probe saw no framework on the page | Reload once, or record a page load |

## Loading and visual stability

| Finding | Fires when | Typical fix |
| --- | --- | --- |
| **Largest Contentful Paint** | Over 2.5 s. Critical over 4 s | Less render-blocking JS and CSS; split the main bundle |
| **First Contentful Paint** | Over 1.8 s. Critical over 3 s | Ship and run less before the first paint |
| **Cumulative layout shift** | 0.1 or more. Critical at 0.25. The elements that moved are listed | Reserve space for images, ads and late content |
| **Slow interaction** | A click, key press or similar takes too long to show a response. Critical at 500 ms | Split the input delay, the handler and the rendering it causes |

## Memory, DOM and network

| Finding | Fires when | Typical fix |
| --- | --- | --- |
| **Large DOM** | 1,500 nodes or more. Critical at 3,000 | Virtualise lists; unmount hidden tabs and dialogs |
| **JS heap grew N MB** | 30 MB or more during the recording. Critical at 100 MB | Look for a leak: repeat the action and watch it grow |
| **Served uncompressed** | A text resource is sent without compression | Enable gzip or Brotli |
| **Large resource** | One resource is very large over the wire | Split, compress or lazy-load it |
| **Slow request** | A request takes long to complete | Cache, prefetch or speed up the endpoint |

## The recording itself

| Finding | Meaning |
| --- | --- |
| **The page itself failed to load** | The page answered with an HTTP error, so the recording measured an error page. Sign in, or start the backend. See [Signing in](doc:signing-in) |
| **Almost nothing ran** | Under 300 ms of activity, almost no renders and no long task. Interact while recording, or record a page load |
