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
  const { id, name, content, children, links } = page;
  return html`
    <main class="article-page">
      <header>
        <h1>Moetikhierdehuisartsmeelastigvallen.nl</h1>
        <form id="search">
          <input type="text" name="" value="" placeholder="Wat is uw behoefte?" />
          <button type="submit">Zoek</button>
        </form>
      </header>
      <section id="page-content">
        <h1>${renderText(name)}</h1>
        ${renderMarkdown(content)}
      </section>
      ${children && html`
        <section id="child-articles">
        <ul>
          ${children.map(({ id, name, content }) => html`
            <li>
              <h2>${renderText(name)}</h2>
              ${renderMarkdown(content)}
            </li>
          `)}
        </ul>
      `}
    </section>
    </main>
  `
}

function renderPageNotFound() {
  return html`
    Not found
  `
}

function renderMarkdown(markdown) {
  if (markdown === undefined) {
    throw new Error('text is undefined');
  }
  return markdown
    .split('\n\n')
    .map(paragraph => html`<p>${renderText(paragraph)}</p>`)
    .join('\n');
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