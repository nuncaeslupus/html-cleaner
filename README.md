# html-cleaner

A bookmarklet that removes annoyances from the page you are on, if it has a rule for that site.

## Install

```bash
make build
```

Open `dist/install.html` and drag one of the links to your bookmarks bar:

- **Clean page** fetches the latest `rules.json` from this repo's `main` on every click, so new rules
  arrive a few minutes after they merge with nothing to reinstall. Rules are data: the bookmark only
  runs the interpreter it was built with, so a rule can never run code.
- **Clean page (offline)** is a frozen copy, for sites whose security policy blocks the fetch.
  Rebuild and replace it after changing rules.

## Sites

| Site | What it does |
| --- | --- |
| jobfluent.com | Shows the full offer description hidden behind "Entrar con LinkedIn" |
| jobleads.com | Removes the "Regístrate para ver el trabajo" wall and blur, and links the original posting (the page itself only carries a summary) |

## Adding a site

A site is one data file, `rules/<host>.json`, which also applies to the host's subdomains:

```json
{
  "about": "What it removes, in one sentence",
  "steps": [
    { "remove": ".RegistrationModal" },
    { "removeAttr": ["[inert]", "inert"] }
  ]
}
```

| Step | Argument | Does |
| --- | --- | --- |
| `remove` | `selector` | Removes the matching elements |
| `removeClass` / `addClass` | `[selector, class, …]` | Removes / adds classes on the matching elements |
| `removeAttr` | `[selector, attribute]` | Removes an attribute from the matching elements |
| `linkFrom` | `{"nuxt": key, "after": selector}` | Adds a link after the matching elements to the URL under `key` in the page's Nuxt payload (http(s) only) |

Selectors are a single tag, `#id`, `.class` or `[attr]`. Add the page as a recorded excerpt in
`fixtures/<host>.html` and the expected result in `fixtures/<host>.clean.html`, then `make test build`
(the build also regenerates `rules.json`; commit it).
