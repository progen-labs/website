The Chrome window Spectra launches starts **signed out every time**: apps normally use session cookies, and Chrome discards them when it closes. If the page you profile needs a login, choose one of these.

## A sign-in URL template

Give Spectra your app's login URL, with `{url}` where the page to return to goes:

```bash
npx spectra performance --sign-in "http://localhost:3000/login/?redirect={url}"
```

In the dashboard, enter the same template under **Advanced → Sign-in URL**. Spectra opens your page directly; only if it lands on a login screen does it go through the sign-in URL and continue to the page. `{url}` is replaced with the URL-encoded path and query of the page. It is also used when you press **Go** in the dashboard toolbar.

## Sign in by hand

In the dashboard, or with `--headed` on the command line, sign in yourself in the Chrome window after it opens, then continue.

## Keep credentials out of it

Spectra never asks for, stores or logs a password or token, and a sign-in URL must not contain one. Use a login route that works with your normal development sign-in.

If the page still answers with an HTTP error, the dashboard shows a red banner and the report starts with a critical **The page itself failed to load** finding, because a recording of an error page tells you nothing about your app.
