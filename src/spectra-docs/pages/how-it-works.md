## Three instruments, one recording

Every recording runs three independent recorders over the same window, and reconciles them afterwards:

| Instrument | What it captures |
| --- | --- |
| **Browser trace** | Every main-thread task Chrome performs (script, layout, style, paint, garbage collection, timers, event dispatch) as nested, timed spans |
| **V8 CPU profile** | A sampled call stack of the JavaScript actually running, carried inside the same trace on the same clock |
| **In-page probe** | What the trace can't see: which components rendered and why, plus Web Vitals as the browser reports them (long tasks, layout shifts, LCP, FCP, slow interactions) |

## From events to culprits

1. **Find the main thread** among every thread in the trace, and build its tasks into a tree.
2. **Classify the work** into scripting, compile, style, layout, paint, garbage collection, parsing and other.
3. **Name each task's trigger**, such as a click handler, a timer or script evaluation. Tasks of 50 ms or more are long tasks, and their time beyond 50 ms adds up to total blocking time.
4. **Detect forced reflows**: layout or style work triggered by script rather than by the browser. Three or more in one task is layout thrashing.
5. **Attribute CPU samples** to functions, with self and total time. Built-in functions are billed to the JavaScript that called them, anonymous callbacks are named after their enclosing function, and library time is traced back to the app code that called it.
6. **Map code to source files**, trying in order: a **source map**, **webpack module markers** (which work even with source maps turned off), the **script URL** (Vite and other ESM dev servers), and finally the bundle name.
7. **Join everything into one report**, per file, function and component, and run the [finding rules](doc:findings) over it.

## Noise control

- The stall caused by starting the CPU profiler is detected and discarded, with a note in the report.
- LCP and FCP are reported for page-load recordings only.
- Ratio-based rules wait for enough activity before they fire.
- Several runs are reduced to their median, and [compare](doc:compare) ignores differences no bigger than the run-to-run spread.

## Known limits

- **Sampling.** The CPU profile is statistical, so very short, very frequent functions can be missed. The trace's task data is complete.
- **Overhead.** The probe and profiler add cost. The report shows the probe's own cost; compare recordings taken the same way.
- **Two clocks.** Trace events and probe events are each accurate on their own timeline, but are not aligned to the millisecond against each other.
- **Located lines.** Without a source map, a line found by searching for a function's name is a best-effort match, marked with `≈`.
- **Your machine.** Spectra measures a development build on your computer, not production on your users' devices. Trust the ranking more than the absolute numbers.
