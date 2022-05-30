import {
  initSearch,
  findSearchKeysRecurse,
  handleSearch
} from './search.js';

import {
  renderPage,
  renderFrontPage,
  renderPageNotFound,
  stringifyHtml
} from './rendering.js';

let database;
run();

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

async function run() {
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

  document.getElementById('js-search').oninput = handleSearch;
  window.scrollTo(0,0);
}

function urlFromPath(path) {
  return `#/${path.join('/')}`;
}
