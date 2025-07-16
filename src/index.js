import { initSearch, findSearchKeysRecurse, openSearch } from "./search.js";

import { renderPage, renderFrontPage, renderPageNotFound, renderShareModal, stringifyHtml } from "./rendering.js";

import { ShareModal, closeAllModals } from "./modals.js";

import { logPageHelped, logPageVisit } from "./metrics.js";

import { openEditor, notifyEditor } from "./editor.js";

let database, processedDatabase;
run();

async function run() {
  setDeviceClass();
  attachKeyboardHandler();
  database = await fetch("./database.json").then((response) => response.json());
  processDatabase(database);
  window.addEventListener(
    "hashchange",
    () => {
      updatePage();
    },
    true,
  );
}

function processDatabase(database) {
  processedDatabase = preprocessNode({
    path: [],
    node: database,
    parent: null,
  });

  initSearch(processedDatabase);
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
        parent: node,
      });
    }
  }
  return node;
}

async function updatePage() {
  await closeAllModals();

  let page, path;
  if (!document.location.hash.match(/^(#\/)+/g)) {
    // Navigate to section on front page
    page = processedDatabase;
    const path = document.location.hash.replace(/^[#\/]*/g, "");
    setTimeout(() => document.getElementById(path)?.scrollIntoView({ behavior: "smooth" }), 1);
  } else {
    // Navigate to another page
    path = document.location.hash
      .replace(/^[#\/]*/g, "")
      .split("/")
      .filter((segment) => segment !== "");

    page = path.reduce(
      (page, segment) => page?.children?.find((child) => child.id?.toString() === segment),
      processedDatabase,
    );
  }

  document.body.innerHTML = stringifyHtml(
    page ? (page.path.length < 1 ? renderFrontPage(page) : renderPage(page)) : renderPageNotFound(),
  );

  logPageVisit();
  notifyEditor(database, page, path, processDatabase);

  document.getElementById("search").addEventListener("click", openSearch);
  document.querySelector("#search input").addEventListener("focus", openSearch);
  document.getElementById("share")?.addEventListener("click", sharePage);
  document.getElementById("helped")?.addEventListener("click", hasHelped);
  window.scrollTo(0, 0);
}

function sharePage(event) {
  // Use native share dialog if present
  if (navigator.share) return navigator.share(event.target.dataset);
  // Otherwise show our own modal
  const fullURL = window.location.origin + window.location.pathname + event.target.dataset.url;
  new ShareModal(renderShareModal({ ...event.target.dataset, fullURL })).open();
  document.querySelector(".share-url button").addEventListener("click", () => {
    navigator.clipboard.writeText(fullURL).then(() => {
      document.querySelector(".share-url").classList.add("shared");
    });
  });
}

function hasHelped(event) {
  event.preventDefault();
  logPageHelped();
  const helped = document.getElementById("helped");
  helped.setAttribute("data-helped-feedback", randomHasHelpedText());
  helped.classList.add("hasHelped");
  helped.classList.add("tooltip");
  setTimeout(() => helped.classList.remove("tooltip"), 2000);
}

function randomHasHelpedText() {
  const options = [
    "🐬 Dat vinden wij dolfijn!",
    "🎉 Dankjewel!",
    "💚 Merci beaucoup!",
    "✌️ Hey wat leuk! Bedankt",
    "🖐 High 5!",
    "🐋 Dankjewhale!",
    "⛰ Dat is top!",
    "☃️ Cool cool cool!",
    "💪 Dat doet ons goed!",
    "🍃 Dat vinden wij lief!",
  ];
  return options[Math.floor(Math.random() * options.length)];
}

function urlFromPath(path) {
  return `#/${path.join("/")}`;
}

function setDeviceClass() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  if (/android/i.test(userAgent)) document.body.classList.add("android");
  if (/iPad|iPhone|iPod/i.test(userAgent) && !window.MSStream) document.body.classList.add("ios");
}

function attachKeyboardHandler() {
  document.addEventListener("keyup", async (event) => {
    switch (event.code) {
      case "Escape":
        if ((await closeAllModals()) == 0) openSearch();
        return;
      case "Backquote":
        if (!event.altKey) return;
        if ((await closeAllModals()) == 0) openEditor();
        return;
    }
  });
}
