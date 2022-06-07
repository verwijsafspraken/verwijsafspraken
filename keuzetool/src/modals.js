const { stringifyHtml } = require('./rendering.js');

const openModals = [];

async function closeAllModals() {
  const size = openModals.length;
  for (modal of openModals) await modal.close();
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
    if ( [...document.body.childNodes].includes(this._modal) )
      document.body.removeChild(this._modal);
    const position = openModals.indexOf(this);
    if ( position > -1 ) openModals.splice(position, 1);
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
    fakeSearch.classList.add('fake');
    fakeSearch.style = `
      left: ${sourcePos.left}px;
      top: ${sourcePos.top}px;
      width: ${sourcePos.width}px;
      height: ${sourcePos.height}px;
    `;
    document.body.appendChild(fakeSearch);
    this._searchbox.style.opacity = 0;

    setTimeout(() => {
      fakeSearch.classList.add('open');
      fakeSearch.style = `
        left: ${targetPos.left}px;
        top: ${targetPos.top}px;
        width: ${targetPos.width}px;
        height: ${targetPos.height}px;
      `;
    }, 1);

    setTimeout(() => {
      this._modal.classList.add('open');
      document.body.removeChild(fakeSearch);
    }, 200);
  }

  close() {
    return new Promise((resolve, reject) => {
      if ( !this._searchbox ) return super.close();

      this._modal.classList.remove('open');
      const sourcePos = this._modal.querySelector('form').getBoundingClientRect();
      const targetPos = this._searchbox.getBoundingClientRect();

      const fakeSearch = this._searchbox.cloneNode();
      fakeSearch.classList.add('fake');
      fakeSearch.classList.add('open');
      fakeSearch.style = `
        left: ${sourcePos.left}px;
        top: ${sourcePos.top}px;
        width: ${sourcePos.width}px;
        height: ${sourcePos.height}px;
      `;
      document.body.appendChild(fakeSearch);

      setTimeout(() => {
        fakeSearch.classList.remove('open');
        fakeSearch.style = `
          left: ${targetPos.left}px;
          top: ${targetPos.top}px;
          width: ${targetPos.width}px;
          height: ${targetPos.height}px;
        `;
      }, 1);

      setTimeout(() => {
        super.close();
        document.body.removeChild(fakeSearch);
        this._searchbox.style.opacity = 1;
        resolve();
      }, 200);
    });
  }
}

class ShareModal extends Modal {
  open() {
    super.open();
    setTimeout(() => this._modal?.classList.add('open'), 1);
  }

  close() {
    return new Promise((resolve, reject) => {
      this._modal?.classList.remove('open');
      setTimeout(() => {
        super.close();
        resolve();
      }, 200);
    });
  }
}

module.exports = {
  SearchModal,
  ShareModal,
  closeAllModals
};
