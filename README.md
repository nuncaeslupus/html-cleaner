# html-cleaner

A bookmarklet that removes annoyances from the page you are on, if it has a rule for that site.

## Install

```bash
make build
```

Open `dist/install.html` and drag one of the links to your bookmarks bar:

- **Clean page** fetches the latest `cleaner.js` from this repo's `main` on every click, so new rules
  arrive a few minutes after they merge with nothing to reinstall. It runs whatever is on `main`, so
  keep the branch protected.
- **Clean page (offline)** is a frozen copy, for sites whose security policy blocks the fetch.
  Rebuild and replace it after changing rules.

## Sites

| Site | What it does |
| --- | --- |
| jobfluent.com | Shows the full offer description hidden behind "Entrar con LinkedIn" |

## Adding a site

Add an entry to `rules` in `cleaner.js` (`host` regex + `fix` function), a case in `test.js`, then `make test build`.
