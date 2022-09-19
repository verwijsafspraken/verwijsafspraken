import {
  initSearch,
  findSearchKeysRecurse,
  openSearch
} from './search.js';

import {
  renderPage,
  renderFrontPage,
  renderPageNotFound,
  renderShareModal,
  stringifyHtml
} from './rendering.js';

import {
  ShareModal,
  closeAllModals
} from './modals.js';
import { logPageHelped, logPageVisit } from './metrics.js';
import { getUser, login as loginEditor, saveDatabase } from './editor'

let database;
run();

async function run() {
  setDeviceClass();
  attachKeyboardHandler();
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

function getCurrentPath() {
  return document.location.hash
    .replace(/^[#\/]*/g, '')
    .split('/')
    .filter(segment => segment !== '');
}

function getPage(path) {
  if (path.length === 0) {
    // Navigate to section on front page
    return database;
  }

  // Navigate to another page
  return path.reduce((page, segment) =>
    page?.children?.find(child => child.id?.toString() === segment)
  , database);
}

async function updatePage() {
  await closeAllModals();
  const user = await getUser();

  const path = getCurrentPath();
  const page = getPage(path);

  if (!page) {
    document.body.innerHTML = renderPageNotFound();
    return;
  }

  const context = {
    ...page,
    user
  }

  document.body.innerHTML = stringifyHtml(
    path.length
      ? renderPage(context)
      : renderFrontPage(context)
  );

  if (path.length === 0) {
    setTimeout(() => document.getElementById(path)?.scrollIntoView({ behavior: 'smooth' }), 1);
  }

  logPageVisit();

  document.getElementById('search').addEventListener('click', openSearch);
  document.querySelector('#search input').addEventListener('focus', openSearch);
  document.getElementById('share')?.addEventListener('click', sharePage);
  document.getElementById('helped')?.addEventListener('click', hasHelped);
  document.getElementById("login")?.addEventListener("click", login);
  document.getElementById("edit")?.addEventListener("click", editPage);
  window.scrollTo(0, 0);
}

function login(event) {
  event.preventDefault();
  loginEditor();
}

function htmlToMarkdown(html) {
  // Use https://github.com/mixmark-io/turndown?
  return html
    .replace(/<.*?>/g, '')
    .replace(/  +/g, ' ')
    .trim();
}

async function editPage(event) {
  event.preventDefault();
  const elements = document.querySelectorAll('[data-field]');
  if (event.target.textContent === 'Edit page') {
    event.target.textContent = 'Save';
    for (const element of elements) {
      element.setAttribute('contenteditable', 'true');
    }
  } else if (event.target.textContent === 'Save') {
    const pageChanges = {};
    for (const element of elements) {
      const fieldName = element.getAttribute('data-field');
      const fieldValue = htmlToMarkdown(element.innerHTML);
      pageChanges[fieldName] = fieldValue;
      element.setAttribute('contenteditable', 'false');
    }
    const path = getCurrentPath();
    const page = getPage(path);
    Object.assign(page, pageChanges);

    const url = await saveDatabase(database);
    window.location.href = url;

    event.target.textContent = 'Edit page';
  }
}

function sharePage(event) {
  // Use native share dialog if present
  if ( navigator.share ) return navigator.share(event.target.dataset);
  // Otherwise show our own modal
  const fullURL = window.location.origin + window.location.pathname + event.target.dataset.url;
  new ShareModal(renderShareModal({...event.target.dataset, fullURL})).open();
  document.querySelector('.share-url button').addEventListener('click', () => {
    navigator.clipboard.writeText(fullURL).then(() => {
      document.querySelector('.share-url').classList.add('shared');
    });
  });
}

function hasHelped(event) {
  event.preventDefault();
  logPageHelped();
  const helped = document.getElementById('helped');
  helped.setAttribute('data-helped-feedback', randomHasHelpedText());
  helped.classList.add('hasHelped');
  helped.classList.add('tooltip');
  setTimeout(() => helped.classList.remove('tooltip'), 2000);
}

function randomHasHelpedText() {
  const options = [
    '🐬 Dat vinden wij dolfijn!',
    '🎉 Dankjewel!',
    '💚 Merci beaucoup!',
    '✌️ Hey wat leuk! Bedankt',
    '🖐 High 5!',
    '🐋 Dankjewhale!',
    '⛰ Dat is top!',
    '☃️ Cool cool cool!',
    '💪 Dat doet ons goed!',
    '🍃 Dat vinden wij lief!'
  ];
  return options[Math.floor(Math.random()*options.length)];
}

function urlFromPath(path) {
  return `#/${path.join('/')}`;
}

function setDeviceClass() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  if (/android/i.test(userAgent)) document.body.classList.add('android');
  if (/iPad|iPhone|iPod/i.test(userAgent) && !window.MSStream) document.body.classList.add('ios');
}

function attachKeyboardHandler() {
  document.addEventListener('keyup', async event => {
    if ( event.key !== "Escape" ) return;
    if ( await closeAllModals() == 0 ) openSearch();
  });
}
