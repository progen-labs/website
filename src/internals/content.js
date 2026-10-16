// All the words for the Internals Explorer. The 3D scenes reference item ids
// from here; the rail and the detail panel render the text.
// Inline `code` in strings is rendered as <code> by the panel.

export const MODELS = {
  browser: {
    id: 'browser',
    title: 'The Browser',
    kicker: 'A Chromium-style browser, taken apart',
    accent: '#ffb86b',
    summary: 'Every part of the window you use daily hides a whole subsystem. Click a part of the browser to fly inside it.',
    parts: [
      { id: 'tabs', scene: 'process', title: 'Tabs', blurb: 'Each tab is drawn by its own sandboxed renderer process.' },
      { id: 'omnibox', scene: 'network', title: 'Omnibox & toolbar', blurb: 'Pressing Enter starts navigation and the network stack.' },
      { id: 'viewport', scene: 'render', title: 'Viewport', blurb: 'Where HTML and CSS become pixels — the rendering pipeline.' },
      { id: 'devtools', scene: 'devtools', title: 'DevTools', blurb: 'The inspector: each panel and what it reveals.' },
      { id: 'v8', scene: 'runtime', title: 'V8 & the event loop', blurb: 'The JavaScript engine and the loop that schedules it.' },
    ],
  },
  react: {
    id: 'react',
    title: 'React',
    kicker: 'The atom, split open',
    accent: '#61dafb',
    summary: 'The nucleus is your components, the orbits are the phases of a render, and the electrons are the machinery that keeps it all moving. Click any part.',
    parts: [
      { id: 'nucleus', scene: 'components', title: 'Components & JSX', blurb: 'The core: functions that return a description of UI.' },
      { id: 'orbit-a', scene: 'reconcile', title: 'Reconciliation', blurb: 'Diffing the previous tree against the next one.' },
      { id: 'orbit-b', scene: 'fiber', title: 'Fiber', blurb: 'The data structure that makes rendering interruptible.' },
      { id: 'orbit-c', scene: 'commit', title: 'Commit & effects', blurb: 'Applying changes to the DOM, then running effects.' },
      { id: 'electron-a', scene: 'hooks', title: 'Hooks', blurb: 'State and effects stored as a list on each fiber.' },
      { id: 'electron-b', scene: 'scheduler', title: 'Scheduler & lanes', blurb: 'Priorities, time slicing and batching.' },
      { id: 'electron-c', scene: 'concurrent', title: 'Concurrent & Suspense', blurb: 'Background rendering, transitions and streaming.' },
      { id: 'moon-context', scene: 'context', title: 'Context', blurb: 'Broadcasting a value down the tree without props.' },
      { id: 'moon-rerender', scene: 'rerender', title: 'Re-render triggers', blurb: 'What makes a component render again — and what does not.' },
      { id: 'moon-events', scene: 'events', title: 'Synthetic events', blurb: 'One listener at the root, React does the rest.' },
      { id: 'moon-rsc', scene: 'rsc', title: 'Server Components', blurb: 'Components that run on the server and ship zero JS.' },
      { id: 'redux-link', scene: 'reactredux', title: 'Redux bridge', blurb: 'How react-redux plugs a Redux store into React.' },
    ],
  },
  redux: {
    id: 'redux',
    title: 'Redux',
    kicker: 'The store, and how React talks to it',
    accent: '#a78bfa',
    summary: 'One store holds the whole state tree. Actions flow one way through middleware and reducers, and React reads the result through selectors. The bridge on the left is react-redux.',
    parts: [
      { id: 'loop', scene: 'dataflow', title: 'The Redux loop', blurb: 'One-way data flow: dispatch → reduce → notify → render.' },
      { id: 'store-core', scene: 'store', title: 'Store & state tree', blurb: 'A single, immutable source of truth.' },
      { id: 'reducer', scene: 'reducers', title: 'rootReducer & slices', blurb: 'combineReducers, pure functions, structural sharing, Immer.' },
      { id: 'middleware', scene: 'middleware', title: 'Middleware', blurb: 'Where async work and side effects live.' },
      { id: 'thunk', scene: 'thunk', title: 'redux-thunk', blurb: 'Dispatching functions: how async actions work.' },
      { id: 'selector', scene: 'selectors', title: 'Selectors', blurb: 'Reading and memoizing derived state.' },
      { id: 'rtkq', scene: 'rtkq', title: 'RTK Query', blurb: 'Server-state caching built on the store.' },
      { id: 'bridge', scene: 'reactredux', title: 'React-Redux bridge', blurb: 'Provider, useSelector and useDispatch.' },
      { id: 'packages', scene: 'ecosystem', title: 'Production setup', blurb: 'Every package in a real-world React-Redux app, and the file layout.' },
    ],
  },
};

export const SCENES = {
  // ============================== BROWSER ==============================
  process: {
    model: 'browser',
    title: 'Tabs & the process model',
    kicker: 'Browser › Tabs',
    summary: 'A modern browser is a set of cooperating processes. Each tab you open is rendered by a sandboxed renderer, coordinated by one privileged browser process.',
    items: [
      { id: 'browser', title: 'Browser process', blurb: 'The privileged coordinator.', points: [
        'Owns the window UI (tab strip, omnibox, toolbar), navigation decisions, permissions and access to the profile on disk.',
        'It is the only process with broad OS privileges — everything else asks it over IPC.',
        'A crashing tab never takes it down; that isolation is the whole point of the split.',
      ] },
      { id: 'renderer', title: 'Renderer process', blurb: 'Blink + V8 for one site.', points: [
        'Runs Blink (HTML, CSS, DOM, layout, paint) and V8 (JavaScript) for the pages it hosts.',
        'Inside: a main thread (your JS, style, layout), a compositor thread and raster worker threads.',
        'Usually one per site. A hung or crashed renderer only kills its own tabs — the “Aw, Snap!” page.',
      ] },
      { id: 'sandbox', title: 'Sandbox', blurb: 'Least privilege, enforced by the OS.', points: [
        'Renderers run with OS-level restrictions: no direct file, network or device access.',
        'To fetch a URL or read a file they must ask the browser process, which validates every request.',
        'A compromised renderer is contained — an attacker also needs a separate sandbox escape.',
      ] },
      { id: 'gpu', title: 'GPU process', blurb: 'The only process that talks to the graphics driver.', points: [
        'Receives compositor frames from renderers and the browser UI, and draws them with the GPU (Viz).',
        'Isolating driver calls means a buggy driver crashes this process, not your tabs.',
        'Also performs GPU rasterization and hardware video decode.',
      ] },
      { id: 'netsvc', title: 'Network service', blurb: 'All networking, out of process.', points: [
        'DNS, sockets, TLS, HTTP/2 and HTTP/3, cookies and the HTTP cache live here.',
        'Renderers never open sockets; their fetches are brokered by the browser process.',
        'Running it as a separate utility process improves both stability and security.',
      ] },
      { id: 'ipc', title: 'Mojo IPC', blurb: 'How the processes talk.', points: [
        'Processes communicate over Mojo message pipes with typed interfaces defined in `.mojom` files.',
        'Messages are asynchronous, and the receiver validates everything — the sender may be compromised.',
        'Large payloads (pixels, response bodies) travel through shared memory instead of being copied.',
      ] },
      { id: 'isolation', title: 'Site isolation', blurb: 'One site per process.', points: [
        'Pages from different sites (scheme + registrable domain) get different renderer processes — cross-site iframes included (OOPIFs).',
        'This is the defence against Spectre-style attacks that read memory inside a process.',
        'The cost is memory, so the browser balances it with process limits on low-memory devices.',
      ] },
    ],
  },

  network: {
    model: 'browser',
    title: 'Navigation & the network',
    kicker: 'Browser › Omnibox',
    summary: 'Pressing Enter in the omnibox starts a journey: a name lookup, a secure handshake and a request that streams the page back — unless a cache answers first.',
    items: [
      { id: 'omnibox', title: 'Omnibox', blurb: 'URL or search?', points: [
        'As you type, providers (history, bookmarks, search suggestions) rank autocomplete matches.',
        'Enter decides: navigate to a URL, or send a query to the default search engine.',
        'The browser process starts navigating before any renderer exists, and may preconnect or prerender likely destinations.',
      ] },
      { id: 'dns', title: 'DNS lookup', blurb: 'Name → IP address.', points: [
        'Caches are checked first: the browser host cache, the OS resolver, then the network resolver.',
        'A cold lookup walks root → TLD → authoritative server. DNS-over-HTTPS can encrypt it.',
        '`<link rel="dns-prefetch">` and `preconnect` warm this up before the request is needed.',
      ] },
      { id: 'handshake', title: 'TCP + TLS handshake', blurb: 'Opening a secure connection.', points: [
        'TCP: SYN → SYN-ACK → ACK establishes the connection in one round trip.',
        'TLS 1.3 agrees keys in one more round trip; resumed sessions can send data with 0-RTT.',
        'HTTP/3 runs over QUIC, which merges the transport and crypto handshakes into a single round trip.',
      ] },
      { id: 'http', title: 'HTTP request & response', blurb: 'Headers, bodies, priorities.', points: [
        'The request carries headers: cookies, `Accept`, and cache validators like `If-None-Match`.',
        'HTTP/2 multiplexes many streams over one connection; HTTP/3 also removes TCP head-of-line blocking.',
        'The response streams back and the HTML parser starts on the first bytes — not the whole file.',
      ] },
      { id: 'server', title: 'Origin & CDN', blurb: 'Where the bytes come from.', points: [
        'A CDN edge near the user often answers from its own cache, cutting latency dramatically.',
        'On a miss it fetches from the origin and caches according to `Cache-Control`.',
        'Time To First Byte (TTFB) measures this whole trip plus server think time.',
      ] },
      { id: 'cache', title: 'HTTP cache', blurb: 'The fastest request is no request.', points: [
        'Memory and disk caches are checked before the network; a fresh `max-age` hit never touches it.',
        'Stale entries revalidate with `ETag` / `Last-Modified` and come back as a cheap `304 Not Modified`.',
        'The back/forward cache (bfcache) can restore an entire page instantly from memory.',
      ] },
      { id: 'serviceworker', title: 'Service worker', blurb: 'A programmable network proxy.', points: [
        'A script registered for an origin that intercepts that origin’s fetches.',
        'It can answer from Cache Storage, go to the network, or mix both — that is how offline apps work.',
        'It runs on its own thread with no DOM access and is woken up per event.',
      ] },
    ],
  },

  render: {
    model: 'browser',
    title: 'The rendering pipeline',
    kicker: 'Browser › Viewport',
    summary: 'The viewport is the end of a pipeline: bytes become a DOM, styles, geometry, paint commands, and finally a stack of layers the GPU composites. The floating stack is the page exploded into its layers.',
    items: [
      { id: 'parse', title: 'Parse → DOM', blurb: 'Bytes become a tree.', points: [
        'The HTML tokenizer streams bytes into tokens; tree construction turns them into DOM nodes.',
        'A plain `<script>` blocks the parser; `defer` and `async` do not. A preload scanner fetches ahead.',
        'The DOM is the live object model your JavaScript reads and mutates.',
      ] },
      { id: 'style', title: 'Style', blurb: 'CSSOM + selectors → computed style.', points: [
        'Stylesheets parse into the CSSOM, and every element is matched against its rules.',
        'The cascade (origin, specificity, order) plus inheritance produce one computed style per element.',
        'Toggling a class can invalidate styles for a whole subtree — keep selectors scoped.',
      ] },
      { id: 'layout', title: 'Layout', blurb: 'Geometry for every box.', points: [
        'Computes the position and size of each box: block, inline, flex, grid and text line-breaking.',
        'The result is a tree of fragments with exact geometry.',
        'Reading `offsetHeight` right after a style write forces a synchronous layout — the root of layout thrashing.',
      ] },
      { id: 'paint', title: 'Paint', blurb: 'A list of drawing commands.', points: [
        'Paint walks the layout tree and records display items: draw rect, draw text, draw image.',
        'Nothing is drawn yet — it is an ordered recipe (a display list), grouped into paint chunks.',
        'Changing `color` or `background` repaints but skips layout.',
      ] },
      { id: 'composite', title: 'Layers & compositing', blurb: 'The page is a stack of layers.', points: [
        'Content is split into layers — e.g. `position: fixed`, `will-change: transform`, video and canvas.',
        'The compositor thread moves, scales and fades whole layers without touching the main thread.',
        'That is why animating `transform` and `opacity` stays smooth even while JavaScript is busy.',
      ] },
      { id: 'raster', title: 'Raster & display', blurb: 'Tiles → GPU → screen.', points: [
        'Layers are cut into tiles and rasterized into bitmaps, usually on the GPU.',
        'The compositor assembles a frame from those tiles and hands it to the GPU process.',
        'The frame is shown on the next vsync — ideally every 16.7 ms on a 60 Hz display.',
      ] },
    ],
  },

  devtools: {
    model: 'browser',
    title: 'DevTools, panel by panel',
    kicker: 'Browser › DevTools',
    summary: 'The inspector is a window into every subsystem you just saw. Each card is a panel; the object floating in front of it is what that panel lets you see.',
    items: [
      { id: 'elements', title: 'Elements', blurb: 'Live DOM, styles and the box model.', points: [
        'Shows the live DOM — not your source HTML — so anything JavaScript changed is reflected.',
        'The Styles pane lists matched rules in cascade order; struck-through declarations lost the cascade.',
        'The box model: content (blue), padding (green), border (yellow), margin (orange) — the nested boxes in front.',
      ] },
      { id: 'console', title: 'Console', blurb: 'A REPL into the page.', points: [
        'Evaluates JavaScript in the page’s context; `$0` is the element selected in Elements.',
        '`console.table`, `console.time` and `console.trace` go well beyond `console.log`.',
        'Uncaught errors and unhandled promise rejections appear here with stack traces.',
      ] },
      { id: 'sources', title: 'Sources', blurb: 'The debugger.', points: [
        'Set line, conditional and logpoint breakpoints; pause on exceptions or DOM mutations.',
        'While paused, inspect the call stack and scope, and step in, over and out.',
        'Source maps map minified bundles back to the files you actually wrote.',
      ] },
      { id: 'network', title: 'Network', blurb: 'Every request on a waterfall.', points: [
        'Each bar shows phases: queueing, DNS, connect, TLS, waiting for the first byte, download.',
        'Throttle to slow 3G, disable the cache, or block requests to test the worst case.',
        'The Initiator column shows which script or parser line triggered each request.',
      ] },
      { id: 'performance', title: 'Performance', blurb: 'A recording of the main thread.', points: [
        'Flame charts show call stacks over time: yellow = scripting, purple = rendering, green = painting.',
        'Long tasks (over 50 ms) are flagged in red — they block input and hurt INP.',
        'Core Web Vitals (LCP, CLS, INP) are measured live in the panel.',
      ] },
      { id: 'application', title: 'Application', blurb: 'Storage and app plumbing.', points: [
        'Inspect localStorage, sessionStorage, IndexedDB, cookies and Cache Storage.',
        'Manage service workers, the web app manifest, and back/forward-cache eligibility.',
        '“Clear site data” reproduces a first visit in one click.',
      ] },
    ],
  },

  runtime: {
    model: 'browser',
    title: 'V8 & the event loop',
    kicker: 'Browser › JavaScript',
    summary: 'V8 compiles and runs your JavaScript on a single main thread. The event loop decides what runs next — watch tasks flow from the Web APIs, through the queues, onto the call stack.',
    items: [
      { id: 'v8', title: 'V8 pipeline', blurb: 'Parse → Ignition → optimizing tiers.', points: [
        'Source is parsed (lazily) into an AST, compiled to bytecode and run by the Ignition interpreter.',
        'Hot functions are optimized by Maglev and TurboFan using type feedback gathered while running.',
        'If an assumption breaks — say a new object shape — the code deoptimizes back to bytecode.',
      ] },
      { id: 'heap', title: 'Heap & garbage collection', blurb: 'Where objects live and die.', points: [
        'New objects are allocated in the young generation; survivors are promoted to the old generation.',
        'The young space is scavenged quickly; the old space is marked and compacted, mostly concurrently.',
        'Detached DOM nodes and ever-growing caches are classic leaks — find them with heap snapshots.',
      ] },
      { id: 'stack', title: 'Call stack', blurb: 'One thing at a time.', points: [
        'Each call pushes a frame; returning pops it. JavaScript on the main thread is single-threaded.',
        'While the stack is non-empty nothing else on the main thread runs — no rendering, no input.',
        'A long-running stack is a “long task”: split the work or move it to a Web Worker.',
      ] },
      { id: 'webapis', title: 'Web APIs', blurb: 'Work done outside JavaScript.', points: [
        'Timers, network requests (`fetch`) and DOM events are handled by the browser, not by V8.',
        'When they finish, they queue a callback — a task, or a microtask for a promise.',
        'That is how async code waits without blocking the stack.',
      ] },
      { id: 'tasks', title: 'Task queue', blurb: 'Macrotasks, one per turn.', points: [
        'Timer callbacks, input events and messages are queued as tasks.',
        'The loop takes one task, runs it to completion, then drains the microtasks.',
        'There are several task queues, and the browser may prioritise input over timers.',
      ] },
      { id: 'microtasks', title: 'Microtask queue', blurb: 'Drained completely, every time.', points: [
        'Promise reactions, `queueMicrotask` and MutationObserver callbacks go here.',
        'Whenever the stack empties, every microtask runs — including ones queued along the way.',
        'An endless microtask chain starves rendering just like an infinite loop.',
      ], code: "console.log(1);\nsetTimeout(() => console.log('task'), 0);\nPromise.resolve().then(() => console.log('micro'));\nconsole.log(2);\n// → 1, 2, micro, task" },
      { id: 'loop', title: 'The event loop', blurb: 'Pick a task, run it, repeat.', points: [
        'One turn: run the oldest task → drain microtasks → maybe render → repeat.',
        'Rendering only happens between tasks, so long tasks delay frames.',
        '`setTimeout(fn, 0)` is a task; `Promise.resolve().then(fn)` is a microtask — it always runs first.',
      ] },
      { id: 'render-steps', title: 'Render steps', blurb: 'When the browser paints.', points: [
        'Roughly every 16.7 ms the loop may run: `requestAnimationFrame` callbacks → style → layout → paint.',
        '`requestAnimationFrame` runs right before the next frame — the right place for visual updates.',
        '`requestIdleCallback` uses whatever time is left after a frame.',
      ] },
    ],
  },

  // =============================== REACT ===============================
  components: {
    model: 'react',
    title: 'Components & JSX',
    kicker: 'React › Nucleus',
    summary: 'You write JSX; a compiler turns it into function calls; those calls produce plain element objects; React builds a tree of components from them. Props flow down the tree.',
    items: [
      { id: 'jsx', title: 'JSX', blurb: 'HTML-like syntax for function calls.', points: [
        'JSX is neither HTML nor a template language — it is syntax that compiles to JavaScript.',
        'Curly braces embed any expression; capitalised tags are components, lowercase ones are host elements.',
      ], code: 'function App() {\n  return (\n    <Layout>\n      <Header title="Todos" />\n      <TodoList items={todos} />\n    </Layout>\n  );\n}' },
      { id: 'compiler', title: 'Compiler (Babel / SWC)', blurb: 'JSX → function calls.', points: [
        'The automatic runtime turns `<Header title="Todos" />` into `jsx(Header, { title: "Todos" })`.',
        'The import from `react/jsx-runtime` is inserted for you.',
        'The optional React Compiler can also memoize components automatically at build time.',
      ], code: "import { jsx } from 'react/jsx-runtime';\njsx(Layout, {\n  children: [\n    jsx(Header, { title: 'Todos' }),\n    jsx(TodoList, { items: todos }),\n  ],\n});" },
      { id: 'element', title: 'React elements', blurb: 'Plain description objects.', points: [
        'A component returns elements: objects shaped like `{ $$typeof, type, key, ref, props }`.',
        'Elements are immutable and cheap — creating one never touches the DOM.',
        'React reads them to decide what the UI should look like.',
      ] },
      { id: 'tree', title: 'Component tree', blurb: 'Components all the way down.', points: [
        'Components render other components until the leaves are host elements (`div`, `li`).',
        'React keeps one internal instance — a fiber — per element position, across renders.',
        'The tree is the unit of reasoning: data flows down, events bubble up.',
      ] },
      { id: 'props', title: 'Props & one-way data flow', blurb: 'Data flows down.', points: [
        'Parents pass props to children; children never mutate them.',
        'To change data, a child calls a callback prop and the owner updates its own state.',
        'Lifting state to the nearest common parent keeps siblings in sync.',
      ] },
      { id: 'purity', title: 'Pure components', blurb: 'Same inputs → same output.', points: [
        'Rendering must be a pure calculation: never mutate props or state, and no side effects while rendering.',
        'React may render a component more than once, render it and throw the result away, or skip it entirely — purity is what makes that safe.',
        'Side effects belong in event handlers or effects. Strict Mode renders twice in development to surface impure code.',
      ] },
      { id: 'composition', title: 'Composition', blurb: '`children`, slots and lifting content up.', points: [
        'Components nest other components through `children` or any prop that holds JSX (a “slot”).',
        'React favours composition over inheritance — there is no component inheritance model to learn.',
        'Passing JSX in from above lets a parent own state without re-rendering the subtree it was handed: that subtree is created by the grandparent.',
      ] },
    ],
  },

  reconcile: {
    model: 'react',
    title: 'Reconciliation',
    kicker: 'React › Orbit',
    summary: 'Every render produces a new tree. React walks it alongside the previous one and works out the smallest set of DOM changes. Watch keys move, a node get removed and one get inserted.',
    items: [
      { id: 'vdom', title: 'Two trees', blurb: 'Previous render vs next render.', points: [
        'Each render produces a fresh tree of elements; React compares it with the previous one.',
        'The output is a minimal list of changes to apply to the DOM.',
        '“Virtual DOM” is the popular name for these element trees; React calls the process reconciliation.',
      ] },
      { id: 'type', title: 'Type comparison', blurb: 'Same type → update. Different → replace.', points: [
        'If the type at a position matches (`div` → `div`, `Header` → `Header`), React keeps the instance and updates props.',
        'If it differs (`div` → `section`), the whole subtree is unmounted and rebuilt — its state is lost.',
        'Never declare a component inside another: a new function type every render resets its state.',
      ] },
      { id: 'keys', title: 'Keys', blurb: 'Identity for list items.', points: [
        'Keys let React match children across renders even when they move.',
        'Here `c` moves to the front, `b` is removed and `d` is inserted — only those operations reach the DOM.',
        'Index-as-key breaks as soon as items are inserted or reordered.',
      ] },
      { id: 'props', title: 'Prop updates', blurb: 'Change only what changed.', points: [
        'For a matched host element, React diffs props and updates only the changed attributes or text.',
        'The heading text changed, so a single text update is queued.',
        'Event handlers are delegated at the root, so swapping a handler costs nothing in the DOM.',
      ] },
      { id: 'bailout', title: 'Bailout', blurb: 'Skip what didn’t change.', points: [
        'If a component’s props, state and context are unchanged, React skips rendering it and its children.',
        '`React.memo` compares props shallowly; stable references from `useMemo` / `useCallback` keep that working.',
        'The React Compiler applies this automatically.',
      ] },
      { id: 'patch', title: 'Commit list', blurb: 'The minimal DOM operations.', points: [
        'Reconciliation flags fibers with effects: placement, update, deletion.',
        'In the commit phase React applies them in one synchronous pass.',
        'The browser paints once — no half-updated states are ever shown.',
      ] },
      { id: 'remount', title: 'A new key = a new instance', blurb: 'Keys can reset state on purpose.', points: [
        'Changing a component’s `key` makes React unmount the old instance and mount a fresh one.',
        '`<Profile key={userId} />` resets all of Profile’s state whenever the user changes — no effect needed.',
        'Same type + same key → update in place. Different key → remount, with brand-new state and effects.',
      ] },
    ],
  },

  fiber: {
    model: 'react',
    title: 'Fiber architecture',
    kicker: 'React › Orbit',
    summary: 'Every component instance is a fiber, linked by child, sibling and return pointers. The glowing cursor is the work loop walking the tree — down with beginWork, back up with completeWork. The dim tree behind is “current”.',
    items: [
      { id: 'node', title: 'Fiber node', blurb: 'One unit of work.', points: [
        'A fiber is a plain object per component instance: type, props, state (`memoizedState`), flags and pointers.',
        'Fibers persist across renders; elements are recreated every time.',
      ], code: '{\n  tag, type, key,\n  child, sibling, return,\n  alternate,\n  pendingProps, memoizedProps,\n  memoizedState,\n  flags, lanes,\n}' },
      { id: 'links', title: 'child · sibling · return', blurb: 'A tree as a linked list.', points: [
        '`child` points to the first child, `sibling` to the next sibling, `return` back to the parent.',
        'That lets React walk the tree with a loop instead of recursion.',
        'A loop can stop at any node and resume later — recursion cannot.',
      ] },
      { id: 'workloop', title: 'The work loop', blurb: 'beginWork down, completeWork up.', points: [
        '`performUnitOfWork` runs `beginWork` on a fiber (render it, reconcile its children) and moves to its child.',
        'With no child, it runs `completeWork` and moves to the sibling — or returns to the parent.',
        'The glowing cursor is exactly that traversal: blue while beginning, amber while completing.',
      ] },
      { id: 'buffers', title: 'Double buffering', blurb: 'current & workInProgress.', points: [
        '`current` is the tree on screen (the dim one behind); `workInProgress` is the tree being built.',
        'Work happens on workInProgress without disturbing what the user sees.',
        'On commit React swaps the root pointer — workInProgress becomes current.',
      ] },
      { id: 'alternate', title: 'alternate', blurb: 'Links the two trees.', points: [
        'Each fiber’s `alternate` points to its twin in the other tree (the dashed violet links).',
        'React reuses those objects between renders instead of allocating new ones.',
        'Comparing a fiber with its alternate is how React knows what changed.',
      ] },
      { id: 'yield', title: 'Yielding', blurb: 'Interruptible rendering.', points: [
        'In concurrent rendering the loop checks `shouldYield()` between units of work.',
        'When the ~5 ms slice is used up, React pauses so the browser can paint or handle input.',
        'Higher-priority updates can interrupt and restart lower-priority work.',
      ] },
      { id: 'flags', title: 'Effect flags', blurb: 'What the commit has to do.', points: [
        'While reconciling, fibers are marked with flags such as `Placement`, `Update`, `ChildDeletion`, `Ref` and `Passive`.',
        'Each parent folds its children’s flags into `subtreeFlags`, so the commit can skip whole subtrees that have nothing to do.',
        'The commit phase then walks only the flagged paths and performs exactly those operations.',
      ] },
    ],
  },

  commit: {
    model: 'react',
    title: 'Commit & effects',
    kicker: 'React › Orbit',
    summary: 'A render is split in two: a pure, interruptible render phase, then a synchronous commit. Follow the playhead along the timeline and watch what happens above it in each phase.',
    items: [
      { id: 'render', title: 'Render phase', blurb: 'Pure and interruptible.', points: [
        'React calls your components and reconciles children. Nothing visible happens yet.',
        'It can be paused, restarted or thrown away, so render must be pure — no side effects.',
        'Strict Mode double-invokes renders in development to catch impurity.',
      ] },
      { id: 'before', title: 'Before mutation', blurb: 'Snapshot the old DOM.', points: [
        'Runs `getSnapshotBeforeUpdate` for class components — e.g. reading the scroll position before it changes.',
        'The DOM is still the old one at this point.',
      ] },
      { id: 'mutation', title: 'Mutation', blurb: 'Apply the DOM changes.', points: [
        'Inserts, updates and removes host nodes according to the flags set during reconciliation.',
        'Detaches old refs and runs layout-effect cleanups for removed components.',
        'Finally switches `root.current` to the new tree.',
      ] },
      { id: 'layout', title: 'Layout effects', blurb: 'Before the browser paints.', points: [
        '`useLayoutEffect` and ref callbacks run synchronously after mutation, before paint.',
        'Use them to measure the DOM and reposition without flicker.',
        'They block the paint — keep them short.',
      ] },
      { id: 'paint', title: 'Browser paint', blurb: 'The user sees it.', points: [
        'React yields; the browser runs style, layout and paint for the new DOM.',
        'Every change from one commit appears in the same frame.',
      ] },
      { id: 'passive', title: 'Passive effects', blurb: '`useEffect`, after paint.', points: [
        '`useEffect` callbacks run after the browser has painted.',
        'Cleanups from the previous render run first, then the new effects.',
        'Ideal for subscriptions, logging and other non-visual side effects.',
      ] },
      { id: 'strict', title: 'Strict Mode (development)', blurb: 'Stress-testing render and effects.', points: [
        'In development, Strict Mode renders every component twice and throws one result away — impure renders show up as bugs immediately.',
        'It also mounts, unmounts and re-mounts every effect once, so a missing cleanup function becomes obvious.',
        'None of this happens in production builds.',
      ] },
    ],
  },

  hooks: {
    model: 'react',
    title: 'Hooks',
    kicker: 'React › Electron',
    summary: 'A function component has no instance — its hooks live as a linked list on its fiber. The ring walks the list in call order on every render; that order is how React knows which state is which.',
    items: [
      { id: 'fiber', title: 'Component fiber', blurb: 'Where hooks live.', points: [
        'The fiber’s `memoizedState` points to the first hook; each hook points to the `next`.',
        'On every re-render React walks the list again and hands each hook its stored value.',
      ] },
      { id: 'state', title: 'useState', blurb: 'A value plus an update queue.', points: [
        'Stores the current value and a queue of pending updates.',
        '`setCount(c => c + 1)` enqueues an update and schedules a render; the new value is computed during it.',
        'The setter is stable for the component’s lifetime.',
      ] },
      { id: 'reducer', title: 'useReducer', blurb: 'State transitions as actions.', points: [
        '`const [state, dispatch] = useReducer(reducer, initial)` — the same `(state, action) → newState` idea Redux is built on, local to one component.',
        'Each `dispatch` queues an action; the reducer runs during the next render to compute the new state.',
        'Reach for it when the next state depends on the previous one in several ways, or to pass a single `dispatch` down instead of many callbacks.',
      ] },
      { id: 'effect', title: 'useEffect', blurb: 'Side effects with dependencies.', points: [
        'Stores the effect, its cleanup and its dependency array.',
        'After commit, deps are compared with `Object.is`; only changes re-run the effect.',
        'Missing dependencies cause stale values — the lint rule catches most of them.',
      ] },
      { id: 'memo', title: 'useMemo / useCallback', blurb: 'Cached values.', points: [
        'Store `[value, deps]` and recompute only when a dependency changes.',
        '`useCallback(fn, deps)` is just `useMemo(() => fn, deps)` — a stable function reference.',
        'Useful for keeping `memo` children from re-rendering; not a free performance win.',
      ] },
      { id: 'ref', title: 'useRef', blurb: 'A mutable box.', points: [
        'Returns the same `{ current }` object on every render.',
        'Changing `.current` does not trigger a render.',
        'Use it for DOM nodes, timer ids and anything that must persist without rendering.',
      ] },
      { id: 'rules', title: 'Rules of Hooks', blurb: 'Order is identity.', points: [
        'Hooks are matched by call order, not by name.',
        'A hook inside an `if` shifts every hook after it — React would hand the wrong state to the wrong hook (the red row).',
        'So: call hooks at the top level, in the same order, on every render.',
      ] },
      { id: 'closures', title: 'Closures & snapshots', blurb: 'Each render sees its own values.', points: [
        'Every render is a function call with its own props and state constants.',
        'Handlers and effects capture the values from the render that created them.',
        'That is why a timeout can log an “old” count — read the latest through the updater form or a ref.',
      ] },
    ],
  },

  scheduler: {
    model: 'react',
    title: 'Scheduler & lanes',
    kicker: 'React › Electron',
    summary: 'Updates travel in priority lanes into the scheduler. Work is cut into ~5 ms slices with gaps where the browser gets a turn, so the page never freezes.',
    items: [
      { id: 'lanes', title: 'Lanes', blurb: 'Priorities as bits.', points: [
        'Every update gets a lane: Sync (discrete input), InputContinuous (drag, scroll), Default, Transition, Idle.',
        'Lanes are bits in a 31-bit mask, so React can group and compare batches cheaply.',
        'The highest-priority pending lanes are rendered first — note how fast the top lane moves.',
      ] },
      { id: 'preempt', title: 'Interruptions', blurb: 'Urgent work cuts in.', points: [
        'If a click arrives while a transition is rendering, React drops that in-progress work and handles the click first.',
        'The interrupted render restarts later with the latest state.',
        'This is only safe because render is pure and nothing was committed.',
      ] },
      { id: 'slicing', title: 'Time slicing', blurb: 'Work in ~5 ms chunks.', points: [
        'Concurrent renders run in small slices, checking the clock between fibers.',
        'Between slices the main thread is free for input and paint.',
        'Urgent (sync) renders do not slice — they finish in one go.',
      ] },
      { id: 'yield', title: 'Yielding via MessageChannel', blurb: 'Give the browser a turn.', points: [
        'The scheduler posts a message to itself to continue in a fresh task.',
        'Unlike `setTimeout`, MessageChannel is not clamped to 4 ms.',
        'Each new task lets the event loop process input and rendering in between.',
      ] },
      { id: 'batching', title: 'Automatic batching', blurb: 'Many setStates, one render.', points: [
        'Updates in the same event, timeout or promise are batched into one render (React 18+).',
        'Three `setState` calls → one reconciliation → one commit.',
        '`flushSync` opts out when you truly need the DOM updated immediately.',
      ] },
      { id: 'expiry', title: 'Starvation guard', blurb: 'Low priority, not never.', points: [
        'Each lane gets an expiration time when it is scheduled.',
        'If it keeps being interrupted past that time, React renders it synchronously to finish it.',
      ] },
    ],
  },

  concurrent: {
    model: 'react',
    title: 'Concurrent rendering & Suspense',
    kicker: 'React › Electron',
    summary: 'React can prepare UI in the background, keep the old UI on screen while it waits, and stream server HTML in pieces that become interactive independently.',
    items: [
      { id: 'transition', title: 'Transitions', blurb: 'Urgent vs non-urgent.', points: [
        '`startTransition(() => setQuery(v))` marks an update as non-urgent.',
        'The input updates immediately; the heavy list renders in the background (ghosted) and commits when ready.',
        '`isPending` from `useTransition` lets you show a subtle loading hint.',
      ] },
      { id: 'deferred', title: 'useDeferredValue', blurb: 'A value that lags behind.', points: [
        'Returns the previous value during urgent renders, then re-renders with the latest in the background.',
        'Perfect for search-as-you-type where results are expensive to render.',
        'Pair it with `memo` so the deferred subtree really skips work.',
      ] },
      { id: 'suspense', title: 'Suspense boundary', blurb: 'Declarative loading states.', points: [
        '`<Suspense fallback={<Spinner />}>` shows the fallback while anything inside is waiting.',
        'Boundaries nest, so each region can reveal independently.',
        'During a transition React keeps the old UI on screen instead of flashing a fallback.',
      ] },
      { id: 'promise', title: 'Suspending', blurb: 'Waiting on a promise.', points: [
        'A component suspends when it reads data that is not ready — e.g. `use(promise)` or a Suspense-enabled data library.',
        'React catches it at the nearest boundary and retries when the promise resolves.',
        'No `isLoading` flags threaded through props.',
      ] },
      { id: 'streaming', title: 'Streaming SSR', blurb: 'HTML in chunks.', points: [
        '`renderToPipeableStream` sends the shell immediately, then streams each Suspense boundary as its data resolves.',
        'The browser paints the shell before the slow parts are done.',
        'Server Components take this further: components that only ever run on the server.',
      ] },
      { id: 'hydration', title: 'Selective hydration', blurb: 'Interactive in pieces.', points: [
        'Hydration attaches React to server-rendered HTML so it becomes interactive.',
        'With Suspense, each boundary hydrates independently, and React prioritises the part the user touches.',
        'The page becomes usable before all of its JavaScript has run.',
      ] },
    ],
  },

  // ========================= REACT · SATELLITES =========================
  context: {
    model: 'react',
    title: 'Context',
    kicker: 'React › Satellite',
    summary: 'A Provider broadcasts a value to every consumer below it. Watch the wave: when the value changes, only the consumers light up — even through a memoized parent. On the left, the prop-drilling it replaces.',
    items: [
      { id: 'provider', title: 'Provider', blurb: 'Puts a value into the tree.', points: [
        '`<ThemeContext.Provider value={theme}>` makes `theme` available to every component below it.',
        'Providers nest and override: the closest Provider above a consumer wins.',
        'Without a Provider, consumers get the default passed to `createContext(default)`.',
      ] },
      { id: 'consumer', title: 'Consumers', blurb: '`useContext` reads the nearest value.', points: [
        '`const theme = useContext(ThemeContext)` subscribes a component to that context.',
        'React walks up the fiber tree to find the nearest matching Provider.',
        'Consumers re-render whenever the Provider’s value changes (compared with `Object.is`).',
      ] },
      { id: 'propagation', title: 'Change propagation', blurb: 'It skips past memo.', points: [
        'When the value changes, React finds every consumer of that context below the Provider and schedules them to re-render.',
        'This bypasses `React.memo` on intermediate components — the grey “memo” node is skipped, yet the consumers below it still update.',
        'Components that do not read the context are unaffected by the change itself.',
      ] },
      { id: 'drilling', title: 'Prop drilling', blurb: 'The problem context solves.', points: [
        'Without context, a value used deep in the tree must be passed through every component in between.',
        'Intermediate components have to know about props they never use, which makes refactors painful.',
        'Context lets the value “teleport” to whoever needs it — but composition (passing JSX down) is often an even simpler fix.',
      ] },
      { id: 'split', title: 'Performance tips', blurb: 'Stable values, split contexts.', points: [
        'Passing a fresh object (`value={{ user, setUser }}`) re-renders every consumer on every Provider render — wrap it in `useMemo`.',
        'Split rarely-changing and often-changing data into separate contexts.',
        'Context is a transport, not a state manager: for frequent global updates with fine-grained subscriptions, a store such as Redux scales better.',
      ] },
    ],
  },

  rerender: {
    model: 'react',
    title: 'What triggers a re-render',
    kicker: 'React › Satellite',
    summary: 'A state update in Counter re-renders Counter and everything below it — except the memoized Chart, whose props did not change. Parents and siblings are untouched. Watch the cascade.',
    items: [
      { id: 'triggers', title: 'The triggers', blurb: 'Only three things start a render.', points: [
        'A state update in the component (`setState`, `dispatch`).',
        'Its parent re-rendered (by default, children render again with their parent).',
        'A context it reads changed. A changed `key` is different again — that is a remount, not a re-render.',
        'Note: “props changed” is not a trigger by itself — props only change because the parent rendered.',
      ] },
      { id: 'cascade', title: 'The cascade', blurb: 'Down the tree, never up.', points: [
        'A render starts at the component whose state changed and flows to all of its descendants.',
        'Parents and siblings are not re-rendered — the App and Dashboard branch stays dark.',
        'This is why where you put state matters: move it as low as possible (“state colocation”).',
      ] },
      { id: 'memo', title: 'React.memo stops it', blurb: 'Same props → skip.', points: [
        '`memo(Chart)` re-renders only if a prop changed (shallow comparison).',
        'When it skips, its whole subtree is skipped too — Chart’s bars stay grey.',
        'Passing new objects or inline functions as props defeats memo; stabilise them with `useMemo` / `useCallback`, or let the React Compiler do it.',
      ] },
      { id: 'unaffected', title: 'Untouched branches', blurb: 'Parents and siblings stay put.', points: [
        'React only re-renders the subtree under the component that changed.',
        'Lifting state up widens that subtree; pushing state down narrows it.',
        'A component that wraps its children (`<Layout>{children}</Layout>`) does not re-render those children when only its own state changes.',
      ] },
      { id: 'render-vs-dom', title: 'Render ≠ DOM update', blurb: 'Re-rendering is often cheap.', points: [
        'A re-render just calls your component again and reconciles the result.',
        'If the output is the same, nothing is written to the DOM at all.',
        'Optimise when profiling shows a slow render — not by reflex.',
      ] },
    ],
  },

  events: {
    model: 'react',
    title: 'Synthetic events',
    kicker: 'React › Satellite',
    summary: 'A click travels down the real DOM (capture) and back up (bubble) to the root container, where React’s single listener catches it, builds a SyntheticEvent and replays the handlers along the fiber path.',
    items: [
      { id: 'delegation', title: 'Delegation at the root', blurb: 'One listener, not thousands.', points: [
        'React does not attach listeners to each element. Since React 17 it listens once per event type on the root container.',
        'Native events reach that listener during capture and bubble, and React takes it from there.',
        'Attaching at the root (not `document`) lets several React apps — even different versions — live on one page.',
      ] },
      { id: 'phases', title: 'Capture & bubble', blurb: 'Down to the target, back up.', points: [
        'The browser dispatches the event from `window` down to the target (capture), then back up (bubble).',
        'React mirrors that: `onClickCapture` handlers run top-down, then `onClick` handlers run bottom-up.',
        '`e.stopPropagation()` stops propagation through the React tree, just like the DOM.',
      ] },
      { id: 'synthetic', title: 'SyntheticEvent', blurb: 'A normalized wrapper.', points: [
        'Handlers receive a SyntheticEvent with the same interface everywhere, smoothing over browser differences.',
        'The original is available as `e.nativeEvent`.',
        'Event pooling was removed in React 17, so it is safe to read the event asynchronously.',
      ] },
      { id: 'handlers', title: 'Dispatching handlers', blurb: 'Walking the fiber path.', points: [
        'From the target fiber, React collects the matching handlers on the way up to the root.',
        'It then calls them in order: capture handlers first (top-down), then bubble handlers (bottom-up).',
        'Events inside a portal bubble through the React tree, not the DOM tree.',
      ] },
      { id: 'ev-batching', title: 'Batching in handlers', blurb: 'Many updates, one render.', points: [
        'Every `setState` inside an event handler is batched — the component renders once after the handler returns.',
        'Since React 18 this also applies to timeouts, promises and native handlers.',
      ] },
      { id: 'ev-priority', title: 'Event priority', blurb: 'Clicks are urgent.', points: [
        'Discrete events (click, keydown) schedule updates on the SyncLane and are flushed immediately.',
        'Continuous events (mousemove, scroll) get InputContinuous priority.',
        'This is how the scheduler knows typing must never wait behind a transition.',
      ] },
    ],
  },

  rsc: {
    model: 'react',
    title: 'Server Components',
    kicker: 'React › Satellite',
    summary: 'Server Components run only on the server, read data directly and send a serialized description of their output — the RSC payload. Client Components, marked with “use client”, hydrate in the browser.',
    items: [
      { id: 'server-tree', title: 'Server Components', blurb: 'Render on the server, ship no JS.', points: [
        'They run only on the server (at request or build time) and can be `async` — `await db.post.find(id)` directly in the component.',
        'Their code is never sent to the browser, so heavy dependencies cost the user nothing.',
        'They cannot use state, effects or browser APIs.',
      ] },
      { id: 'db', title: 'Direct data access', blurb: 'No API layer needed.', points: [
        'Because they run on the server, Server Components can query a database or read files directly.',
        'Secrets and tokens stay on the server.',
        'Data fetching happens close to the data, avoiding client–server waterfalls.',
      ] },
      { id: 'payload', title: 'The RSC payload', blurb: 'A streamed description of the UI.', points: [
        'The server renders Server Components into a compact serialized tree (the “Flight” format), not HTML alone.',
        'It contains rendered output plus references to Client Components and their props.',
        'It streams: chunks arrive as Suspense boundaries resolve, and React merges them into the tree on the client.',
      ] },
      { id: 'boundary', title: '“use client” boundary', blurb: 'Where the client tree begins.', points: [
        '`"use client"` at the top of a file marks it — and everything it imports — as client code.',
        'Props passed across the boundary must be serializable (no functions, except Server Functions).',
        'Server Components can render Client Components, and can pass Server Components to them as `children`.',
      ] },
      { id: 'client-tree', title: 'Client Components', blurb: 'Interactive islands.', points: [
        'They render on the server for the initial HTML too, then hydrate in the browser.',
        'They are the only place for state, effects, refs and event handlers.',
        'Keep them small and push them to the leaves — the rest of the tree stays server-only.',
      ] },
      { id: 'actions', title: 'Server Functions', blurb: '“use server” — call the server like a function.', points: [
        'A function marked `"use server"` can be passed to the client and called from a form or handler.',
        'React sends a request to the server, runs the function there, and can stream back an updated payload.',
        'Treat them like public API endpoints: validate input and check authorization.',
      ] },
    ],
  },

  // =========================== REACT ⟷ REDUX ===========================
  reactredux: {
    model: 'redux',
    title: 'React-Redux: the bridge',
    kicker: 'Redux › React-Redux',
    summary: 'The Add button dispatches an action; the store updates and notifies every subscriber; each useSelector re-runs its selector and compares. Only components whose selected value changed re-render (green) — the rest bail out (grey).',
    items: [
      { id: 'rr-provider', title: '<Provider store>', blurb: 'The store, not the state, goes into context.', points: [
        '`<Provider store={store}>` puts the store object into React context once.',
        'The store reference never changes, so context never triggers re-renders — updates travel through subscriptions instead.',
        'Any component below can reach the store through the hooks.',
      ] },
      { id: 'useselector', title: 'useSelector', blurb: 'Subscribe to exactly what you read.', points: [
        '`const todos = useSelector(state => state.todos)` subscribes this component to the store.',
        'It is built on `useSyncExternalStore`: after every dispatch, the selector runs again with the new state.',
        'Each component subscribes to its own slice — the dashed wires.',
      ] },
      { id: 'equality', title: 'The equality check', blurb: 'Re-render only on change.', points: [
        'The new selector result is compared with the previous one using `===` (reference equality) by default.',
        'Equal → the component does not re-render. Different → it does.',
        'Returning a new object or array every time (`state.todos.map(…)`) breaks this — use memoized selectors or `shallowEqual`.',
      ] },
      { id: 'usedispatch', title: 'useDispatch', blurb: 'Sending actions.', points: [
        '`const dispatch = useDispatch()` returns the store’s `dispatch` — a stable function.',
        '`dispatch(todoAdded(text))` starts the Redux loop.',
        'Components never modify state directly; they describe what happened.',
      ] },
      { id: 'rr-store', title: 'The store', blurb: 'Outside React, subscribed to by it.', points: [
        'The Redux store lives outside the React tree — it is a plain JavaScript object.',
        'React-Redux keeps a tree of subscriptions so parents are notified before children, avoiding “zombie child” bugs.',
        'Because the store is external, state survives unmounts and can be read outside components.',
      ] },
      { id: 'tearing', title: 'No tearing', blurb: 'Safe with concurrent rendering.', points: [
        'With concurrent rendering, an external store could change in the middle of a render, showing two different values in one frame (“tearing”).',
        '`useSyncExternalStore` prevents this by forcing a consistent snapshot for the whole render.',
        'This is why React-Redux v8+ requires React 18.',
      ] },
    ],
  },

  // =============================== REDUX ===============================
  thunk: {
    model: 'redux',
    title: 'redux-thunk',
    kicker: 'Redux › Thunk',
    summary: 'A component dispatches a function instead of an object. The thunk middleware checks the type at the fork: plain objects go straight on to the reducers, functions are called with dispatch and getState — and they dispatch the real actions when the async work finishes.',
    items: [
      { id: 'what', title: 'What a thunk is', blurb: 'A function that does the work later.', points: [
        'Redux reducers must be synchronous and pure, so where do API calls go? Into a “thunk”: a function you dispatch instead of an action object.',
        'The thunk receives `dispatch` and `getState`, does async work, and dispatches ordinary actions when it is done.',
        'Components stay simple: `dispatch(fetchTodos())` — they do not know whether the action is sync or async.',
      ] },
      { id: 'source', title: 'The whole middleware', blurb: 'About ten lines.', points: [
        'redux-thunk is tiny: if the action is a function, call it; otherwise pass it to `next`.',
        'The returned value of the thunk becomes the return value of `dispatch`, which is how you can `await dispatch(fetchTodos())`.',
      ], code: "const thunk = ({ dispatch, getState }) => next => action => {\n  if (typeof action === 'function') {\n    return action(dispatch, getState, extraArgument);\n  }\n  return next(action);\n};" },
      { id: 'fork', title: 'The type check', blurb: 'Function or object?', points: [
        'Every dispatched value reaches the thunk middleware first.',
        'Objects pass straight through to the next middleware and then the reducers (the upper path).',
        'Functions are intercepted and never reach a reducer themselves (the lower path).',
      ] },
      { id: 'args', title: 'dispatch, getState, extra', blurb: 'What the thunk receives.', points: [
        '`dispatch` lets the thunk dispatch more actions — or more thunks.',
        '`getState` reads the current state, e.g. to skip a fetch if data is already loaded.',
        'An `extraArgument` (configured in `configureStore`) injects dependencies such as an API client, which makes thunks easy to test.',
      ] },
      { id: 'async-flow', title: 'The async round trip', blurb: 'request → pending → fulfilled.', points: [
        'Dispatch `pending` immediately, so the UI can show a spinner.',
        'Await the request, then dispatch `fulfilled` with the data, or `rejected` with the error.',
        'Each of those is a normal action that flows through the reducers — the state change stays pure and logged.',
      ] },
      { id: 'cat', title: 'createAsyncThunk', blurb: 'The lifecycle, generated.', points: [
        'Redux Toolkit’s `createAsyncThunk` generates the thunk plus its three action types: `pending`, `fulfilled`, `rejected`.',
        '`await dispatch(fetchTodos()).unwrap()` returns the payload or throws the error in the component.',
        'Options: `condition` to skip the request, `signal` to abort it, `rejectWithValue` for typed errors.',
      ], code: "const fetchTodos = createAsyncThunk('todos/fetch',\n  async (_, { extra: api }) => (await api.get('/todos')).data,\n);" },
      { id: 'loading', title: 'Loading state', blurb: 'Handled by extraReducers.', points: [
        'Slices listen to the lifecycle actions in `extraReducers` and track a status: `idle → loading → succeeded | failed`.',
        'Components select the status to show spinners and errors.',
      ], code: "extraReducers: builder => builder\n  .addCase(fetchTodos.pending, s => { s.status = 'loading'; })\n  .addCase(fetchTodos.fulfilled, (s, a) => { s.status = 'succeeded'; s.items = a.payload; })\n  .addCase(fetchTodos.rejected, (s, a) => { s.status = 'failed'; s.error = a.error.message; })" },
      { id: 'when', title: 'Thunk, listener, saga or RTK Query?', blurb: 'Picking the right tool.', points: [
        'Thunks: imperative async logic triggered by the UI — the default, installed by `configureStore`.',
        'Listener middleware: “when action X happens, do Y” reactive side effects.',
        'redux-saga: generator-based workflows; powerful but heavier — mostly in older codebases.',
        'RTK Query: for fetching and caching server data, prefer it over hand-written thunks.',
      ] },
    ],
  },

  ecosystem: {
    model: 'redux',
    title: 'Production setup',
    kicker: 'Redux › Packages',
    summary: 'Every crate is a package a production React-Redux app ships with, wired to the place it plugs in. The card on the left is the conventional file layout — including rootReducer, the store and the typed hooks.',
    items: [
      { id: 'rtk', title: '@reduxjs/toolkit', blurb: 'The official, batteries-included Redux.', points: [
        'The recommended way to write Redux: `configureStore`, `createSlice`, `createAsyncThunk`, `createEntityAdapter`, `createListenerMiddleware` and RTK Query.',
        '`configureStore` wires the reducers, adds thunk, enables DevTools and installs development checks for mutation and serializability.',
        'It bundles redux, redux-thunk, reselect and immer — one install for all of them.',
      ] },
      { id: 'redux-core', title: 'redux', blurb: 'The core library.', points: [
        'Provides the store itself: `dispatch`, `getState`, `subscribe`, plus `combineReducers`, `applyMiddleware` and `compose`.',
        'In modern code you rarely import it directly — Redux Toolkit wraps it.',
        'The legacy `createStore` is deprecated in favour of `configureStore`.',
      ] },
      { id: 'pkg-react-redux', title: 'react-redux', blurb: 'The official React bindings.', points: [
        '`<Provider store>`, `useSelector`, `useDispatch` and `useStore`.',
        'Implements efficient subscriptions with `useSyncExternalStore` so only affected components re-render.',
        'Separate from Redux itself: Redux works with any UI layer.',
      ] },
      { id: 'pkg-thunk', title: 'redux-thunk', blurb: 'Async logic via functions.', points: [
        'The default async middleware — included and enabled automatically by `configureStore`.',
        'Lets you dispatch functions that perform side effects and dispatch real actions later.',
        'See the redux-thunk world for how it works step by step.',
      ] },
      { id: 'pkg-reselect', title: 'reselect', blurb: 'Memoized selectors.', points: [
        '`createSelector` builds selectors that only recompute when their inputs change.',
        'Re-exported by Redux Toolkit as `createSelector`.',
      ] },
      { id: 'pkg-immer', title: 'immer', blurb: 'Immutable updates with mutable syntax.', points: [
        'Powers `createSlice` and `createReducer`: you “mutate” a draft and get a new immutable state with structural sharing.',
        'Removes the deep-spread boilerplate that classic Redux needed.',
      ] },
      { id: 'pkg-persist', title: 'redux-persist', blurb: 'Survive a reload.', points: [
        '`persistReducer` wraps the root reducer and saves chosen slices to storage (localStorage, AsyncStorage…).',
        '`<PersistGate>` delays rendering until the saved state is rehydrated.',
        'Use `whitelist` / `blacklist` to persist only what should survive — never secrets — and ignore its actions in the serializability check.',
      ] },
      { id: 'pkg-devtools', title: 'Redux DevTools', blurb: 'Time-travel debugging.', points: [
        'A browser extension that records every action and state, with diffs, replay and time travel.',
        '`configureStore` connects to it automatically when `devTools` is enabled (the default outside production).',
      ] },
      { id: 'pkg-logger', title: 'redux-logger', blurb: 'Development logging.', points: [
        'A middleware that prints every action with previous and next state to the console.',
        'Add it only in development: `middleware: gDM => isDev ? gDM().concat(logger) : gDM()`.',
      ] },
      { id: 'pkg-saga', title: 'redux-saga (alternative)', blurb: 'Generator-based side effects.', points: [
        'Models side effects as long-running generator “sagas” that `take`, `call` and `put` actions.',
        'Powerful for complex workflows (cancellation, races) but adds a lot of concepts.',
        'Common in older production apps; new code usually uses thunks, listener middleware or RTK Query instead.',
      ] },
      { id: 'structure', title: 'Project structure', blurb: 'Feature folders + one store.', points: [
        '`app/store.ts` calls `configureStore`; `app/rootReducer.ts` combines every slice (and RTK Query’s reducer) with `combineReducers`.',
        '`features/<name>/<name>Slice.ts` holds each feature’s reducer, actions, thunks and selectors together.',
        '`app/hooks.ts` exports typed hooks; `services/api.ts` holds the RTK Query `createApi` definition.',
      ], code: "// app/rootReducer.ts\nexport const rootReducer = combineReducers({\n  todos: todosReducer,\n  user: userReducer,\n  [api.reducerPath]: api.reducer,\n});\n\n// app/store.ts\nexport const store = configureStore({\n  reducer: persistReducer(persistConfig, rootReducer),\n  middleware: gDM => gDM({ serializableCheck: { ignoredActions: [PERSIST] } })\n    .concat(api.middleware, listener.middleware),\n});\nexport type RootState = ReturnType<typeof rootReducer>;\nexport type AppDispatch = typeof store.dispatch;" },
      { id: 'typed-hooks', title: 'Typed hooks', blurb: 'useAppDispatch & useAppSelector.', points: [
        'Define pre-typed hooks once so every component knows the shape of the state and which thunks can be dispatched.',
        'Use them everywhere instead of the plain `useDispatch` / `useSelector`.',
      ], code: "export const useAppDispatch = useDispatch.withTypes<AppDispatch>();\nexport const useAppSelector = useSelector.withTypes<RootState>();" },
    ],
  },

  dataflow: {
    model: 'redux',
    title: 'The Redux loop',
    kicker: 'Redux › Loop',
    summary: 'Redux is one loop that only turns one way. Follow the action packet: the UI dispatches it, middleware sees it first, the reducer turns it into a new state, the store saves it and notifies the UI.',
    items: [
      { id: 'principles', title: 'Three principles', blurb: 'The rules everything else follows.', points: [
        'Single source of truth: the whole app state lives in one object tree in one store.',
        'State is read-only: the only way to change it is to dispatch an action.',
        'Changes are made with pure functions: reducers compute the next state from the previous state and the action.',
      ] },
      { id: 'df-ui', title: 'UI', blurb: 'Something happened.', points: [
        'A user clicks, types or a request finishes — the UI reacts by dispatching an action.',
        'Components never write to the store; they describe events.',
      ] },
      { id: 'action', title: 'Action', blurb: 'A plain object describing an event.', points: [
        'An action is `{ type: "todos/added", payload: { text } }` — serializable data.',
        'Name actions after events (“todos/added”), not setters (“setTodos”).',
        'Action creators (generated by `createSlice`) build them for you.',
      ], code: "dispatch({ type: 'todos/added', payload: { id: 4, text: 'Ship it' } });" },
      { id: 'df-dispatch', title: 'dispatch', blurb: 'The only way in.', points: [
        '`store.dispatch(action)` sends the action into the store.',
        'Dispatch is synchronous: by the time it returns, reducers have run and subscribers were notified.',
        'Everything that changes state goes through this one door, which makes it traceable.',
      ] },
      { id: 'df-middleware', title: 'Middleware', blurb: 'Sees every action first.', points: [
        'Middleware wraps `dispatch`: it can log, delay, transform or stop actions, and dispatch others.',
        'This is where async logic lives (thunks, listeners, RTK Query).',
      ] },
      { id: 'df-reducer', title: 'Reducer', blurb: '(state, action) → newState.', points: [
        'The root reducer receives the current state and the action and returns the next state.',
        'It must be pure: no mutations, no API calls, no random values.',
        'If nothing relevant happened it returns the same state object — nothing re-renders.',
      ] },
      { id: 'df-store', title: 'Store', blurb: 'Saves the new state.', points: [
        'The store replaces its current state with what the reducer returned.',
        'Each state is a new immutable snapshot; old snapshots are kept by DevTools for time travel.',
      ] },
      { id: 'df-subscribe', title: 'Notify subscribers', blurb: 'The loop closes.', points: [
        'The store calls every subscriber registered with `store.subscribe(listener)`.',
        'React-Redux’s subscribers run selectors and re-render only the components whose data changed.',
        'The UI now shows the new state — ready for the next event.',
      ] },
    ],
  },

  store: {
    model: 'redux',
    title: 'The store & state tree',
    kicker: 'Redux › Store',
    summary: 'The whole application state as one tree of plain data, split into feature slices. Every dispatch produces a new immutable snapshot — the stack on the right — which is what makes time-travel debugging possible.',
    items: [
      { id: 'tree', title: 'One state tree', blurb: 'Plain, serializable data.', points: [
        'All global state lives in a single object tree: arrays, objects, strings, numbers.',
        'Keep it serializable — no class instances, promises or functions — so it can be persisted, logged and replayed.',
        'Not everything belongs here: form drafts and hover state are usually fine as local component state.',
      ] },
      { id: 'slices', title: 'Slices', blurb: 'One branch per feature.', points: [
        'The root is split into slices (`todos`, `user`, `filter`), each owned by one slice reducer.',
        '`configureStore({ reducer: { todos, user, filter } })` combines them.',
        'Slices map naturally to features, keeping code organized by domain.',
      ] },
      { id: 'normalized', title: 'Normalized entities', blurb: 'Like tables in a database.', points: [
        'Store collections as `{ ids: [...], entities: { [id]: item } }` instead of nested arrays.',
        'Each item exists once, lookups by id are O(1), and updates touch one place.',
        '`createEntityAdapter` generates this shape and its CRUD reducers and selectors.',
      ] },
      { id: 'snapshots', title: 'Immutable snapshots', blurb: 'Every dispatch = a new version.', points: [
        'Reducers never edit the old state; each dispatch yields a new state object.',
        'Old versions stay intact, so you can compare them with `===` or step back to them.',
        'Unchanged parts are shared between versions, so this is cheap (see Reducers).',
      ] },
      { id: 'devtools', title: 'Redux DevTools', blurb: 'Time travel.', points: [
        'Every action and resulting state is recorded: inspect diffs, jump to any point, replay or skip actions.',
        '`configureStore` connects the DevTools extension automatically in development.',
        'This only works because state is immutable and changes go through actions.',
      ] },
      { id: 'api', title: 'Store API', blurb: 'getState · dispatch · subscribe.', points: [
        '`store.getState()` returns the current state tree.',
        '`store.dispatch(action)` is the only way to update it.',
        '`store.subscribe(listener)` registers a callback run after every dispatch — the hook React-Redux uses.',
      ], code: "const store = configureStore({\n  reducer: { todos, user, filter },\n});\nstore.subscribe(() => console.log(store.getState()));\nstore.dispatch(todoAdded('Ship it'));" },
    ],
  },

  reducers: {
    model: 'redux',
    title: 'Reducers & immutability',
    kicker: 'Redux › Reducers',
    summary: 'The root reducer hands each action to every slice reducer. On the right, the old and new state trees: only the changed path (green) is copied — everything else is literally shared, which makes change detection a cheap === check.',
    items: [
      { id: 'root', title: 'Root reducer', blurb: 'combineReducers.', points: [
        'The root reducer calls every slice reducer with its own slice of state and the same action.',
        'It assembles the results into the new root object.',
        'If no slice changed, it returns the previous root — and nothing downstream re-renders.',
      ] },
      { id: 'slice', title: 'Slice reducers', blurb: 'Each owns one branch.', points: [
        'A slice reducer only sees and returns its own part of the state.',
        'Any reducer may respond to any action — e.g. `user/loggedOut` can clear `todos` too.',
        'Unrecognized actions return the existing slice unchanged.',
      ] },
      { id: 'pure', title: 'Pure functions', blurb: 'No side effects, no surprises.', points: [
        'Same state + same action → same result, every time.',
        'No API calls, timers, random numbers or mutations inside reducers.',
        'That guarantee is what makes replay, time travel and testing trivial.',
      ] },
      { id: 'sharing', title: 'Structural sharing', blurb: 'Copy only the changed path.', points: [
        'Toggling one todo creates a new todo object, a new todos array and a new root — and nothing else.',
        '`user`, `filter` and the untouched todos are the same objects in both trees.',
        'So `prev.user === next.user` is true, and any component reading `user` can skip re-rendering instantly.',
      ] },
      { id: 'immer', title: 'Immer', blurb: 'Write “mutations”, get immutable updates.', points: [
        'Redux Toolkit runs reducers through Immer: you mutate a draft and Immer produces a structurally shared copy.',
        'Either mutate the draft or return a new value — never both.',
      ], code: "toggled(state, action) {\n  const todo = state.entities[action.payload];\n  todo.done = !todo.done; // safe: it is a draft\n}" },
      { id: 'createslice', title: 'createSlice', blurb: 'Reducer + actions in one place.', points: [
        '`createSlice` generates action types and action creators from the reducer names.',
        'It returns `slice.reducer` for the store and `slice.actions` for components.',
      ], code: "const todos = createSlice({\n  name: 'todos',\n  initialState,\n  reducers: { added, toggled },\n});\nexport const { added, toggled } = todos.actions;" },
    ],
  },

  middleware: {
    model: 'redux',
    title: 'Middleware',
    kicker: 'Redux › Middleware',
    summary: 'Every dispatched action passes through a chain of middleware before it reaches the reducers. The thunk layer catches functions and runs async work, dispatching pending and fulfilled actions back into the loop.',
    items: [
      { id: 'chain', title: 'The chain', blurb: 'store ⇒ next ⇒ action.', points: [
        'Middleware wraps `dispatch`. Each one gets the action, can act on it, and calls `next(action)` to pass it on.',
        'They run in order, like layers of an onion, with the reducer at the centre.',
        '`configureStore` installs thunk plus development checks for mutations and non-serializable values.',
      ], code: 'const logger = store => next => action => {\n  console.log("dispatching", action);\n  const result = next(action);\n  console.log("next state", store.getState());\n  return result;\n};' },
      { id: 'logger', title: 'Logger', blurb: 'Observing every action.', points: [
        'The classic example: log the action, pass it on, log the new state.',
        'Analytics, crash reporting and persistence are written the same way.',
      ] },
      { id: 'thunk', title: 'Thunks', blurb: 'Dispatch a function.', points: [
        'The thunk middleware notices when you dispatch a function instead of an object and calls it with `dispatch` and `getState`.',
        '`createAsyncThunk` wraps a promise and dispatches `pending`, then `fulfilled` or `rejected`.',
        'Reducers handle those three actions to track loading and error state.',
      ], code: "const fetchTodos = createAsyncThunk('todos/fetch', async () => {\n  const res = await fetch('/api/todos');\n  return res.json();\n});" },
      { id: 'listener', title: 'Listener middleware', blurb: 'React to actions with side effects.', points: [
        '`createListenerMiddleware` runs effects when matching actions are dispatched.',
        'Great for “when X happens, also do Y” — saving to storage, debounced search, workflows.',
        'Effects can await other actions, cancel themselves and fork child tasks.',
      ] },
      { id: 'async', title: 'Async work', blurb: 'Side effects live here, not in reducers.', points: [
        'The network request happens inside middleware, outside the pure reducer world.',
        'Results come back as ordinary actions, so state changes stay predictable and logged.',
      ] },
      { id: 'next', title: 'next(action) → reducers', blurb: 'The end of the chain.', points: [
        'The last middleware’s `next` is the store’s real dispatch, which calls the root reducer.',
        'A middleware that never calls `next` swallows the action — reducers never see it.',
      ] },
    ],
  },

  selectors: {
    model: 'redux',
    title: 'Selectors & memoization',
    kicker: 'Redux › Selectors',
    summary: 'Selectors read and derive data from the state. A memoized selector only recomputes when its inputs change — watch the cycle alternate between a cache hit (unrelated action) and a recompute (todos changed).',
    items: [
      { id: 'sel-state', title: 'State in', blurb: 'The current snapshot.', points: [
        'Every selector takes the whole root state as its first argument.',
        'Keep stored state minimal and derive everything else with selectors.',
      ] },
      { id: 'input', title: 'Input selectors', blurb: 'Plain field reads.', points: [
        '`state => state.todos` and `state => state.filter` just read existing references — cheap and stable.',
        'Their results are the cache keys of the memoized selector.',
      ] },
      { id: 'createselector', title: 'createSelector', blurb: 'Memoized derived data.', points: [
        'The combiner (e.g. filtering todos) only runs when an input result changed by reference.',
        'Otherwise it returns the previously computed value — the very same array object.',
      ], code: 'const selectVisible = createSelector(\n  [selectTodos, selectFilter],\n  (todos, filter) => todos.filter(t => matches(t, filter)),\n);' },
      { id: 'cache', title: 'Cache hit vs recompute', blurb: 'Why identity matters.', points: [
        'An unrelated action (`user/updated`) leaves `todos` and `filter` identical, so the cached result is returned.',
        '`todos/added` produces a new todos array, so the combiner runs again.',
        'Reselect 5 memoizes by argument identity with weak maps; older versions kept only the last call.',
      ] },
      { id: 'output', title: 'Stable output', blurb: 'Feeds useSelector’s === check.', points: [
        'Because a cache hit returns the same reference, `useSelector` sees “no change” and skips the re-render.',
        'Selectors pair memoization with structural sharing to keep rendering minimal.',
      ] },
      { id: 'pitfalls', title: 'Pitfalls', blurb: 'New references every time.', points: [
        '`useSelector(s => s.todos.filter(…))` returns a new array on every dispatch, so the component re-renders every time.',
        'Fix it with `createSelector`, or by selecting primitives and doing the work in render.',
        'Selectors that take arguments need a memoized instance per component (or Reselect 5’s default cache).',
      ] },
    ],
  },

  rtkq: {
    model: 'redux',
    title: 'RTK Query',
    kicker: 'Redux › RTK Query',
    summary: 'RTK Query turns server data into a cache that lives in the store. Two components share one cache entry and one request; a mutation invalidates a tag and the matching entries refetch automatically.',
    items: [
      { id: 'endpoints', title: 'createApi & endpoints', blurb: 'Hooks generated for you.', points: [
        'Define endpoints once — queries and mutations — and RTK Query generates hooks such as `useGetPostsQuery`.',
        'It adds a reducer and a middleware to the store under `reducerPath`.',
      ], code: "const api = createApi({\n  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),\n  tagTypes: ['Post'],\n  endpoints: b => ({\n    getPosts: b.query({ query: () => 'posts', providesTags: ['Post'] }),\n    addPost: b.mutation({ query: body => ({ url: 'posts', method: 'POST', body }), invalidatesTags: ['Post'] }),\n  }),\n});" },
      { id: 'q-cache', title: 'The cache', blurb: 'Keyed by endpoint + arguments.', points: [
        'Each `endpoint(args)` combination gets one cache entry with data, status and timestamps.',
        'It is stored in Redux, so it is visible in DevTools and selectable like any state.',
      ] },
      { id: 'dedup', title: 'Deduplication', blurb: 'Many subscribers, one request.', points: [
        'Two components asking for `getPosts()` share the same entry and the same in-flight request.',
        'Each mounted hook adds a subscription; the entry lives while anyone is subscribed.',
      ] },
      { id: 'tags', title: 'Tags & invalidation', blurb: 'Automatic refetching.', points: [
        'Queries declare `providesTags`; mutations declare `invalidatesTags`.',
        'When `addPost` succeeds it invalidates `Post`, and every active query providing `Post` refetches.',
        'No manual cache updates needed — though optimistic updates are available too.',
      ] },
      { id: 'lifetime', title: 'Cache lifetime', blurb: 'keepUnusedDataFor.', points: [
        'When the last subscriber unmounts, an entry is kept for 60 seconds by default, then removed.',
        'Remounting within that window shows cached data instantly while revalidating.',
        '`pollingInterval`, `refetchOnFocus` and `refetchOnReconnect` keep data fresh.',
      ] },
      { id: 'mutation', title: 'Mutations', blurb: 'Changing server data.', points: [
        '`const [addPost, { isLoading }] = useAddPostMutation()` sends the change to the server.',
        'Success triggers tag invalidation; `onQueryStarted` enables optimistic updates with rollback.',
      ] },
    ],
  },
};
