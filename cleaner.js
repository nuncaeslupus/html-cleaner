// The fixed interpreter: it knows the step vocabulary and nothing about any site. `rules` maps a
// host (rules/<host>.json) to its rule; a rule applies to that host and its subdomains.
(rules) => {
  const all = (selector) => document.querySelectorAll(selector);
  const steps = {
    remove: (selector) => all(selector).forEach((el) => el.remove()),
    removeClass: ([selector, ...classes]) => all(selector).forEach((el) => el.classList.remove(...classes)),
    addClass: ([selector, ...classes]) => all(selector).forEach((el) => el.classList.add(...classes)),
    removeAttr: ([selector, attr]) => all(selector).forEach((el) => el.removeAttribute(attr)),
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
      else alert(`html-cleaner: unknown step "${name}" in the ${h} rule`);
    }),
  );
  if (!matching.length) alert(`html-cleaner: no rule for ${host}`);
}
