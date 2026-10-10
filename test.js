// Each rules/<host>.json runs against fixtures/<host>.html, and the page must come out as
// fixtures/<host>.clean.html. No network: the fixtures are recorded excerpts.
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { JSDOM } = require('jsdom');
const { loadRules, bundle } = require('./build.js');

const interpreter = fs.readFileSync('cleaner.js', 'utf8');
const rules = loadRules();

// Runs the interpreter with `rules` on `html` as served from `hostname`; returns the body and any alerts.
function clean(html, hostname, withRules = rules) {
  const dom = new JSDOM(html, { url: `https://${hostname}/`, runScripts: 'outside-only' });
  const alerts = [];
  dom.window.alert = (message) => alerts.push(message);
  dom.window.eval(`(${interpreter})`)(withRules);
  return { body: dom.window.document.body.innerHTML.trim(), alerts };
}
const fixture = (name) => fs.readFileSync(path.join('fixtures', name), 'utf8');

for (const host of Object.keys(rules)) {
  test(`${host}: cleans its fixture`, () => {
    const { body, alerts } = clean(fixture(`${host}.html`), `www.${host}`);
    const expected = new JSDOM(fixture(`${host}.clean.html`)).window.document.body.innerHTML.trim();
    assert.strictEqual(body, expected);
    assert.deepStrictEqual(alerts, []);
  });
}

test('unknown host: touches nothing and says so', () => {
  const html = fixture('jobfluent.com.html');
  const { body, alerts } = clean(html, 'notjobfluent.com');
  assert.strictEqual(body, new JSDOM(html).window.document.body.innerHTML.trim());
  assert.strictEqual(alerts.length, 1);
});

test('linkFrom: does not link a non-http URL', () => {
  const html = fixture('jobleads.com.html').replace('https://jobs.lever.co/acme/1', 'javascript:alert(1)');
  assert.doesNotMatch(clean(html, 'www.jobleads.com').body, /<a /);
});

test('unknown step: skipped with an alert', () => {
  const { alerts } = clean('<p></p>', 'example.com', { 'example.com': { steps: [{ constructor: 'x' }] } });
  assert.strictEqual(alerts.length, 1);
});

test('rules.json is the bundle of rules/*.json (run make build)', () => {
  assert.strictEqual(fs.readFileSync('rules.json', 'utf8'), bundle(rules));
});

test('validation rejects code-shaped or complex rules', () => {
  const bad = [
    ['example.com.json', { about: 'x', steps: [{ eval: 'alert(1)' }] }],
    ['example.com.json', { about: 'x', steps: [{ remove: 'div > .a' }] }],
    ['example.com.json', { about: 'x', steps: [{ linkFrom: { nuxt: 'u', after: '.a', href: 'x' } }] }],
    ['not a host.json', { about: 'x', steps: [{ remove: '.a' }] }],
  ];
  for (const [file, rule] of bad) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rules-'));
    fs.writeFileSync(path.join(dir, file), JSON.stringify(rule));
    assert.throws(() => loadRules(dir), new RegExp(file.replace(/\./g, '\\.')));
  }
});
