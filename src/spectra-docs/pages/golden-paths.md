The default `spectra performance` run evaluates your app the way a user meets it: a page load, then a set of short journeys through the things a user can actually do.

## 1. Baseline page load

The page is reloaded with the cache disabled and recorded until a few seconds after the load event.

## 2. Discovery

Spectra lists the actionable elements on the loaded page: links, buttons, inputs, selects, checkboxes and forms, including elements with ARIA roles such as `button`, `link`, `tab` and `menuitem`. Each one is classified:

| Element | Action |
| --- | --- |
| Internal link | Navigate |
| Button, tab, menu item | Click |
| Text field | Fill with a synthetic value |
| Select, checkbox, radio, switch | Choose |
| Form submit | Submit |

Then each element is scored. Visible, enabled and labelled elements rank higher, as do primary entry points (home, dashboard, search, settings, pricing and similar) and elements with a stable `id` or `data-test` selector. Hidden, disabled and tiny targets sink.

## 3. Journeys

The top elements become **golden paths**, 12 at most (change it with `--paths`):

- **navigation**: follow an internal link,
- **interaction**: click a button, tab or menu item,
- **form**: fill a form's fields with plausible values (for example `test@example.com` for an email field) and submit it, but only when the submit is safe.

## 4. Recording

Each journey starts from a freshly loaded page and runs as its own live recording, so every journey gets a full report. Browser dialogs (`alert`, `confirm`, `beforeunload`) are dismissed automatically, so a journey can never hang.

## Safe by default

Automatic exploration never triggers anything that could change data. A control is treated as **destructive** and skipped when:

- its label mentions delete, remove, destroy, drop, erase, clear, reset, wipe, pay, buy, purchase, checkout, order, subscribe, donate, confirm, deactivate, disable, archive, unsubscribe, sign out, log out, close account or cancel a subscription;
- it links to a logout, sign-out, delete or remove URL;
- it submits a form with `POST`, `PUT` or `DELETE`.

The skipped controls are listed after the matrix, so you know what was not exercised. Searches (GET forms) and navigation are fair game.

## The matrix

```
#  Golden path              Result     TBT     LCP  LongT  Top finding
·  Initial page load        PASS       0ms    84ms      0  [critical] Row is slow to render: 1443ms
1  Click "Long task"        PASS     213ms       —      1  [critical] src/heavy.js spent 586ms of J
2  Click "Layout thrash"    PASS       0ms       —      0  [critical] Row is slow to render: 360ms
Automation: 2/2 golden paths passed.
```

*Result* says whether the automation completed the journey; the numbers say how it performed. LCP is measured for the page load only. The same matrix, with every row linked to its full report, is on the dashboard's Golden paths tab:

```screenshot tab-golden-paths
The dashboard's Golden paths tab for the same kind of run.
head: **Run picker** and summary: elements discovered, journeys run, and how many passed.
target: **What was evaluated**: the project and its URL.
matrix: **One row per journey.** **Open report** opens its full report.
```
