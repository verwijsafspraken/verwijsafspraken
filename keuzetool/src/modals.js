const { stringifyHtml } = require('./rendering.js');

function openModal(html) {
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

function closeModal() {
  const modal = document.querySelector('.modal');
  if ( modal ) {
    document.body.removeChild(modal);
    return true;
  }
  return false;
}

module.exports = {
  openModal,
  closeModal
};
