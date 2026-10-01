// Turns cleaner.js into a bookmarklet: dist/bookmarklet.txt (the URL) and dist/install.html (drag the link).
const fs = require('node:fs');

const source = fs.readFileSync('cleaner.js', 'utf8');
new Function(source); // syntax check; throws before anything is written

// ponytail: no minifier, the bookmark just carries the readable source. Add one if a browser truncates it.
const url = `javascript:${encodeURIComponent(source)}`;

fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/bookmarklet.txt', url);
fs.writeFileSync(
  'dist/install.html',
  `<!doctype html><meta charset="utf-8"><title>html-cleaner</title>
<p>Drag this link to your bookmarks bar: <a href="${url}">Clean page</a></p>
`,
);
console.log(`dist/install.html and dist/bookmarklet.txt written (${url.length} chars)`);
