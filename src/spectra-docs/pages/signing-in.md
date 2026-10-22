Most production frontends sit behind a login, and the Chrome window Spectra launches starts **signed out** every time. Tell Spectra how your app signs in and it signs in first, then profiles the page you asked for. It works the same in the dashboard, on the command line, in CI, in the [VS Code extension](doc:vscode), the [MCP server](doc:mcp-server) and [spectra fix](doc:cli-fix).

```video signing-in
Spectra signing in to a store's protected page through its own login form, from the dashboard and from the command line.
```

## Every kind of login

| Method | For | What Spectra does |
| --- | --- | --- |
| **Login form** (`form`) | A username and password on your app's login page, or on the identity provider it sends you to (an OAuth, OpenID Connect or SAML sign-in) | Finds the fields and types into them the way a person does, so React, Vue and Angular forms see the input. Handles one-step and two-step logins (username, **Next**, password), forms that render late, forms inside iframes and web components (shadow DOM), and logins behind a **Sign in** button that opens a modal. With an authenticator secret it also answers the six-digit code step |
| **I'll sign in myself** (`manual`) | Anything that needs a person: codes sent by SMS or email, push approvals, passkeys and security keys, CAPTCHAs | Opens the login page in a visible Chrome window and waits (5 minutes by default) until you are through, then carries on |
| **Browser prompt** (`http`) | The browser's own username and password box (HTTP Basic or Digest), common on staging servers | Answers the prompt |
| **Token or cookie** (`token`) | Apps that accept a header (`Authorization: Bearer …`), a session cookie or a localStorage entry | Sets them before your app loads. A header is sent **only to the page's own origin**, never to third parties; cookies and storage entries are set for that origin only |
| **Sign-in link** (`link`) | A URL that signs in by itself, such as a dev-only auto-login | Opens it when the page lands on a login screen. `{url}` in it becomes the page to return to |

Spectra signs in **before** it starts recording, so the login never appears in a measurement. If the session ends during a run (it expires, or a journey signs out), Spectra signs in again the next time it opens the page.

## In the dashboard

Turn on **My app needs a sign-in** under **Page to profile**, pick how your app signs in, fill in what it asks for, and press **Launch Chrome**. While it signs in the session card says so (**Waiting for you to sign in** for *I'll sign in myself*), and once it is through it shows **✓ Signed in**.

```screenshot dashboard-signin
The sign-in panel, set up for a login form.
switch: **My app needs a sign-in.** Turns signing in on for this launch.
methods: **How your app signs in.** Login form, I'll sign in myself, Browser prompt, Token or cookie, or Sign-in link. The fields below change with it.
page: **Login page.** Optional: leave it empty to sign in wherever the app sends a signed-out visitor.
credentials: **Username and password.** The password is marked *not saved*: it stays in this tab's memory only.
more: **One-time codes and fields.** The authenticator secret, and selectors for when Spectra can't find the controls.
note: **What happens to secrets.** A reminder that nothing secret is saved, logged or put in a report.
```

- **Login page** is optional for a login form: leave it empty and Spectra signs in wherever your app sends a signed-out visitor. Give it when your app shows its login only behind a button or on a separate page.
- **One-time codes and fields** holds the authenticator secret, and CSS selectors for the fields and buttons when Spectra can't find them by itself (it usually can).
- The page URL, the method, the login page and the username are remembered in your browser. **Passwords, codes, tokens and cookies are not**: they stay in that browser tab's memory until it reloads.
- **Go** in the session card signs in again with the same details if the page asks.

## On the command line and in CI

```bash
# a login form: the username in an option, the password from the environment
SPECTRA_LOGIN_PASSWORD="$TEST_PASSWORD" npx spectra performance --login-url http://localhost:3000/login --login-user demo@example.com

# plus a one-time code from an authenticator app
SPECTRA_LOGIN_PASSWORD="$TEST_PASSWORD" SPECTRA_LOGIN_TOTP_SECRET="$TEST_TOTP" npx spectra performance --login-user demo@example.com

# sign in yourself in the Chrome window (it opens, even without --headed)
npx spectra performance --login manual --login-url https://staging.example.com/login

# the browser's login prompt
SPECTRA_LOGIN_PASSWORD="$STAGING_PASSWORD" npx spectra performance --login http --login-user preview --url https://staging.example.com/

# a token header, a cookie or a localStorage entry
SPECTRA_LOGIN_HEADER="Authorization: Bearer $TEST_TOKEN" npx spectra performance --url http://localhost:3000/
SPECTRA_LOGIN_COOKIES="session=$TEST_SESSION" npx spectra performance --url http://localhost:3000/
```

| Option | Description |
| --- | --- |
| `--login <method>` | `form`, `link`, `http`, `token` or `manual`. Left out, Spectra works it out from what you gave it |
| `--login-url <url>` | The login page, or the sign-in link. `{url}` in it becomes the page to return to |
| `--login-user <name>` | The username or email (or `SPECTRA_LOGIN_USER`) |
| `--login-wait <seconds>` | How long to wait for you with `--login manual` (default 300) |
| `--login-start <css>` | A button to click first, such as one that opens the login modal or "Sign in with SSO" |
| `--login-user-field`, `--login-password-field`, `--login-submit`, `--login-code-field <css>` | The fields and the submit button, when Spectra can't find them |
| `--sign-in <url>` | The sign-in link, as in Spectra 0.4 (the same as `--login link --login-url <url>`) |

Secrets come **only from the environment**, so they never sit in a file or in the list of running processes:

| Variable | Holds |
| --- | --- |
| `SPECTRA_LOGIN_PASSWORD` | The password, for a login form or the browser prompt |
| `SPECTRA_LOGIN_TOTP_SECRET` | The authenticator app's secret: the base32 text behind its QR code. Spectra makes the codes (RFC 6238) |
| `SPECTRA_LOGIN_HEADER` | A header, as `Name: value` |
| `SPECTRA_LOGIN_COOKIES` | Cookies, as `name=value; name2=value2` |
| `SPECTRA_LOGIN_STORAGE` | localStorage entries, as `key=value; key2=value2` |
| `SPECTRA_LOGIN_USER` | The username, when you don't pass `--login-user` |

In GitHub Actions, put them in repository secrets:

```yaml
- run: npx spectra performance --login-url http://localhost:3000/login --login-user ci@example.com
  env:
    SPECTRA_LOGIN_PASSWORD: ${{ secrets.SPECTRA_TEST_PASSWORD }}
```

## Once, for every tool: spectra.config.json

Put how your app signs in next to your [budgets](doc:budgets), and every command, the VS Code extension, the MCP server and `spectra fix` use it. Only the non-secret parts belong here; Spectra refuses a config file that holds a password, a code secret, a header value, cookies or storage entries, and names the environment variable to use instead.

```json
{
  "signIn": {
    "method": "form",
    "url": "http://localhost:3000/login",
    "username": "demo@example.com"
  }
}
```

| Key | Description |
| --- | --- |
| `method` | `form`, `link`, `http`, `token` or `manual` |
| `url` | The login page, or the sign-in link |
| `username` | The username or email |
| `startSelector`, `usernameSelector`, `passwordSelector`, `submitSelector`, `codeSelector` | CSS selectors, when Spectra can't find the controls |
| `waitSeconds` | How long to wait for a manual sign-in |

Command-line options win over the file, and the file wins over `SPECTRA_LOGIN_USER`.

## Keeping secrets safe

- Passwords, code secrets, tokens and cookies are **never written to disk, a report, a log or an error message**, and the dashboard's status never includes them.
- Signing in happens before recording, so no trace or report contains the login.
- A header is added only to requests to the page's own origin.
- Spectra **does not solve CAPTCHAs**. When a login shows one, Spectra stops before sending anything and asks you to choose *I'll sign in myself*.
- Use a **test account** where you can, with only the access profiling needs.

## When it doesn't work

| What you see | What to do |
| --- | --- |
| *No login form was found* | Give the login page (`--login-url`), or point at the controls with the selector options |
| *did not accept the username and password* | The app said the details are wrong: check them, and whether the account needs a one-time code |
| *submitting it sent nothing* | The sign-in button didn't send the form, even after Spectra pressed Enter: give the button's selector (`--login-submit`, or `submitSelector`) |
| *asks for a one-time code* | Give the authenticator secret (`SPECTRA_LOGIN_TOTP_SECRET`), or sign in yourself |
| *shows a CAPTCHA* | Choose *I'll sign in myself* (`--login manual`) |
| An identity provider refuses the sign-in, or asks for more checks | Some providers block automated browsers. Choose *I'll sign in myself*: Spectra's Chrome keeps its own profile per project, so a provider that remembers the browser may ask less often |
| *Signed in, but … still shows a login* | The app signed in somewhere else: give the login page your app really uses |
| The page answers with an HTTP error | The dashboard shows a red banner and the report starts with *The page itself failed to load*, because a recording of an error page tells you nothing about your app |

Spectra's sign-in is tested end to end against a [test app](https://github.com/progen-labs/spectra/tree/main/fixtures/login-demo) with each of these logins: a classic form, two steps, a late single-page-app form, an iframe, a web component, a modal, authenticator codes in one box or six, the browser prompt, a header, a cookie, a storage entry, a sign-in link, a button that ignores its first click, a wrong password and a CAPTCHA.
