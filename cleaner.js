// The fixed interpreter: it knows the step vocabulary and nothing about any site. `rules` maps a
// host (rules/<host>.json) to its rule; a rule applies to that host and its subdomains.
// It is frozen into installed bookmarks, so it accepts more than build.js lets a rule use (any
// selector, any number of classes or attributes): loosening a rule check then needs no reinstall.
(rules) => {
  const all = (selector) => document.querySelectorAll(selector);
  const steps = {
    remove: (selector) => all(selector).forEach((el) => el.remove()),
    removeClass: ([selector, ...classes]) => all(selector).forEach((el) => el.classList.remove(...classes)),
    addClass: ([selector, ...classes]) => all(selector).forEach((el) => el.classList.add(...classes)),
    removeAttr: ([selector, ...attrs]) => all(selector).forEach((el) => attrs.forEach((a) => el.removeAttribute(a))),
    // Overrides an inline style (an empty value removes it): blurs, scroll locks, clipped heights.
    style: ([selector, property, value]) =>
      all(selector).forEach((el) => el.style.setProperty(property, value, value ? 'important' : '')),
    // Links a URL found in the Nuxt payload (a flat array whose objects hold indexes into it).
    linkFrom: ({ nuxt, after }) => {
      const payload = JSON.parse(document.querySelector('#__NUXT_DATA__')?.textContent || '[]');
      const url = payload[payload.find((node) => node?.[nuxt] !== undefined)?.[nuxt]];
      // Only http(s): the URL comes from the page, and a javascript: one would run on click.
      if (typeof url !== 'string' || !/^https?:/.test(url)) return;
      all(after).forEach((el) => el.after(Object.assign(document.createElement('a'), { href: url, textContent: url })));
    },
  };

  const host = location.hostname;
  const matching = Object.keys(rules).filter((h) => host === h || host.endsWith(`.${h}`));
  matching.forEach((h) =>
    rules[h].steps.forEach((step) => {
      const [name, arg] = Object.entries(step)[0];
      if (Object.hasOwn(steps, name)) steps[name](arg);
      else alert(`html-cleaner: the ${h} rule needs a newer bookmark ("${name}"); reinstall it from install.html`);
    }),
  );
  if (!matching.length) alert(`html-cleaner: no rule for ${host}`);
}
