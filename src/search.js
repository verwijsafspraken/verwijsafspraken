const Flexsearch = require('flexsearch');
const {
  SearchModal
} = require('./modals.js');
const {
  renderSearchModal,
  renderSearchResults,
  stringifyHtml
} = require('./rendering.js');
let fuse;

const index = new Flexsearch.Index({
  preset: 'score',
  language: 'nl-NL',
  tokenize: 'full',
  charset: 'latin:extra'
});

function flattenArticles(article) {
  return [
    article,
    ...(
      article.children
        ? article.children.flatMap(flattenArticles)
        : []
    )
  ];
}

function escapeRegExp(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|]/g, '\\$&');
}

function anyOfRegExp(texts) {
  return new RegExp(
    texts
      .map(text =>
          text instanceof RegExp
          ? text.source
          : escapeRegExp(text)
      )
      .join('|')
    , "giu"
  );
}

const markdownRegExp = anyOfRegExp([
  /^\* /,
  /^#+ /,
  '*',
  '**',
  '_',
  '>',
  '`'
]);

function demarkdown(text) {
  return text.replaceAll(markdownRegExp, '');
}

let articles;

function initSearch(database) {
  articles = flattenArticles(database);
  for (const [articleIndex, article] of articles.entries()) {
    const text = demarkdown([
      article.name,
      article.blurb,
      article.content
    ].filter(Boolean).join('\n\n'));
    index.add(articleIndex, text);
  }
}

function createArticleMatches(query, articles) {
  // Create regexp from words in query resulting in:
  //   word1|word2|word3
  const wordRegexp = anyOfRegExp(query.split(' '));
  const keys = ['name', 'content'];

  return articles
    .map(article => {
      const matches = keys
        .map(key => {
          const value = demarkdown(article[key]);
          const indices = [...value.matchAll(wordRegexp)]
            .map(match => [match.index, match.index + match[0].length - 1]);
          return { key, value, indices };
        });
      return { item: article, matches };
    });
}

function search(query) {
  const foundItemIndexes = index.search(query);
  const items = foundItemIndexes.map(index => articles[index]);
  return createArticleMatches(query, items);
}

function openSearch() {
  new SearchModal(renderSearchModal()).open();
  const resultList = document.querySelector('.search-modal ul');
  const newInput = document.querySelector('.search-modal input');
  newInput.addEventListener('input', event => {
    const query = event.target.value;
    resultList.innerHTML =
      stringifyHtml(renderSearchResults(search(query)));
  });
  newInput.addEventListener('keydown', event => {
    if ( event.key === "Enter" )
      ( resultList.querySelector('a:hover') ||
        resultList.querySelector('a') )?.click();
  });
  newInput.focus();
}

module.exports = {
  initSearch,
  openSearch
};
