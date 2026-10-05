const assert = require('node:assert');
const fs = require('node:fs');
const test = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync('cleaner.js', 'utf8');

function run(hostname, classes) {
  const el = {
    classes: new Set(classes),
    classList: { remove: (c) => el.classes.delete(c), add: (c) => el.classes.add(c) },
  };
  const alerts = [];
  vm.runInNewContext(source, {
    location: { hostname },
    document: { querySelectorAll: () => [el] },
    alert: (message) => alerts.push(message),
  });
  return { classes: [...el.classes], alerts };
}

test('jobfluent: unhides and expands the description', () => {
  const { classes, alerts } = run('www.jobfluent.com', ['offer-description', 'hide-desc-true']);
  assert.deepStrictEqual(classes, ['offer-description', 'open']);
  assert.deepStrictEqual(alerts, []);
});

test('unknown host: touches nothing and says so', () => {
  const { classes, alerts } = run('notjobfluent.com', ['hide-desc-true']);
  assert.deepStrictEqual(classes, ['hide-desc-true']);
  assert.strictEqual(alerts.length, 1);
});

function runJobleads(sourceUrl) {
  const removed = [];
  const added = [];
  const el = (classes) => ({
    classes: new Set(classes),
    classList: { remove: (c) => removed.push(c) },
    remove: () => removed.push('modal'),
    removeAttribute: (name) => removed.push(name),
    after: (node) => added.push(node.href),
  });
  const found = {
    '.RegistrationModal': [el()],
    '[inert]': [el()],
    '.job-preview-description--blurred': [el()],
  };
  vm.runInNewContext(source, {
    location: { hostname: 'www.jobleads.com' },
    document: {
      querySelectorAll: (selector) => found[selector],
      // Nuxt payload: objects hold indexes into the same array.
      querySelector: () => ({ textContent: JSON.stringify([{ job: 1 }, { sourceUrl: 2 }, sourceUrl]) }),
      createElement: () => ({}),
    },
  });
  return { removed, added };
}

test('jobleads: drops the wall and links the original posting', () => {
  const { removed, added } = runJobleads('https://jobs.lever.co/acme/1');
  assert.deepStrictEqual(removed, ['modal', 'inert', 'job-preview-description--blurred']);
  assert.deepStrictEqual(added, ['https://jobs.lever.co/acme/1']);
});

test('jobleads: does not link a non-http source URL', () => {
  assert.deepStrictEqual(runJobleads('javascript:alert(1)').added, []);
});
