// Content for the Internals Explorer. Two systems you orbit with the mouse:
// how a browser turns bytes into pixels, and how React turns elements into
// those same DOM mutations. Each top-level concept is a "star"; clicking it
// flies you into its own 3D sub-world of inner concepts ("planets"), and each
// inner concept opens a deep technical readout.
//
// Positions are computed from ring math in the scene, so the data stays flat:
// just ordered concepts per group, each with its children.

export const GROUPS = {
  browser: { label: 'Browser Internals', accent: '#ffb86b', center: [-23, 2.5, 0] },
  react: { label: 'React Internals', accent: '#61dafb', center: [23, 2.5, 0] },
};

export const CONCEPTS = [
  // ============================ BROWSER ============================
  {
    id: 'networking',
    group: 'browser',
    title: 'Networking',
    tag: 'bytes off the wire',
    blurb: 'DNS → TCP/TLS → HTTP. Nothing can be parsed until the bytes arrive.',
    children: [
      { id: 'dns', title: 'DNS Resolution', blurb: 'Hostname → IP address.', points: [
        'Resolves the hostname to an IP, cached at the OS, router and resolver layers.',
        'A cold lookup walks recursive → root → TLD → authoritative servers; a warm one is near-instant.',
      ] },
      { id: 'handshake', title: 'TCP & TLS Handshake', blurb: 'Opening a secure socket.', points: [
        'TCP opens the socket with SYN / SYN-ACK / ACK.',
        'TLS 1.3 negotiates keys in a single round trip (0-RTT when resuming a session), then the first byte can flow.',
      ] },
      { id: 'protocols', title: 'HTTP/2 & HTTP/3', blurb: 'Multiplexing requests.', points: [
        'HTTP/2 multiplexes many streams over one TCP connection, ending the HTTP/1 request queue.',
        'HTTP/3 runs over QUIC (UDP), removing TCP head-of-line blocking when a packet is lost.',
      ] },
      { id: 'cache', title: 'Cache & Priorities', blurb: 'Avoiding the network entirely.', points: [
        'The browser checks memory cache → disk/HTTP cache → service worker before hitting the network.',
        'The preload scanner races ahead of the parser; `preload` / `fetchpriority` reorder the queue so critical CSS/JS wins the race to first paint.',
      ] },
    ],
  },
  {
    id: 'parsing',
    group: 'browser',
    title: 'Parsing',
    tag: 'tokens become trees',
    blurb: 'HTML becomes the DOM; CSS becomes the CSSOM.',
    children: [
      { id: 'tokenize', title: 'HTML Tokenizer', blurb: 'Bytes → tokens.', points: [
        'A streaming tokenizer turns bytes into start/end tags and text.',
        'It is incremental and error-tolerant — malformed markup still yields a valid token stream per the HTML5 spec.',
      ] },
      { id: 'domtree', title: 'DOM Tree Construction', blurb: 'Tokens → nodes.', points: [
        'Tree construction applies the HTML5 insertion modes to build DOM nodes from tokens.',
        'The DOM grows as bytes arrive, so parsing never waits for the whole document.',
      ] },
      { id: 'blocking', title: 'Script Blocking', blurb: 'What stops the parser.', points: [
        'A plain `<script>` is parser-blocking: parsing halts until it downloads and runs.',
        '`defer` runs in order after parse; `async` runs ASAP, unordered. A script also waits on any pending CSS it might read.',
      ] },
      { id: 'cssom', title: 'CSSOM & Cascade', blurb: 'Stylesheets → rule tree.', points: [
        'CSS parses into the CSSOM, a queryable tree of rules.',
        'The cascade resolves conflicts by origin, specificity and source order; inheritance fills the gaps.',
      ] },
    ],
  },
  {
    id: 'render-tree',
    group: 'browser',
    title: 'Render Tree',
    tag: 'what is actually visible',
    blurb: 'DOM + CSSOM combine into a tree of only the nodes that paint.',
    children: [
      { id: 'resolve', title: 'Style Resolution', blurb: 'Computed styles.', points: [
        'Every DOM node is matched against the CSSOM to produce its final computed style.',
        'Huge stylesheets and expensive selectors cost here, on every style recalculation.',
      ] },
      { id: 'prune', title: 'Visible-only Tree', blurb: 'What gets dropped.', points: [
        'Only nodes that paint enter the render tree.',
        '`display:none` removes the node entirely; `visibility:hidden` keeps it (it still occupies space).',
      ] },
      { id: 'recalc', title: 'Style Invalidation', blurb: 'Recalc triggers.', points: [
        'Changing a class, attribute or inline style invalidates affected nodes and schedules a recalc.',
        'Scoped invalidation is cheap; a change high in the tree can cascade to many descendants.',
      ] },
    ],
  },
  {
    id: 'layout',
    group: 'browser',
    title: 'Layout',
    tag: 'geometry & boxes',
    blurb: 'The exact size and position of every box is computed.',
    children: [
      { id: 'box', title: 'Box Model', blurb: 'Solving geometry.', points: [
        'Layout computes x/y/width/height for every box, resolving %, margins and text line-breaking.',
        'The output is a geometry (box) tree.',
      ] },
      { id: 'flexgrid', title: 'Flexbox & Grid', blurb: 'Multi-pass sizing.', points: [
        'Flex and grid need intrinsic-size passes before final placement.',
        'On deep or large trees this is one of the more expensive layout steps.',
      ] },
      { id: 'forced', title: 'Forced Sync Layout', blurb: 'Reading geometry.', points: [
        'Reading `offsetWidth`, `getBoundingClientRect` or `scrollTop` after a style write forces layout to run *now*.',
        'That synchronous reflow blocks the main thread mid-frame.',
      ] },
      { id: 'thrash', title: 'Layout Thrashing', blurb: 'The anti-pattern.', points: [
        'Interleaving reads and writes in a loop triggers repeated forced reflows.',
        'Fix: batch all reads first, then all writes — or defer writes to `requestAnimationFrame`.',
      ] },
    ],
  },
  {
    id: 'paint',
    group: 'browser',
    title: 'Paint & Raster',
    tag: 'pixels get drawn',
    blurb: 'Geometry turns into draw commands, then into real pixels.',
    children: [
      { id: 'records', title: 'Paint Records', blurb: 'Draw commands.', points: [
        'Painting produces an ordered list of draw ops (fill rect, draw text, draw image).',
        'These are instructions, not pixels yet.',
      ] },
      { id: 'layers', title: 'Paint Layers', blurb: 'Independent pieces.', points: [
        'The page can be split into layers so parts repaint or move independently.',
        'Fewer, well-chosen layers keep memory and compositing cheap.',
      ] },
      { id: 'raster', title: 'Rasterization', blurb: 'Commands → bitmaps.', points: [
        'Raster turns draw ops into bitmaps, usually tiled and on the GPU.',
        '`color` / `background` changes need only paint + raster; geometry changes need layout first.',
      ] },
    ],
  },
  {
    id: 'compositor',
    group: 'browser',
    title: 'Compositor',
    tag: 'layers to the screen',
    blurb: 'A separate thread assembles rasterized layers on the GPU.',
    children: [
      { id: 'thread', title: 'Compositor Thread', blurb: 'Off the main thread.', points: [
        'It runs independently of the main thread, so scrolling and compositor animation stay smooth even when JS is busy.',
        'Layers are uploaded to the GPU as textures.',
      ] },
      { id: 'promote', title: 'Layer Promotion', blurb: 'will-change.', points: [
        '`will-change: transform` promotes an element to its own layer ahead of time.',
        'Use it sparingly — every layer costs GPU memory.',
      ] },
      { id: 'cheap', title: 'Cheap Animations', blurb: 'The fast path.', points: [
        'Animating `transform` and `opacity` can run entirely on the compositor.',
        'No layout, no paint, no main-thread work — this is how you hit 60fps.',
      ] },
    ],
  },
  {
    id: 'js-engine',
    group: 'browser',
    title: 'JS Engine',
    tag: 'parse → bytecode → JIT',
    blurb: 'V8 parses JS, interprets bytecode, and JIT-compiles hot code.',
    children: [
      { id: 'parse', title: 'Parse → AST', blurb: 'Lazy parsing.', points: [
        'The parser builds an AST, pre-parsing functions and only fully parsing them on first call.',
        'This keeps startup fast for code that may never run.',
      ] },
      { id: 'ignition', title: 'Ignition Bytecode', blurb: 'The interpreter.', points: [
        'Ignition compiles the AST to compact bytecode and interprets it.',
        'Low memory, quick to start — the baseline tier.',
      ] },
      { id: 'turbofan', title: 'TurboFan JIT', blurb: 'Optimizing compiler.', points: [
        'Hot functions are JIT-compiled to optimized machine code using runtime type feedback.',
        'If an assumption breaks (a new object shape appears) it deoptimizes back to bytecode.',
      ] },
      { id: 'shapes', title: 'Hidden Classes & ICs', blurb: 'Why shape matters.', points: [
        'Objects with a stable shape share a hidden class (map), enabling inline caches instead of dictionary lookups.',
        'Add properties in the same order and avoid deleting them to keep shapes stable.',
      ] },
      { id: 'gc', title: 'Garbage Collection', blurb: 'Reclaiming memory.', points: [
        'Generational GC: a fast scavenger for short-lived objects, mark-sweep-compact for the old generation.',
        'Most of it runs concurrently/incrementally to avoid long pauses.',
      ] },
    ],
  },
  {
    id: 'event-loop',
    group: 'browser',
    title: 'Event Loop',
    tag: 'one thread, many tasks',
    blurb: 'A single thread drains tasks and microtasks, interleaving rendering.',
    children: [
      { id: 'stack', title: 'Call Stack', blurb: 'One thread.', points: [
        'Function frames push and pop on a single call stack.',
        'Blocking it (a long loop) freezes rendering and input — everything waits.',
      ] },
      { id: 'macro', title: 'Macrotasks', blurb: 'One per turn.', points: [
        'Each loop turn runs one macrotask — a timer callback, an event, a message — until the stack is empty.',
        'Then control passes to microtasks before the next macrotask.',
      ] },
      { id: 'micro', title: 'Microtasks', blurb: 'Jump the queue.', points: [
        'After each macrotask the entire microtask queue drains: Promise callbacks, `queueMicrotask`, MutationObserver.',
        'A runaway microtask chain can starve rendering and input.',
      ], code: "console.log(1);\nsetTimeout(() => console.log('timeout'), 0);\nPromise.resolve().then(() => console.log('micro'));\nconsole.log(2);\n// → 1, 2, micro, timeout" },
      { id: 'raf', title: 'Render Steps', blurb: 'Where paint fits.', points: [
        'Between turns the browser may run: rAF callbacks → style → layout → paint → composite.',
        '`requestAnimationFrame` fires right before paint — the correct place for visual updates (unlike `setTimeout`).',
      ] },
    ],
  },

  // ============================ REACT ============================
  {
    id: 'jsx',
    group: 'react',
    title: 'JSX → Elements',
    tag: 'sugar for function calls',
    blurb: 'JSX is compiled away into calls that return plain objects.',
    children: [
      { id: 'transform', title: 'The Transform', blurb: 'Babel / SWC.', points: [
        '`<Foo a={1}>hi</Foo>` compiles to a function call, not HTML.',
        'There is no DOM at this stage — only JavaScript.',
      ], code: "// classic\nReact.createElement(Foo, { a: 1 }, 'hi')\n// modern JSX runtime\n_jsx(Foo, { a: 1, children: 'hi' })" },
      { id: 'runtime', title: 'createElement vs jsx-runtime', blurb: 'Two outputs.', points: [
        'Classic mode emits `React.createElement`.',
        'The modern runtime emits `_jsx` auto-imported from `react/jsx-runtime`, so you no longer import React just for JSX.',
      ] },
      { id: 'shape', title: 'Element Shape', blurb: 'The object.', points: [
        'An element is roughly `{ type, key, ref, props }`.',
        '`type` is a string ("div") for host elements, or a function/class for components.',
      ] },
      { id: 'immutable', title: 'Just Objects', blurb: 'Cheap & inert.', points: [
        'Elements are immutable, lightweight descriptions.',
        'Creating one touches no DOM on its own — rendering is what makes it real.',
      ] },
    ],
  },
  {
    id: 'vdom',
    group: 'react',
    title: 'Virtual DOM',
    tag: 'a description, not the thing',
    blurb: 'A tree of elements describing the UI you want React to produce.',
    children: [
      { id: 'what', title: 'What It Is', blurb: 'A snapshot.', points: [
        'The tree of elements your components return on a render.',
        'A lightweight description of the desired UI at that moment.',
      ] },
      { id: 'patch', title: 'Compare & Patch', blurb: 'Minimal ops.', points: [
        'React compares the new description to the previous one.',
        'It computes the smallest set of real DOM operations to make them match.',
      ] },
      { id: 'declarative', title: 'Why Declarative', blurb: 'The model.', points: [
        'You describe what the UI should be, not the step-by-step mutations.',
        'Fewer imperative bugs; React owns the how.',
      ] },
      { id: 'myth', title: 'The Myth', blurb: 'Not magic speed.', points: [
        'The vDOM is not inherently faster than hand-tuned DOM code.',
        'Its value is the programming model plus the batching and diffing it enables.',
      ] },
    ],
  },
  {
    id: 'fiber',
    group: 'react',
    title: 'Fiber',
    tag: 'work you can pause',
    blurb: 'Each element becomes a fiber — a resumable unit of work.',
    children: [
      { id: 'node', title: 'The Fiber Node', blurb: 'Per-element state.', points: [
        'A mutable object per element holding its type, props, state and effect flags.',
        'Unlike an element, a fiber persists across renders.',
      ] },
      { id: 'list', title: 'child / sibling / return', blurb: 'A linked list.', points: [
        'Fibers link via `child`, `sibling` and `return` (parent) pointers.',
        'That lets React walk the tree iteratively and stop between any two units of work — the whole point of Fiber (React 16+).',
      ] },
      { id: 'buffer', title: 'Double Buffering', blurb: 'Two trees.', points: [
        '`current` is on screen; `workInProgress` is built off-screen.',
        'On commit React swaps the pointer atomically, so users never see a half-built tree.',
      ] },
      { id: 'alternate', title: 'alternate pointer', blurb: 'Linking the trees.', points: [
        'Each fiber\'s `alternate` points to its counterpart in the other tree.',
        'React reuses these objects between renders instead of reallocating.',
      ] },
    ],
  },
  {
    id: 'reconciler',
    group: 'react',
    title: 'Reconciliation',
    tag: 'old tree vs new tree',
    blurb: 'A heuristic O(n) diff decides what to reuse, update or replace.',
    children: [
      { id: 'type', title: 'Type Comparison', blurb: 'The first check.', points: [
        'Different element `type` at a position → tear down the old subtree and build fresh.',
        'Same type → keep the DOM node and fiber, update only changed props.',
      ] },
      { id: 'keys', title: 'Keys', blurb: 'Identity in lists.', points: [
        '`key` tells React which list items are the same across renders, so it can move instead of recreate.',
        'Index-as-key breaks on reorder or insert — state ends up on the wrong row.',
      ] },
      { id: 'bailout', title: 'Bailout & memo', blurb: 'Skipping work.', points: [
        'If props and state are unchanged, React can bail out and reuse the subtree.',
        '`React.memo`, `useMemo` and stable callbacks make bailouts more likely.',
      ] },
      { id: 'heuristic', title: 'O(n) Heuristics', blurb: 'Why it is fast.', points: [
        'A true tree diff is O(n³).',
        'React assumes stable structure and matching keys to get linear time.',
      ] },
    ],
  },
  {
    id: 'phases',
    group: 'react',
    title: 'Render vs Commit',
    tag: 'two very different phases',
    blurb: 'Render builds the tree (interruptible); commit applies it (synchronous).',
    children: [
      { id: 'render', title: 'Render Phase', blurb: 'Pure & pausable.', points: [
        'React calls your components to build workInProgress and mark effects.',
        'This phase can run, bail out or restart, so it must be side-effect-free.',
      ] },
      { id: 'commit', title: 'Commit Phase', blurb: 'Sync & final.', points: [
        'Runs synchronously and cannot be interrupted.',
        'React mutates the DOM, swaps the trees, updates refs and runs effects.',
      ] },
      { id: 'effects', title: 'Layout vs Passive', blurb: 'Effect timing.', points: [
        '`useLayoutEffect` fires synchronously after DOM mutation, before paint — good for measuring.',
        '`useEffect` fires asynchronously after paint — good for most side effects.',
      ] },
      { id: 'strict', title: 'Strict Mode', blurb: 'Dev double-invoke.', points: [
        'In development Strict Mode double-invokes renders and some effects.',
        'It surfaces impure renders and missing effect cleanup early.',
      ] },
    ],
  },
  {
    id: 'hooks',
    group: 'react',
    title: 'Hooks',
    tag: 'state on a linked list',
    blurb: 'Hooks are a linked list on the fiber, read in order each render.',
    children: [
      { id: 'list', title: 'Hooks Linked List', blurb: 'Where state lives.', points: [
        'Each component fiber holds `memoizedState`: one record per hook call, linked in order.',
        'This is how a plain function "remembers" between renders.',
      ] },
      { id: 'order', title: 'Rules of Hooks', blurb: 'Order is identity.', points: [
        'React walks the list in call order every render.',
        'That is why hooks must never be called conditionally or in loops — the order must match.',
      ] },
      { id: 'closures', title: 'Closures & Deps', blurb: 'Stale state.', points: [
        'Each render captures its own props and state in closures.',
        'An effect or callback sees values from the render that created it; a stale value is usually a missing dependency.',
      ] },
      { id: 'stable', title: 'Refs, memo, callback', blurb: 'Stability tools.', points: [
        '`useState` setters and `useReducer` dispatch are stable across renders.',
        '`useRef` is a mutable box that persists without re-rendering; `useMemo`/`useCallback` cache values and functions.',
      ] },
    ],
  },
  {
    id: 'scheduler',
    group: 'react',
    title: 'Scheduler',
    tag: 'priority & time-slicing',
    blurb: 'A cooperative scheduler prioritizes updates and yields to the browser.',
    children: [
      { id: 'lanes', title: 'Priority Lanes', blurb: 'Tagging updates.', points: [
        'Updates carry a priority "lane" (a bitmask) — discrete input is urgent, transitions are low.',
        'Lanes let unrelated updates be grouped and ordered.',
      ] },
      { id: 'preempt', title: 'Preemption', blurb: 'Urgent wins.', points: [
        'React processes higher-priority lanes first.',
        'It can interrupt an in-progress low-priority render when something urgent arrives.',
      ] },
      { id: 'slice', title: 'Time Slicing', blurb: 'Yielding.', points: [
        'The scheduler works in small chunks and yields via a MessageChannel.',
        'Between chunks the browser can paint and handle input, so a big render never freezes the page.',
      ] },
      { id: 'expire', title: 'Expiration', blurb: 'No starvation.', points: [
        'Low-priority work that keeps getting preempted eventually expires.',
        'React then forces it through so nothing is starved forever.',
      ] },
    ],
  },
  {
    id: 'concurrent',
    group: 'react',
    title: 'Concurrent',
    tag: 'transitions & suspense',
    blurb: 'React can prepare UI in the background and interrupt it.',
    children: [
      { id: 'transition', title: 'Transitions', blurb: 'Non-urgent updates.', points: [
        '`startTransition` / `useTransition` mark an update as non-urgent.',
        'Typing stays responsive while a heavy re-render runs in a low-priority lane.',
      ] },
      { id: 'defer', title: 'useDeferredValue', blurb: 'Lagging values.', points: [
        'Lets a value lag behind during busy periods.',
        'The UI shows stale-but-interactive content instead of blocking.',
      ] },
      { id: 'suspense', title: 'Suspense', blurb: 'Throwing promises.', points: [
        'A component can "suspend" by throwing a promise.',
        'React shows the nearest `<Suspense fallback>` until it resolves, then retries the render.',
      ] },
      { id: 'stream', title: 'Streaming SSR & lazy', blurb: 'Splitting & flushing.', points: [
        '`React.lazy` code-splits components behind Suspense.',
        'Streaming SSR flushes HTML as each boundary resolves, so the page appears progressively.',
      ] },
    ],
  },
];

export const CONCEPT_BY_ID = Object.fromEntries(CONCEPTS.map(c => [c.id, c]));
export const conceptsOf = group => CONCEPTS.filter(c => c.group === group);
