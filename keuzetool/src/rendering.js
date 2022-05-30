const marked = require('marked');

function renderFrontPage(page) {
  const { id, name, content, children, links, sticker, header, blurb } = page;
  return html`
    <main class="front-page">
      <nav>
        <h1><a href="#">EHBDoorverwijzen</a></h1>
        <ul>
          <li><a href="#">Home</a></li>
          <li><a href="#">Over EHBD</a></li>
          <li><a href="#">Artikelen</a></li>
        </ul>
        <form></form>
      </nav>
      <header>
        <h1>${header}</h1>
        ${renderMarkdown(blurb)}
        <form id="search">
          <input id="js-search" type="text" name="" value="" placeholder="Wat is uw behoefte?" />
          <button type="submit">Zoeken</button>
        </form>
      </header>
      <section class="content">
        ${renderChildren(page)}
        <h1 class="under-striped">${name}</h1>
        ${renderMarkdown(content)}
      </section>
      <footer></footer>
    </main>
  `
}

function renderPage(page) {
  const { id, name, content, children, links, sticker } = page;
  return html`
    <main class="article-page">
      <nav>
        <h1><a href="#">EHBDoorverwijzen</a></h1>
        <ul>
          <li><a href="#">Home</a></li>
          <li><a href="#">Over EHBD</a></li>
          <li><a href="#">Artikelen</a></li>
        </ul>
        <form id="search">
          <input id="js-search" type="text" name="" value="" placeholder="Zoeken op onderwerp" />
        </form>
      </nav>
      <section class="content">
        ${renderBreadcrumb(page)}
        <section class="two-column">
          <div class="column">
            <h1>${name}</h1>
            ${sticker !== undefined ? html`
              <p class=${`sticker ${sticker ? 'yes' : 'no'}`}>
                ${sticker
                  ? 'Je hebt de hulp van de huisarts nodig'
                  : 'De huisarts hoeft hier niet bij betrokken te worden'
                }
              </p>
            ` : ''}
            ${renderMarkdown(content)}
          </div>
          ${links && html`
            <div class="column">
              <section class="share">
                <p><button>Deel dit!</button></p>
              </section>
              <section class="links">
                <h1>Meer lezen</h1>
                <ul>
                  ${links.map(({ name, url }) => html`
                    <li><a href=${url}>${name}</a></li>
                  `)}
                </ul>
              </section>
            </div>
          `}
        </section>
        ${children && html`<h2 class="articles">Artikelen</h2>`}
        ${renderChildren(page)}
      </section>
      <footer></footer>
    </main>
  `
}

function renderPageNotFound() {
  return html`
    <main class="article-page">
      <nav>
        <h1><a href="#">EHBDoorverwijzen</a></h1>
        <ul>
          <li><a href="#">Home</a></li>
          <li><a href="#">Over EHBD</a></li>
          <li><a href="#">Artikelen</a></li>
        </ul>
        <form id="search">
          <input id="js-search" type="text" name="" value="" placeholder="Zoeken op onderwerp" />
        </form>
      </nav>
      <section class="content">
        <ul class="breadcrumbs">
          <li><a href="#">Home</a></li>
          <li><a href="#">Pagina niet gevonden</a></li>
        </ul>
        <section class="two-column">
          <div class="column">
            <h1>Pagina niet gevonden</h1>
            <p>De link die je gevolgd hebt leidt naar een pagina die niet (meer) bestaat.</p>
            <p>Sorry! Hopelijk kom je eruit met de zoekfunctie hierboven?</p>
          </div>
        </section>
      </section>
      <footer></footer>
    </main>
  `
}

function renderSearchResults(results) {
  console.log(results);
  return html`
    <ul>
      ${results ? results.map(({ item, matches }) => html`
        <li>
          <a href="${item.url}">
            <h1>${item.name}</h1>
            <p>${item.blurb}</p>
          </a>
        </li>
      `) : html`
        <li class="not-found">No results found</li>
      `}
    </ul>
  `;
}

function renderMarkdown(markdown) {
  return new Html(markdown ? marked.parse(markdown) : '');
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
        <a href=${page.url}>${page.breadcrumb || page.name}</a>
      </li>
    `);

  return html`
    <ul class="breadcrumbs">
      ${parentItems}
    </ul>
  `
}

function parents(node) {
  return node.parent
    ? [...parents(node.parent), node]
    : [];
}

function renderChildren(page) {
  if ( !page.children ) return '';
  return html`
    <ul class="child-articles">
      ${page.children.map(({ id, name, blurb, url, children }) => html`
        <li>
          <a href="${url}">
            ${children && children.length > 0 && html`
              <span class="tag">${numArticles(children)} artikelen</span>
            `}
            <h1>${name}</h1>
            <div>${renderMarkdown(blurb)}</div>
            <span class="button">Lees meer</span>
          </a>
        </li>
      `)}
    </ul>
  `
}

function numArticles(children) {
  return children
    ? children.length +
      children.reduce((a, p) => a + numArticles(p.children), 0)
    : 0;
}

module.exports = {
  renderPage,
  renderFrontPage,
  renderPageNotFound,
  renderSearchResults,
  stringifyHtml
};
