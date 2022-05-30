import {
  initSearch,
  findSearchKeysRecurse,
  handleSearch
} from './search.js';

import {
  renderPage,
  renderFrontPage,
  renderPageNotFound,
  renderShareModal,
  stringifyHtml
} from './rendering.js';

let database;
run();

async function run() {
  setDeviceClass();
  database = await fetch('./database.json').then(response => response.json());
  database = preprocessNode({
    path: [],
    node: database,
    parent: null
  });

  initSearch(database);

  window.addEventListener('hashchange', () => {
    updatePage();
  }, true);
  updatePage();
}

function preprocessNode({ path, node, parent }) {
  node.path = path;
  node.url = urlFromPath(path);
  node.parent = parent;
  if (node.children) {
    for (const child of node.children) {
      preprocessNode({
        path: [...path, child.id],
        node: child,
        parent: node
      });
    }
  }
  return node;
}

function updatePage() {
  const path = document.location.hash
    .replace(/^[#\/]*/g, '')
    .split('/')
    .filter(segment => segment !== '');

  const page = path
    .reduce((page, segment) => page?.children?.find(child => child.id?.toString() === segment), database);

  document.body.innerHTML = stringifyHtml(
    page
    ? page.path.length < 1 ? renderFrontPage(page) : renderPage(page)
    : renderPageNotFound()
  );

  document.getElementById('js-search').addEventListener('input', handleSearch);
  document.getElementById('share').addEventListener('click', sharePage);
  window.scrollTo(0,0);
}

function sharePage(event) {
  // Use native share dialog if present
  if ( navigator.share ) return navigator.share(event.target.dataset);

  // Otherwise show our own modal
  const shareModal = document.querySelector('.share-modal')
    || document.createElement('div');
  shareModal.classList.add('share-modal');
  shareModal.innerHTML = stringifyHtml(
    renderShareModal(event.target.dataset)
  );
  document.body.appendChild(shareModal);
}

function urlFromPath(path) {
  return `#/${path.join('/')}`;
}

function setDeviceClass() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  if (/android/i.test(userAgent)) document.body.classList.add('android');
  if (/iPad|iPhone|iPod/i.test(userAgent) && !window.MSStream) document.body.classList.add('ios');
}
