import { marked } from 'marked'

let database;

run();

async function run() {
  database = await fetch('./database.json').then(response => response.json());
  window.addEventListener('hashchange', () => {
    updatePage();
  }, true);
  updatePage();
}

function updatePage() {
  const pathSegments = document.location.hash
    .replace(/^[#\/]*/g, '')
    .split('/')
    .filter(segment => segment !== '');

  const page = pathSegments
    .reduce((page, segment) => page?.children?.find(child => child.id?.toString() === segment), database);

  document.body.innerHTML = page
    ? renderPage(page)
    : renderPageNotFound();
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
        <h1>${renderText(name)}</h1>
        ${renderMarkdown(content)}
        ${children && html`
          <ul class="child-articles">
            ${children.map(({ id, name, content }) => html`
              <li>
                <h2>${renderText(name)}</h2>
                ${renderMarkdown(content)}
              </li>
            `)}
          </ul>
        `}
      </section>
      ${sticker !== undefined ? html`
        <aside class="sticker">
          <h1>Huisarts lastigvallen?</h1>
          <p class="sticker ${sticker ? 'yes' : 'no'}">${sticker ? 'Ja!' : 'Nee!'}</p>
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
              <li><a href="#">Dingen</a></li>
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
  return marked.parse(markdown);
}

function renderText(text) {
  if (text === undefined) {
    throw new Error('text is undefined');
  }
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function html(strings, ...variables) {
  let result = '';
  for (let i = 0; i < Math.max(strings.length, variables.length); i++) {
    if (i in strings) {
      result += strings[i];
    }
    if (i in variables) {
      result += stringifyHtml(variables[i]);
    }
  }
  return result;
}

function stringifyHtml(value) {
  if (value === undefined || value === null) {
    return '';
  } else if (value instanceof Array) {
    return value.join('\n');
  } else {
    return value.toString();
  }
}
