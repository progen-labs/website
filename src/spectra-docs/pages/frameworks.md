Spectra profiles any web frontend. For the frameworks below it also measures **components**: render counts, render time, wasted renders and why each render happened.

| Framework | Depth | How |
| --- | --- | --- |
| **React** | Deep | React's DevTools hook, on every commit |
| **Next.js** | Deep | Through React, with a server-rendered page |
| **Vue** | Deep | Vue's DevTools hook |
| **Angular** | Deep | Angular's development-mode profiler |
| **Svelte** | Generic | Source-mapped files and functions |
| **Any other build** | Generic | Source-mapped files and functions |

**Deep** means per-component render counts and timings in addition to everything else. **Generic** means source-mapped file and function attribution, long tasks, layout work, vitals, network and memory: everything except components.

## Detection

Spectra reads your `package.json` and project files: `next`, or a `next.config.js` or `pages/` folder, means Next.js; `react` with `react-dom` means React; `vue` or `vue.config.js` means Vue; `svelte` or `svelte.config.js` means Svelte; `@angular/core` or `angular.json` means Angular. A Vite config or dependency marks the bundler as Vite. Detection also decides how the dev server is started when you don't pass `--url`.

## React and Next.js

The probe installs `__REACT_DEVTOOLS_GLOBAL_HOOK__` before React loads (React 16.9 and later, 17 and 18) and walks every commit. For each component that rendered it records the render count and self time, and compares props, state, hooks and context with the previous render to decide *why* it rendered and whether the render was **wasted**. Props that were recreated with identical contents, such as an inline arrow function or an object literal, are called out by name. If the React DevTools extension is present, Spectra wraps its hook rather than replacing it.

Render timings exist only in development (or profiling) builds of React. A component's file and line come from V8's own record of where the function is defined, the same mechanism DevTools uses to jump to a definition.

## Vue

The probe uses Vue's DevTools hook in development builds: component additions and updates give mount and update counts, and Vue's performance events give per-component render time. Component files come straight from the single-file-component compiler, so no source map is needed.

## Angular

In a development build Angular exposes a framework profiler. Its change-detection events, paired per component and nested, give real per-component render counts and self time, in the same shape as React and Vue, so the Components tab, culprits and findings all work the same way.

## Svelte and everything else

Without a component probe, Spectra still maps every sampled function back to its file and line through source maps, webpack module markers or script URLs. See [How it works](doc:how-it-works).

> Always profile a **development build**. Production builds are minified and frameworks drop their timing hooks, so Spectra reports *production build: render timings are unavailable*.
