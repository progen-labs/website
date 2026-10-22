A single-page profile records **one page** instead of the whole golden-path suite. It is the fast loop for working on a specific problem.

## --quick: profile the page load

```bash
npx spectra performance --quick
```

Spectra reloads the page with the cache disabled, records until a few seconds after the load event, then prints the headline numbers and the culprits. `--quick` is shorthand for `--mode load` and works with or without `--url`.

## --runs: take the median

One recording can be unlucky. `--runs` records several times in the same browser and reports the **median** of each number, its **spread** from lowest to highest, and how many runs saw each finding:

```bash
npx spectra performance --quick --runs 3
```

```
3 runs — medians:
TBT 0 ms · LCP 100 ms (88.0 ms–124 ms) · FCP 100 ms (88.0 ms–124 ms) · CLS 0.002 · long tasks 0 · forced layouts 0
  run 1  20261016T190114-load  TBT 0 ms · LCP 100 ms · scripting 1.46 s
  run 2  20261016T190118-load  TBT 0 ms · LCP 124 ms · scripting 1.49 s
  run 3  20261016T190122-load  TBT 0 ms · LCP 88.0 ms · scripting 1.46 s

Culprits (from 20261016T190114-load, the most typical run):
 [critical] (React) Row is slow to render: 1444ms total, 0.2ms per render (7200×)  [seen in 3/3 runs]
      ↳ Row()  src/Row.jsx:3  1444.1ms  (slow render)
```

The culprits come from the most typical run, the one closest to the medians, so they agree with the numbers above them. `--runs` accepts 1 to 25.

## --mode live: record a session

```bash
npx spectra performance --url http://localhost:3000/ --mode live --duration 15
```

A live recording starts on the loaded page and records for `--duration` seconds (default 8). On its own it captures what the page does by itself, such as timers, polling and animations. To drive the page, use a scenario.

## --scenario: script the interaction

A scenario is an ES module whose default export receives a [Puppeteer](https://pptr.dev/) `Page`:

```js
// scenarios/open-dashboard.mjs
export default async page => {
  await page.click('#open-dashboard');
  await page.waitForSelector('.chart');
  await page.type('#search', 'revenue');
};
```

```bash
npx spectra performance --url http://localhost:3000/ --scenario scenarios/open-dashboard.mjs --runs 3
```

The recording lasts exactly as long as the scenario. With `--runs`, the page is reloaded before every run, so each one starts from the same state.

## More options

| Option | Default | Description |
| --- | --- | --- |
| `--throttle <n>` | `1` | Slow the CPU down n times (try 4 or 6) to expose problems a fast laptop hides |
| `--save-trace` | off | Keep the raw Chrome trace next to the report, for Chrome DevTools |
| `--headed` | off | Show the browser window |
| `--login-url`, `--login-user`, `--login` | none | Sign in before profiling, see [Signing in](doc:signing-in) |
| `--json`, `--out`, `--config` | | As for [`spectra performance`](doc:cli-performance) |

`--quick` cannot be combined with `--mode live` or `--scenario`. `--runs` applies only to single-page profiles, because the golden-path suite records each journey once.
