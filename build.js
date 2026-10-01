// Turns cleaner.js into two bookmarklets (dist/*.txt are the URLs, dist/install.html has both links to drag):
// - auto-update: fetches cleaner.js from GitHub on every click, so merged rules arrive without reinstalling
// - offline: a frozen copy of cleaner.js, for sites whose security policy blocks the fetch
const fs = require('node:fs');

const LATEST = 'https://raw.githubusercontent.com/nuncaeslupus/html-cleaner/main/cleaner.js';

const source = fs.readFileSync('cleaner.js', 'utf8');
// raw.githubusercontent.com caches for ~5 minutes; `void` keeps the page from navigating to the result.
// no-referrer: GitHub should not learn which site the bookmark was clicked on.
const loader = `void fetch('${LATEST}', { referrerPolicy: 'no-referrer' })
  .then((r) => (r.ok ? r.text() : Promise.reject(new Error(r.status))))
  .then(eval)
  .catch((e) => alert('html-cleaner: could not load the latest rules (' + e.message + '). Try the offline bookmark.'));`;
[source, loader].forEach((code) => new Function(code)); // syntax check; throws before anything is written

// ponytail: no minifier, the bookmark just carries the readable source. Add one if a browser truncates it.
const offlineUrl = `javascript:${encodeURIComponent(source)}`;
const autoUrl = `javascript:${encodeURIComponent(loader)}`;

fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/bookmarklet.txt', offlineUrl);
fs.writeFileSync('dist/bookmarklet-auto.txt', autoUrl);
fs.writeFileSync(
  'dist/install.html',
  `<!doctype html><meta charset="utf-8"><title>html-cleaner</title>
<p>Drag one of these links to your bookmarks bar:</p>
<p><a href="${autoUrl}">Clean page</a> (auto-update: always runs the latest rules from GitHub)</p>
<p><a href="${offlineUrl}">Clean page (offline)</a> (frozen copy: rebuild and replace it after changing rules)</p>
`,
);
console.log(`dist/install.html written (auto-update ${autoUrl.length} chars, offline ${offlineUrl.length} chars)`);
