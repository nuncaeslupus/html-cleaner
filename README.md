# html-cleaner

A bookmarklet that removes annoyances from the page you are on, if it has a rule for that site.

## Install

```bash
make build
```

Open `dist/install.html` and drag the **Clean page** link to your bookmarks bar
(or create a bookmark by hand and paste `dist/bookmarklet.txt` as its URL).
Rebuild and replace the bookmark after changing rules.

## Sites

| Site | What it does |
| --- | --- |
| jobfluent.com | Shows the full offer description hidden behind "Entrar con LinkedIn" |

## Adding a site

Add an entry to `rules` in `cleaner.js` (`host` regex + `fix` function), a case in `test.js`, then `make test build`.
