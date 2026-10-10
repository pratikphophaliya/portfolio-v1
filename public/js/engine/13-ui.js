"use strict";
// Text on screen: markers, selected title, side panel and page counter.

function buildMarkers() {
  BOOKS.forEach((book, index) => {
    const button = document.createElement("button");
    button.className = "marker";
    button.type = "button";
    button.role = "tab";
    button.setAttribute("aria-label", `Select volume ${index + 1}: ${book.title}`);
    button.setAttribute("aria-current", index === 0 ? "true" : "false");
    button.setAttribute("aria-selected", index === 0 ? "true" : "false");
    button.addEventListener("click", () => selectMarker(index, button));
    markers.append(button);
  });
}

function updateSelection(index, announce = false) {
  const nextIndex = mod(index, BOOKS.length);
  if (nextIndex === selectedIndex && !announce) return;
  selectedIndex = nextIndex;
  const book = BOOKS[selectedIndex];
  selectionTitle.textContent = book.title;
  selectionNote.textContent = book.note;
  counter.textContent = `${pad(selectedIndex + 1)} / ${pad(BOOKS.length)}`;
  paletteLabel.textContent = book.paletteLabel;
  inspectButton.setAttribute("aria-label", `Open ${book.title}`);
  applyBookTheme(book);

  [...markers.children].forEach((marker, markerIndex) => {
    const current = markerIndex === selectedIndex;
    marker.setAttribute("aria-current", current ? "true" : "false");
    marker.setAttribute("aria-selected", current ? "true" : "false");
    marker.tabIndex = current ? 0 : -1;
  });

  if (announce) {
    liveRegion.textContent = `Selected volume ${selectedIndex + 1} of ${BOOKS.length}: ${book.title}. ${book.note}`;
  }
}

function populateDetail(book) {
  detailEyebrow.textContent = book.discipline
    ? `Volume ${book.roman} · ${book.discipline}`
    : `Volume ${book.roman}`;
  detailTitle.textContent = book.title;
  detailDeck.textContent = book.deck;
  renderDetailLinks(book);
  detailBinding.textContent = book.binding;
  detailFormat.textContent = book.format;
  detailTheme.textContent = book.theme;
  detailMotif.textContent = book.motif;
}

// Fills the row of link buttons under the description in the side panel.
function renderDetailLinks(book) {
  detailLinks.replaceChildren();
  (book.links || []).forEach((link) => {
    const anchor = document.createElement("a");
    anchor.className = "detail-link";
    anchor.href = link.url;
    if (/^https?:/.test(link.url)) {
      anchor.target = "_blank";
      anchor.rel = "noopener";
    }
    if (link.download) anchor.setAttribute("download", "");
    const icon = ICONS[link.icon];
    if (icon) {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", `0 0 ${icon.size} ${icon.size}`);
      svg.setAttribute("aria-hidden", "true");
      const shape = document.createElementNS("http://www.w3.org/2000/svg", "path");
      shape.setAttribute("d", icon.path);
      shape.setAttribute("fill-rule", "evenodd");
      svg.append(shape);
      anchor.append(svg);
    }
    const label = document.createElement("span");
    label.textContent = link.label;
    anchor.append(label);
    detailLinks.append(anchor);
  });
}

function getSpreadLabels(book) {
  if (book.pages) {
    return [
      "Title page",
      ...[0, 1, 2].map((index) => (
        book.pages[index * 2]?.heading
        || book.pages[index * 2 + 1]?.heading
        || "Pages"
      )),
      book.closingNote ? "A note" : "Colophon"
    ];
  }
  if (book.gallery) {
    return [
      "Title page",
      ...[0, 1, 2].map((index) => book.gallery[index]?.title || "Blank"),
      book.closingNote ? "A note" : "Colophon"
    ];
  }
  return [
    "Title page",
    `${book.chapters[0]} · Plate`,
    `${book.chapters[1]} · Notes`,
    `${book.chapters[2]} · System`,
    "Colophon"
  ];
}

function updatePageControls(announce = false) {
  const book = activeBook?.data || BOOKS[selectedIndex];
  const labels = getSpreadLabels(book);
  const interactionLocked = mode !== "detail" || !readingOpen;
  const previousDisabled = interactionLocked || currentSpread === 0;
  const nextDisabled = interactionLocked || currentSpread === SPREAD_COUNT - 1;

  previousPageButton.disabled = previousDisabled;
  nextPageButton.disabled = nextDisabled;
  pageLabel.textContent = readingOpen ? labels[currentSpread] : "Closed";
  pageCounter.textContent = readingOpen
    ? `${pad(currentSpread + 1)} / ${pad(SPREAD_COUNT)}`
    : "Click book to open";
  toggleBookButton.textContent = readingOpen ? "Close book" : "Open book";
  toggleBookButton.setAttribute("aria-pressed", String(readingOpen));
  detailMicrocopy.textContent = readingOpen
    ? "Drag pages · Drag cover to close · Background to orbit"
    : "Drag cover or click once to open · Background to orbit";
  previousPageButton.setAttribute(
    "aria-label",
    previousDisabled
      ? "Previous sample page"
      : `Previous sample page: ${labels[currentSpread - 1]}`
  );
  nextPageButton.setAttribute(
    "aria-label",
    nextDisabled
      ? "Next sample page"
      : `Next sample page: ${labels[currentSpread + 1]}`
  );

  if (announce && activeBook && readingOpen) {
    liveRegion.textContent = `Page ${currentSpread + 1} of ${SPREAD_COUNT}: ${labels[currentSpread]}.`;
  }
}
