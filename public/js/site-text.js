"use strict";
// Copies the name, tagline and book list from content.js into the page's plain HTML
// (the header, and the simple catalog shown when 3D cannot run).

document.querySelector("#site-name").textContent = SITE.name;
document.querySelector("#site-tagline").textContent = SITE.tagline;
document.querySelector("#site-edition").textContent = SITE.edition;
document.querySelector("#fallback-kicker").textContent = `${SITE.name} · Portfolio`;
document.querySelector("#fallback-title").textContent = SITE.fallbackTitle;
document.querySelector("#fallback-credit").textContent = SITE.credit;

BOOKS.forEach((book) => {
  const card = document.createElement("article");
  card.className = "fallback-book";
  card.style.setProperty("--book-color", book.color);
  card.style.setProperty("--book-foil", book.foil);
  card.style.setProperty("--book-height", `${Math.round(book.height * 247)}px`);
  const label = document.createElement("span");
  label.textContent = `Volume ${book.roman}`;
  const title = document.createElement("strong");
  title.textContent = book.title;
  card.append(label, title);
  document.querySelector("#fallback-grid").append(card);
});
