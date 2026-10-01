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
