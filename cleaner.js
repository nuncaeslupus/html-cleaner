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
  ];

  const matching = rules.filter((rule) => rule.host.test(location.hostname));
  matching.forEach((rule) => rule.fix());
  if (!matching.length) alert(`html-cleaner: no rule for ${location.hostname}`);
})();
