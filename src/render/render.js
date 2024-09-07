const render = (stats, el, i18ni) => {
  const elements = el;
  elements.pText.textContent = i18ni.t(stats.status);
  switch (stats.status) {
    case '':
    case 'text.rssAdded':
    case 'text.URLview':
      elements.input.classList.remove('is-invalid');
      elements.pText.classList.remove('text-danger');
      elements.pText.classList.add('text-success');
      break;
    default:
      elements.input.classList.add('is-invalid');
      elements.pText.classList.remove('text-success');
      elements.pText.classList.add('text-danger');
      break;
  }
};

export default render;
