# html-cleaner

[![test](https://github.com/nuncaeslupus/html-cleaner/actions/workflows/test.yml/badge.svg)](https://github.com/nuncaeslupus/html-cleaner/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**A bookmarklet that removes annoyances from the page you are on, if it has a rule for that site.**

Some sites hide content that is already in the page behind a sign-up wall, a blur
or a scroll lock. html-cleaner is one bookmark: click it and it applies that site's
rule (remove the modal, drop `inert`, unblur, link the original posting). Rules are
JSON data, not code, so adding a site can never run a script.

## Quick start

```bash
git clone https://github.com/nuncaeslupus/html-cleaner.git
cd html-cleaner
make build
```

```
rules.json and dist/install.html written (auto-update 3839 chars, offline 3995 chars)
```

Open `dist/install.html` and drag one of the two links to your bookmarks bar:

- **Clean page** fetches the latest `rules.json` from this repo's `main` on every click,
  so new rules arrive a few minutes after they merge, with nothing to reinstall.
  Reinstall only when a new step type ships; until then a rule that uses it says so
  in an alert.
- **Clean page (offline)** is a frozen copy, for sites whose security policy blocks
  the fetch. Rebuild and replace it after changing rules.

On a site with no rule, the bookmark only alerts `html-cleaner: no rule for <host>`.

## Example

The jobleads.com rule (`rules/jobleads.com.json`):

```json
{
  "about": "Removes the \"Regístrate para ver el trabajo\" wall (a modal, an inert page and a blur) and links the original posting, since the page itself only carries a summary.",
  "steps": [
    { "remove": ".RegistrationModal" },
    { "removeAttr": ["[inert]", "inert"] },
    { "linkFrom": { "nuxt": "sourceUrl", "after": ".job-preview-description--blurred" } },
    { "removeClass": [".job-preview-description--blurred", "job-preview-description--blurred"] }
  ]
}
```

Before (`fixtures/jobleads.com.html`, a recorded excerpt of the page):

```html
<div class="RegistrationModal"><h2>Regístrate para ver el trabajo</h2></div>
<main inert="">
  <div class="job-preview-description job-preview-description--blurred"><p>Resumen de la oferta.</p></div>
</main>
<script type="application/json" id="__NUXT_DATA__">[{"job":1},{"title":2,"sourceUrl":3},"Backend developer","https://jobs.lever.co/acme/1"]</script>
```

After one click:

```html
<main>
  <div class="job-preview-description"><p>Resumen de la oferta.</p></div><a href="https://jobs.lever.co/acme/1">https://jobs.lever.co/acme/1</a>
</main>
<script type="application/json" id="__NUXT_DATA__">[{"job":1},{"title":2,"sourceUrl":3},"Backend developer","https://jobs.lever.co/acme/1"]</script>
```

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
| `removeAttr` | `[selector, attribute, …]` | Removes attributes (`inert`, `aria-hidden`…) from the matching elements |
| `style` | `[selector, property, value]` | Forces an inline style (`filter: none`, `overflow: auto`…); an empty value removes it. No `url()` |
| `linkFrom` | `{"nuxt": key, "after": selector}` | Adds a link after the matching elements to the URL under `key` in the page's Nuxt payload (http(s) only) |

Selectors are tags, `#id`, `.class`, `[attr]` and `[attr="value"]`, chained (`div.a[b]`) and nested
with a space or `>`. Add the page as a recorded excerpt in
`fixtures/<host>.html` and the expected result in `fixtures/<host>.clean.html`, then `make test build`
(the build also regenerates `rules.json`; commit it).

`make build` validates every rule and stops on the first problem, naming the file and
step, for example `rules/example.com.json: step 2: bad argument to style (see README, Adding a site)`.

## From an agent

There is no MCP server or CLI beyond the build. An agent adds a site the same way a
person does: write `rules/<host>.json` plus the two fixtures, run `make test build`
(non-zero exit on an invalid rule or a fixture mismatch), and commit `rules.json`.
The tests run offline against the fixtures, so no browser is needed.

## How it works

- `cleaner.js` is the fixed interpreter: it knows the step types and nothing about
  any site. It is frozen into the installed bookmark.
- `build.js` validates `rules/*.json`, writes the committed `rules.json` bundle, and
  writes both bookmarklets (`dist/bookmarklet-auto.txt`, `dist/bookmarklet.txt`) and
  `dist/install.html`.
- The auto-update bookmark fetches only data, so a merged rule can change what is
  removed but can never run code.

## Development

Node with npm.

```bash
make test     # node --test test.js (installs jsdom on first run)
make build    # rules.json + dist/
make clean    # remove dist/
```

Developed with [claude-arsenal](https://github.com/nuncaeslupus/claude-arsenal); the vendored skills live in `claude-arsenal/`.

## Related projects

- [claude-arsenal](https://github.com/nuncaeslupus/claude-arsenal) — spec-driven Claude Code workflow and gated task queue.
- [drawspec](https://github.com/nuncaeslupus/drawspec) — declarative diagram spec → clean SVG/PNG/text, writable by LLMs; MCP server included.
- [doc-control](https://github.com/nuncaeslupus/doc-control) — lets AI agents edit Word documents as tracked changes.
- [literary-critic](https://github.com/nuncaeslupus/literary-critic) — LLM manuscript analysis the way a professional editor would.
- [integral-job-search](https://github.com/nuncaeslupus/integral-job-search) — candidate-centred job search run in Claude Code.

## License

[MIT](LICENSE)
