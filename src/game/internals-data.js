// Content + 3D layout for the Internals Explorer. Two "constellations" you fly
// through: how a browser turns bytes into pixels, and how React turns elements
// into those same DOM mutations. Positions are world coords (x, y, z); the
// probe moves on the x/z plane and the camera chases it.

export const GROUPS = {
  browser: { label: 'Browser Internals', accent: '#ffb86b', dim: 'rgba(255,184,107,0.16)' },
  react: { label: 'React Internals', accent: '#61dafb', dim: 'rgba(97,218,251,0.16)' },
};

// Shapes cycle for visual variety; purely cosmetic.
export const NODES = [
  // ---------------- BROWSER: bytes → pixels ----------------
  {
    id: 'network',
    group: 'browser',
    order: 0,
    title: 'Networking',
    tag: 'bytes off the wire',
    pos: [-11, 3, -1],
    short: 'DNS → TCP/TLS → HTTP. The bytes arrive before anything can be parsed.',
    details: [
      {
        h: 'Getting the first byte',
        lines: [
          'DNS resolves the hostname to an IP (cached at OS/router/resolver layers).',
          'A TCP handshake (SYN / SYN-ACK / ACK) opens the socket; TLS then negotiates keys over 1–2 more round trips (0-RTT with TLS 1.3 resumption).',
          'HTTP/2 multiplexes many requests over one connection; HTTP/3 runs over QUIC (UDP) to dodge TCP head-of-line blocking.',
        ],
      },
      {
        h: 'Caching & priorities',
        lines: [
          'The browser checks memory cache → disk/HTTP cache → service worker before hitting the network.',
          'The preload scanner races ahead of the main parser to kick off fetches for scripts, styles and images early.',
          '`<link rel=preload>`, `fetchpriority`, and `Priority` hints reorder the queue; the critical CSS/JS wins the race to first paint.',
        ],
      },
    ],
  },
  {
    id: 'parsing',
    group: 'browser',
    order: 1,
    title: 'Parsing → DOM & CSSOM',
    tag: 'tokens become trees',
    pos: [-19, 4.5, -8],
    short: 'HTML is tokenized into the DOM tree; CSS is parsed into the CSSOM.',
    details: [
      {
        h: 'HTML → DOM',
        lines: [
          'A tokenizer streams the bytes into start/end tags and text; tree construction turns those tokens into DOM nodes following the HTML5 insertion rules (which is why malformed markup still produces a valid tree).',
          'Parsing is incremental — the DOM grows as bytes arrive.',
        ],
      },
      {
        h: 'What blocks what',
        lines: [
          'A plain `<script>` is parser-blocking: the parser stops, the script must download + execute, then parsing resumes. Use `defer` (run in order, after parse) or `async` (run ASAP, unordered).',
          'CSS is render-blocking but not parser-blocking — except a `<script>` that needs up-to-date styles will wait on pending CSS.',
        ],
      },
      {
        h: 'CSS → CSSOM',
        lines: [
          'Stylesheets parse into the CSSOM, a tree of rules the engine can query.',
          'The cascade resolves conflicts by origin, specificity and source order; inheritance fills the rest.',
        ],
      },
    ],
  },
  {
    id: 'render-tree',
    group: 'browser',
    order: 2,
    title: 'Style & Render Tree',
    tag: 'what is actually visible',
    pos: [-11, 5, -15],
    short: 'DOM + CSSOM combine into a render tree of only the visible nodes, each with computed styles.',
    details: [
      {
        h: 'Building it',
        lines: [
          'Style resolution matches every DOM node against CSSOM rules to produce its computed style.',
          'The render tree holds only nodes that paint. `display:none` drops the node from the tree entirely; `visibility:hidden` keeps it (it still takes up space).',
        ],
      },
      {
        h: 'Why it matters',
        lines: [
          'This is the last step where the structure is still "logical" — no geometry yet.',
          'Expensive selectors and huge style sheets cost here, on every style recalculation.',
        ],
      },
    ],
  },
  {
    id: 'layout',
    group: 'browser',
    order: 3,
    title: 'Layout (Reflow)',
    tag: 'geometry & boxes',
    pos: [-19, 3.5, -22],
    short: 'The engine computes the exact size and position of every box.',
    details: [
      {
        h: 'The box model, solved',
        lines: [
          'Layout walks the render tree computing x/y/width/height for every box, resolving %, flexbox, grid, floats and text line-breaking.',
          'Output is a geometry tree (the "layout" / "box" tree).',
        ],
      },
      {
        h: 'Layout thrashing',
        lines: [
          'Reading a geometry property (`offsetWidth`, `getBoundingClientRect`, `scrollTop`) forces a synchronous reflow if styles changed since the last layout.',
          'Interleaving reads and writes in a loop triggers repeated forced reflows — batch reads first, then writes, or use `requestAnimationFrame`.',
        ],
      },
    ],
  },
  {
    id: 'paint',
    group: 'browser',
    order: 4,
    title: 'Paint & Raster',
    tag: 'pixels get drawn',
    pos: [-11, 4.5, -29],
    short: 'Geometry is turned into draw commands, then rasterized into actual pixels.',
    details: [
      {
        h: 'Paint records',
        lines: [
          'Painting produces an ordered list of draw operations (fill rect, draw text, draw image) — not pixels yet.',
          'The page may be split into paint layers so parts can be re-painted or moved independently.',
        ],
      },
      {
        h: 'Rasterization',
        lines: [
          'Raster turns draw commands into bitmaps of pixels, often tiled and done on the GPU.',
          'Properties like `color` or `background` only need paint + raster; properties like `width`/`top` need layout first (more expensive).',
        ],
      },
    ],
  },
  {
    id: 'compositor',
    group: 'browser',
    order: 5,
    title: 'Compositor / GPU',
    tag: 'layers to the screen',
    pos: [-19, 5, -36],
    short: 'A separate compositor thread assembles rasterized layers into the final frame on the GPU.',
    details: [
      {
        h: 'Why a compositor thread',
        lines: [
          'It runs independently of the main thread, so scrolling and compositor-driven animation stay smooth even when JS is busy.',
          'Layers are uploaded to the GPU as textures and composited with transforms.',
        ],
      },
      {
        h: 'The cheap animation path',
        lines: [
          'Animating `transform` and `opacity` can be done entirely on the compositor — no layout, no paint, no main-thread work.',
          '`will-change: transform` hints the browser to promote an element to its own layer ahead of time (use sparingly — layers cost memory).',
        ],
      },
    ],
  },
  {
    id: 'js-engine',
    group: 'browser',
    order: 6,
    title: 'JS Engine (V8)',
    tag: 'parse → bytecode → JIT',
    pos: [-26, 4, -13],
    short: 'V8 parses JS, runs it as bytecode, and JIT-compiles hot code to machine code.',
    details: [
      {
        h: 'The pipeline',
        lines: [
          'The parser builds an AST (lazily — functions are pre-parsed and only fully parsed when first called).',
          'Ignition compiles the AST to compact bytecode and interprets it.',
          'TurboFan JIT-compiles "hot" functions to optimized machine code using runtime type feedback; if an assumption breaks, it deoptimizes back to bytecode.',
        ],
      },
      {
        h: 'Making it fast',
        lines: [
          'Objects with a stable shape share a hidden class (map), letting V8 use inline caches instead of dictionary lookups — so keep object shapes consistent.',
          'Garbage collection is generational: a fast scavenger for short-lived objects, a mark-sweep-compact for the old generation, most of it concurrent/incremental to avoid long pauses.',
        ],
      },
    ],
  },
  {
    id: 'event-loop',
    group: 'browser',
    order: 7,
    title: 'Event Loop',
    tag: 'one thread, many tasks',
    pos: [-27, 3.5, -28],
    short: 'A single thread drains a task queue and a microtask queue, interleaving rendering.',
    details: [
      {
        h: 'Tasks vs microtasks',
        lines: [
          'Each loop turn runs one macrotask (a timer callback, an event, a message) until the call stack is empty…',
          '…then drains the entire microtask queue (Promise callbacks, `queueMicrotask`, MutationObserver) before anything else.',
          'A runaway microtask chain can starve rendering and user input — microtasks always jump the line.',
        ],
      },
      {
        h: 'Where rendering fits',
        lines: [
          'Between turns the browser may run the render steps: `requestAnimationFrame` callbacks → style → layout → paint → composite.',
          'rAF fires right before paint, so it is the correct place for visual updates; `setTimeout(…, 0)` is not synced to frames.',
        ],
        code: "console.log(1);\nsetTimeout(() => console.log('timeout'), 0);\nPromise.resolve().then(() => console.log('microtask'));\nconsole.log(2);\n// → 1, 2, microtask, timeout",
      },
    ],
  },

  // ---------------- REACT: elements → DOM mutations ----------------
  {
    id: 'jsx',
    group: 'react',
    order: 0,
    title: 'JSX → Elements',
    tag: 'sugar for function calls',
    pos: [11, 3, -1],
    short: 'JSX is compiled away. It is just calls that return plain element objects.',
    details: [
      {
        h: 'The transform',
        lines: [
          'Babel/SWC turn `<Foo a={1}>hi</Foo>` into a call — classic: `React.createElement(Foo, { a: 1 }, "hi")`; modern JSX runtime: `_jsx(Foo, { a: 1, children: "hi" })` auto-imported from `react/jsx-runtime`.',
          'There is no HTML here — the output is a tree of JavaScript objects.',
        ],
      },
      {
        h: 'Element shape',
        lines: [
          'An element is roughly `{ type, key, ref, props }` where `type` is a string ("div") for host elements or a function/class for components.',
          'Elements are immutable, cheap descriptions — creating them does nothing to the DOM on its own.',
        ],
      },
    ],
  },
  {
    id: 'vdom',
    group: 'react',
    order: 1,
    title: 'Elements / Virtual DOM',
    tag: 'a description, not the thing',
    pos: [19, 4.5, -8],
    short: 'A tree of element objects describing the UI you want — React makes the real DOM match it.',
    details: [
      {
        h: 'What the "virtual DOM" is',
        lines: [
          'It is the tree of elements your components return on a render — a lightweight snapshot of desired UI.',
          'React compares the new description to the previous one and computes the minimal set of real DOM operations.',
        ],
      },
      {
        h: 'Why bother',
        lines: [
          'Direct DOM mutation is imperative and error-prone; describing "what the UI should be" and letting React reconcile is declarative.',
          'The vDOM is not inherently faster than hand-tuned DOM code — its value is the programming model and the batching/diffing it enables.',
        ],
      },
    ],
  },
  {
    id: 'fiber',
    group: 'react',
    order: 2,
    title: 'Fiber Architecture',
    tag: 'work you can pause',
    pos: [11, 5, -15],
    short: 'Each element becomes a fiber — a unit of work in a linked list React can pause and resume.',
    details: [
      {
        h: 'The fiber node',
        lines: [
          'A fiber is a mutable object per element holding its type, props, state and pointers: `child`, `sibling`, and `return` (parent).',
          'Those pointers form a linked list, so React can walk the tree iteratively and stop between any two units of work — the whole point of Fiber (React 16+).',
        ],
      },
      {
        h: 'Double buffering',
        lines: [
          'Two trees exist: `current` (on screen) and `workInProgress` (being built).',
          'React builds workInProgress off-screen; on commit it swaps the pointer — an atomic switch, so users never see a half-rendered tree.',
          'Each fiber has an `alternate` pointer linking it to its counterpart in the other tree.',
        ],
      },
    ],
  },
  {
    id: 'reconciler',
    group: 'react',
    order: 3,
    title: 'Reconciliation / Diff',
    tag: 'old tree vs new tree',
    pos: [19, 3.5, -22],
    short: 'A heuristic O(n) diff decides what to reuse, update, move or throw away.',
    details: [
      {
        h: 'The heuristics',
        lines: [
          'Different element `type` at a position → tear down the old subtree and build a new one (no deep diff across types).',
          'Same type → keep the DOM node / fiber and just update changed props.',
          'A true tree-diff is O(n³); React assumes a stable structure to get O(n).',
        ],
      },
      {
        h: 'Keys',
        lines: [
          'In lists, `key` tells React which items are the same across renders so it can move instead of re-create.',
          'Index-as-key breaks when items reorder or insert — state gets attached to the wrong row. Use stable ids.',
        ],
      },
    ],
  },
  {
    id: 'phases',
    group: 'react',
    order: 4,
    title: 'Render vs Commit',
    tag: 'two very different phases',
    pos: [11, 4.5, -29],
    short: 'Render builds the tree (interruptible, pure); commit applies it to the DOM (synchronous).',
    details: [
      {
        h: 'Render phase',
        lines: [
          'React calls your components to build workInProgress and mark effects. This phase is interruptible and may run, bail out, or restart.',
          'It must be pure and side-effect-free — which is why Strict Mode double-invokes renders in dev to surface accidental side effects.',
        ],
      },
      {
        h: 'Commit phase',
        lines: [
          'Runs synchronously and cannot be interrupted. React mutates the DOM, swaps the trees, updates refs, and runs effects.',
          '`useLayoutEffect` fires synchronously after DOM mutation, before the browser paints (good for measuring); `useEffect` fires asynchronously after paint.',
        ],
      },
    ],
  },
  {
    id: 'hooks',
    group: 'react',
    order: 5,
    title: 'Hooks',
    tag: 'state on a linked list',
    pos: [19, 5, -36],
    short: 'Hooks are a linked list stored on the fiber, read in the same order every render.',
    details: [
      {
        h: 'How state survives',
        lines: [
          'Each component fiber holds `memoizedState`: a linked list of hook records, one per hook call.',
          'On every render React walks that list in call order — which is exactly why hooks must not be called conditionally or in loops. Order is the identity.',
        ],
      },
      {
        h: 'Closures & deps',
        lines: [
          'Each render captures its own props/state in closures; an effect or callback "sees" the values from the render that created it.',
          'The dependency array tells React when to re-create an effect/memo. A stale closure is usually a missing dependency.',
          '`useState` setters and `useReducer` dispatch are stable; `useRef` gives a mutable box that persists without causing re-renders.',
        ],
      },
    ],
  },
  {
    id: 'scheduler',
    group: 'react',
    order: 6,
    title: 'Scheduler & Lanes',
    tag: 'priority & time-slicing',
    pos: [26, 3.5, -13],
    short: 'A cooperative scheduler assigns priority lanes to updates and yields to the browser.',
    details: [
      {
        h: 'Lanes',
        lines: [
          'Updates are tagged with a priority "lane" (a bitmask): discrete input like a click is urgent; transitions are low priority.',
          'React processes higher-priority lanes first and can interrupt low-priority render work when something urgent arrives.',
        ],
      },
      {
        h: 'Time slicing',
        lines: [
          'The scheduler works in small chunks and calls back via a MessageChannel, yielding to the browser between chunks so the main thread stays responsive.',
          'This is what makes a large render not freeze the page — the browser can paint and handle input in the gaps.',
        ],
      },
    ],
  },
  {
    id: 'concurrent',
    group: 'react',
    order: 7,
    title: 'Concurrent Features',
    tag: 'transitions & suspense',
    pos: [27, 4, -28],
    short: 'Concurrent rendering lets React prepare UI in the background and interrupt it.',
    details: [
      {
        h: 'Transitions',
        lines: [
          '`startTransition` / `useTransition` mark an update as non-urgent, so typing stays responsive while a heavy re-render happens in a low-priority lane.',
          '`useDeferredValue` lets a value lag behind during busy periods, showing stale-but-interactive UI.',
        ],
      },
      {
        h: 'Suspense',
        lines: [
          'A component can "suspend" by throwing a promise; React shows the nearest `<Suspense fallback>` until it resolves, then retries the render.',
          'This powers data fetching and code-splitting (`React.lazy`), and streaming SSR flushes HTML as boundaries resolve.',
        ],
      },
    ],
  },
];

export const NODE_BY_ID = Object.fromEntries(NODES.map(n => [n.id, n]));

// Ordered id lists per group, for drawing the flow lines between stations.
export const FLOW = {
  browser: ['network', 'parsing', 'render-tree', 'layout', 'paint', 'compositor'],
  react: ['jsx', 'vdom', 'fiber', 'reconciler', 'phases', 'scheduler', 'concurrent'],
};
