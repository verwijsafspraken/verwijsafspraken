const { stringifyHtml } = require('./rendering.js');

const openModals = [];

function closeAllModals() {
  const size = openModals.length;
  openModals.forEach(m => m.close());
  return size;
}

class Modal {
  constructor(html) {
    this._modal = document.querySelector('.modal') || document.createElement('div');
    this._modal.classList.add('modal');
    this._modal.innerHTML = stringifyHtml(html);
  }

  open() {
    document.body.appendChild(this._modal);

    this._modal.addEventListener('click', event => {
      if (event.target === this._modal) this.close();
    });
    this._modal.querySelector('button.close')?.addEventListener('click', () => {
      this.close();
    });
    openModals.push(this);
  }

  close() {
    document.body.removeChild(this._modal);
    openModals.splice(openModals.indexOf(this), 1);
  }
}

class SearchModal extends Modal {
  open() {
    this._searchbox = document.querySelector('input.search');
    super.open();
    if ( !this._searchbox ) return;

    const sourcePos = this._searchbox.getBoundingClientRect();
    const targetPos = this._modal.querySelector('form').getBoundingClientRect();

    const fakeSearch = this._searchbox.cloneNode();
    fakeSearch.style = `
      position: fixed;
      left: ${sourcePos.left}px;
      top: ${sourcePos.top}px;
      width: ${sourcePos.width}px;
      height: ${sourcePos.height}px;
    `;
    document.body.appendChild(fakeSearch);

    setTimeout(() => {
      fakeSearch.classList.add('fake');
      fakeSearch.style = `
        left: ${targetPos.left}px;
        top: ${targetPos.top}px;
        width: ${targetPos.width}px;
        height: ${targetPos.height}px;
      `;
    }, 1);

    setTimeout(() => this._modal.classList.add('open'), 100);
    setTimeout(() => document.body.removeChild(fakeSearch), 100);
  }

  close() {
    if ( !this._searchbox ) return super.close();

    this._modal.classList.remove('open');
    const sourcePos = this._modal.querySelector('form').getBoundingClientRect();
    const targetPos = this._searchbox.getBoundingClientRect();

    const fakeSearch = this._searchbox.cloneNode();
    fakeSearch.classList.add('fake');
    fakeSearch.style = `
      left: ${sourcePos.left}px;
      top: ${sourcePos.top}px;
      width: ${sourcePos.width}px;
      height: ${sourcePos.height}px;
    `;
    document.body.appendChild(fakeSearch);

    setTimeout(() => {
      fakeSearch.classList.remove('fake');
      fakeSearch.style = `
        position: fixed;
        left: ${targetPos.left}px;
        top: ${targetPos.top}px;
        width: ${targetPos.width}px;
        height: ${targetPos.height}px;
        transition: all 0.1s ease;
      `;
    }, 1);

    setTimeout(() => super.close(), 100);
    setTimeout(() => document.body.removeChild(fakeSearch), 100);
  }
}

class ShareModal extends Modal {
  open() {
    super.open();
    setTimeout(() => this._modal?.classList.add('open'), 1);
  }

  close() {
    this._modal?.classList.remove('open');
    setTimeout(() => super.close(), 200);
  }
}

module.exports = {
  SearchModal,
  ShareModal,
  closeAllModals
};
