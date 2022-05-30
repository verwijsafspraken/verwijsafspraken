const { stringifyHtml } = require('./rendering.js');

module.exports = function(html) {
  const modal = document.querySelector('.modal') || document.createElement('div');
  modal.classList.add('modal');
  modal.innerHTML = stringifyHtml(html);
  document.body.appendChild(modal);
  modal.addEventListener('click', event => {
    if (event.target === modal)
      document.body.removeChild(modal);
  });
  modal.querySelector('button.close')?.addEventListener('click', () =>
    document.body.removeChild(modal));
}
