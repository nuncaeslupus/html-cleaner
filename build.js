// Turns cleaner.js (the interpreter) and rules/*.json (the sites) into two bookmarklets
// (dist/*.txt are the URLs, dist/install.html has both links to drag):
// - auto-update: carries the interpreter and fetches rules.json from GitHub on every click, so merged
//   rules arrive without reinstalling. Only data is fetched, so a rule can never run code.
// - offline: a frozen copy of the interpreter and the rules, for sites whose security policy blocks the fetch
// It also writes rules.json, the committed bundle of rules/*.json that the auto-update bookmark reads.
const fs = require('node:fs');
const path = require('node:path');

const LATEST = 'https://raw.githubusercontent.com/nuncaeslupus/html-cleaner/main/rules.json';

// Selectors stay readable at a glance in review: tags, #id, .class and [attr] / [attr="value"],
// chained (div.a[b]) and nested with a space or `>`. Pseudo-classes, `,`, `+` and `~` are not allowed.
const SIMPLE = String.raw`(?:[a-z][a-z0-9-]*|[#.][A-Za-z_][\w-]*|\[[A-Za-z_][\w-]*(?:="[^"\\]*")?\])`;
const SELECTOR = new RegExp(String.raw`^${SIMPLE}+(?:\s*[ >]\s*${SIMPLE}+)*$`);
const NAME = /^[A-Za-z_][\w-]*$/;
const selectorAnd = (min, rest) => (arg) =>
  Array.isArray(arg) && arg.length >= min && SELECTOR.test(arg[0]) && arg.slice(1).every((x) => rest.test(x));
const STEPS = {
  remove: (arg) => SELECTOR.test(arg),
  removeClass: selectorAnd(2, NAME),
  addClass: selectorAnd(2, NAME),
  removeAttr: selectorAnd(2, NAME),
  // No url(): a style must not make the page fetch anything.
  style: (arg) =>
    Array.isArray(arg) && arg.length === 3 && SELECTOR.test(arg[0]) && /^-?[a-z][a-z-]*$/.test(arg[1]) &&
    /^[\w\s.%#(),-]*$/.test(arg[2]) && !/url\s*\(/i.test(arg[2]),
  linkFrom: (arg) =>
    arg && Object.keys(arg).sort().join() === 'after,nuxt' && NAME.test(arg.nuxt) && SELECTOR.test(arg.after),
};

// Reads and validates every rules/<host>.json; throws on the first problem, naming the file.
function loadRules(dir = 'rules') {
  const rules = {};
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
    const host = file.slice(0, -'.json'.length);
    const fail = (why) => {
      throw new Error(`${path.join(dir, file)}: ${why}`);
    };
    if (!/^([a-z0-9-]+\.)+[a-z]{2,}$/.test(host)) fail('the file name must be a host, like example.com.json');
    const rule = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    if (typeof rule.about !== 'string' || !Array.isArray(rule.steps) || !rule.steps.length) {
      fail('needs an "about" string and a non-empty "steps" list');
    }
    rule.steps.forEach((step, i) => {
      const [name, ...extra] = Object.keys(step ?? {});
      if (!Object.hasOwn(STEPS, name) || extra.length) fail(`step ${i + 1}: one of ${Object.keys(STEPS).join(', ')}`);
      if (!STEPS[name](step[name])) fail(`step ${i + 1}: bad argument to ${name} (see README, Adding a site)`);
    });
    rules[host] = rule;
  }
  return rules;
}

const bundle = (rules) => `${JSON.stringify(rules, null, 2)}\n`;

function build() {
  const rules = loadRules();
  const interpreter = fs.readFileSync('cleaner.js', 'utf8').trim();
  // The offline copy leaves out each rule's "about": only the steps run.
  const steps = Object.fromEntries(Object.entries(rules).map(([host, rule]) => [host, { steps: rule.steps }]));
  const offline = `(${interpreter})(${JSON.stringify(steps)});`;
  // raw.githubusercontent.com caches for ~5 minutes; `void` keeps the page from navigating to the result.
  // no-referrer: GitHub should not learn which site the bookmark was clicked on.
  const loader = `void fetch('${LATEST}', { referrerPolicy: 'no-referrer' })
  .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
  .then(${interpreter})
  .catch((e) => alert('html-cleaner: could not load the latest rules (' + e.message + '). Try the offline bookmark.'));`;
  [offline, loader].forEach((code) => new Function(code)); // syntax check; throws before anything is written

  // ponytail: no minifier, the bookmark just carries the readable source. Add one if a browser truncates it.
  const offlineUrl = `javascript:${encodeURIComponent(offline)}`;
  const autoUrl = `javascript:${encodeURIComponent(loader)}`;

  fs.writeFileSync('rules.json', bundle(rules));
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
  console.log(`rules.json and dist/install.html written (auto-update ${autoUrl.length} chars, offline ${offlineUrl.length} chars)`);
  return { offline };
}

module.exports = { loadRules, bundle, build };
if (require.main === module) build();
