(() => {
  // One entry per site: `host` is tested against location.hostname, `fix` does the cleaning.
  const rules = [
    {
      // The full description is already in the DOM; the LinkedIn wall is only CSS classes.
      host: /(^|\.)jobfluent\.com$/,
      fix: () =>
        document.querySelectorAll('.offer-description').forEach((el) => {
          el.classList.remove('hide-desc-true');
          el.classList.add('open');
        }),
    },
    {
      // The wall is a modal, an `inert` page and a blur. The page only ships a summary, so also
      // link the original posting, whose URL sits in the Nuxt payload (a flat array of index refs).
      host: /(^|\.)jobleads\.com$/,
      fix: () => {
        document.querySelectorAll('.RegistrationModal').forEach((el) => el.remove());
        document.querySelectorAll('[inert]').forEach((el) => el.removeAttribute('inert'));
        const payload = JSON.parse(document.querySelector('#__NUXT_DATA__')?.textContent || '[]');
        const url = payload[payload.find((node) => node?.sourceUrl)?.sourceUrl];
        document.querySelectorAll('.job-preview-description--blurred').forEach((el) => {
          el.classList.remove('job-preview-description--blurred');
          // Only http(s): the URL comes from the page, and a javascript: one would run on click.
          if (/^https?:/.test(url)) {
            el.after(Object.assign(document.createElement('a'), { href: url, textContent: url }));
          }
        });
      },
    },
  ];

  const matching = rules.filter((rule) => rule.host.test(location.hostname));
  matching.forEach((rule) => rule.fix());
  if (!matching.length) alert(`html-cleaner: no rule for ${location.hostname}`);
})();
