import { marked } from 'marked'

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
    ? renderPage(page)
    : renderPageNotFound()
  );
}

function urlFromPath(path) {
  return `#/${path.join('/')}`;
}

function renderPage(page) {
  const { id, name, content, children, links, sticker } = page;
  return html`
    <main class="article-page">
      <header>
        <h1>Moetikhierdehuisartsmeelastigvallen.nl</h1>
        <form id="search">
          <input type="text" name="" value="" placeholder="Wat is uw behoefte?" />
          <button type="submit">Zoek</button>
        </form>
      </header>
      <section class="content">
        ${renderBreadcrumb(page)}
        <h1>${name}</h1>
        ${renderMarkdown(content)}
        ${children && html`
          <ul class="child-articles">
            ${children.map(({ id, name, content, url }) => html`
              <li>
                <a href=${url}>
                  <h2>${name}</h2>
                  ${renderMarkdown(content)}
                </a>
              </li>
            `)}
          </ul>
        `}
      </section>
      ${sticker !== undefined ? html`
        <aside class="sticker">
          <h1>Huisarts lastigvallen?</h1>
          <p class=${`sticker ${sticker ? 'yes' : 'no'}`}>${sticker ? 'Ja!' : 'Nee!'}</p>
        </aside>
      ` : ''}
      <aside class="sidebar">
        <section class="share">
          <p><button>Deel dit!</button></p>
        </section>

        ${links && html`
          <section class="links">
            <h1>Meer lezen</h1>
            <ul>
              ${links.map(({ name, url }) => html`
                <li><a href=${url}>${name}</a></li>
              `)}
            </ul>
          </section>
        `}
      </aside>
    </main>
  `
}

function renderPageNotFound() {
  return html`
    Not found
  `
}

function renderMarkdown(markdown) {
  return new Html(marked.parse(markdown));
}

function encodeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

class Html {
  constructor(content) {
    this.content = content;
  }
}

function html(strings, ...variables) {
  let result = '';
  for (let i = 0; i < Math.max(strings.length, variables.length); i++) {
    if (i in strings) {
      result += strings[i];
    }
    if (i in variables) {
      const value = variables[i];
      const htmlValue = /=$/.test(strings[i])
        // HTML attribute support.
        ? JSON.stringify(value)
        // HTML content
        : stringifyHtml(value);
      result += htmlValue;
    }
  }
  return new Html(result);
}

function stringifyHtml(value) {
  return value instanceof Array
  ? value.map(stringifyHtml).join('\n')
  : value instanceof Html
  ? value.content
  : encodeHtml(stringifyValue(value));
}

function stringifyValue(value) {
  if (value === undefined || value === null) {
    return '';
  } else if (value instanceof Array) {
    return value.join('\n');
  } else {
    return value.toString();
  }
}

function renderBreadcrumb(page) {
  const parentItems = parents(page)
    .map(page => html`
      <li>
        <a href=${page.url}>
          ${page.name}
        </a>
      </li>
    `);

  return html`
    <ul class="breadcrumb">
      ${parentItems}
    </ul>
  `
}

function parents(node) {
  return node.parent
    ? [...parents(node.parent), node.parent]
    : [];
}
