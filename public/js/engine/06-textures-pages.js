"use strict";
// Painted surfaces for paper: endpapers, the inside pages and page edges.

function drawPaperSurface(ctx, width, height, random) {
  ctx.fillStyle = "#e8e1d3";
  ctx.fillRect(0, 0, width, height);

  const paperWash = ctx.createLinearGradient(0, 0, width, height);
  paperWash.addColorStop(0, "rgba(255,255,255,0.22)");
  paperWash.addColorStop(0.42, "rgba(255,255,255,0.035)");
  paperWash.addColorStop(1, "rgba(103,87,64,0.08)");
  ctx.fillStyle = paperWash;
  ctx.fillRect(0, 0, width, height);

  for (let fiber = 0; fiber < 2400; fiber += 1) {
    const x = random() * width;
    const y = random() * height;
    const length = 5 + random() * 34;
    const lightFiber = random() > 0.44;
    ctx.strokeStyle = lightFiber
      ? `rgba(255,255,255,${0.025 + random() * 0.045})`
      : `rgba(92,76,55,${0.018 + random() * 0.035})`;
    ctx.lineWidth = 0.45 + random() * 0.65;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(
      Math.min(width, x + length),
      y + (random() - 0.5) * 2.2
    );
    ctx.stroke();
  }

  for (let fleck = 0; fleck < 1200; fleck += 1) {
    const tone = Math.round(112 + random() * 94);
    ctx.fillStyle = `rgba(${tone},${tone - 5},${tone - 13},${0.016 + random() * 0.025})`;
    const size = 0.5 + random() * 1.1;
    ctx.fillRect(random() * width, random() * height, size, size);
  }
}

function makePaperFaceTexture(book, printed = false) {
  if (!printed && sharedPaperFaceTexture) return sharedPaperFaceTexture;

  const paperCanvas = document.createElement("canvas");
  paperCanvas.width = 768;
  paperCanvas.height = 1152;
  const ctx = paperCanvas.getContext("2d");
  const random = seededRandom(printed
    ? hashSeed(`${book.id}-printed-page`) + book.seed
    : hashSeed("working-volumes-paper-stock"));

  drawPaperSurface(ctx, paperCanvas.width, paperCanvas.height, random);

  if (printed) {
    const ink = new THREE.Color(book.palette.ink);
    const red = Math.round(ink.r * 255);
    const green = Math.round(ink.g * 255);
    const blue = Math.round(ink.b * 255);
    ctx.fillStyle = `rgba(${red},${green},${blue},0.2)`;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.font = '500 15px Inter, "Helvetica Neue", Arial, sans-serif';
    ctx.letterSpacing = "2px";
    ctx.fillText(book.title.toUpperCase(), 84, 98);
    ctx.fillRect(84, 121, 190, 2);

    for (let column = 0; column < 2; column += 1) {
      const left = 84 + column * 316;
      for (let line = 0; line < 34; line += 1) {
        const y = 184 + line * 23;
        const lastInParagraph = line % 7 === 6;
        const lineWidth = lastInParagraph
          ? 108 + random() * 86
          : 190 + random() * 72;
        ctx.globalAlpha = 0.22 + random() * 0.11;
        ctx.fillRect(left, y, lineWidth, 1.45);
      }
    }

    ctx.globalAlpha = 0.32;
    ctx.font = '400 17px "Iowan Old Style", Baskerville, Georgia, serif';
    ctx.fillText(book.roman, paperCanvas.width - 104, paperCanvas.height - 72);
    ctx.globalAlpha = 1;
  }

  const texture = configureCanvasTexture(new THREE.CanvasTexture(paperCanvas));
  if (!printed) sharedPaperFaceTexture = texture;
  return texture;
}

function drawWrappedCanvasText(ctx, text, x, y, maxCharacters, lineHeight, maxLines = 6) {
  const words = text.split(/\s+/);
  let line = "";
  let lineIndex = 0;

  words.forEach((word) => {
    if (lineIndex >= maxLines) return;
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxCharacters && line) {
      ctx.fillText(line, x, y + lineIndex * lineHeight);
      line = word;
      lineIndex += 1;
    } else {
      line = candidate;
    }
  });

  if (line && lineIndex < maxLines) {
    ctx.fillText(line, x, y + lineIndex * lineHeight);
  }
}

function makeEndpaperTexture(book) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 768;
  const ctx = canvas.getContext("2d");
  const random = seededRandom(hashSeed(`${book.id}-endpaper`) + book.seed);
  drawPaperSurface(ctx, canvas.width, canvas.height, random);

  ctx.save();
  ctx.fillStyle = book.color;
  ctx.globalAlpha = 0.14;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = book.foil;
  ctx.lineWidth = 1;
  for (let x = 28; x < canvas.width; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 24; y < canvas.height; y += 48) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 0.42;
  drawMotif(ctx, { ...book, foil: book.palette.inkSoft }, canvas.width, canvas.height);
  ctx.restore();

  const texture = configureCanvasTexture(new THREE.CanvasTexture(canvas), {
    anisotropy: 16
  });
  texture.name = `${book.id}-patterned-endpaper`;
  return texture;
}

// Writes text that wraps at maxWidth. Returns the y position for whatever comes next.
function drawParagraph(ctx, text, x, y, maxWidth, lineHeight, maxY) {
  let line = "";
  String(text).split(/\s+/).forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      if (y <= maxY) ctx.fillText(line, x, y);
      y += lineHeight;
      line = word;
    } else {
      line = candidate;
    }
  });
  if (line && y <= maxY) ctx.fillText(line, x, y);
  return y + lineHeight;
}

function drawPageIcon(ctx, icon, x, y, size) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / icon.size, size / icon.size);
  ctx.fill(new Path2D(icon.path), "evenodd");
  ctx.restore();
}

// One inside page described in content.js: a picture, an art plate, or text.
function drawContentPage(ctx, book, page, logicalWidth, onReady) {
  const left = 54;
  const maxWidth = logicalWidth - 108;
  const bottom = 664;

  if (page.image) {
    drawGalleryPicture(ctx, { image: page.image, title: page.caption || "" }, logicalWidth, onReady);
    return;
  }

  if (page.art) {
    const painter = COVER_PAINTERS[book.coverArt];
    if (!painter) return;
    const plate = { width: 252, height: 378 };
    const x = (logicalWidth - plate.width) / 2;
    const y = 166;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(plate.width / 768, plate.height / 1152);
    painter(ctx, book, 768, 1152);
    ctx.restore();
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 8, y - 8, plate.width + 16, plate.height + 16);
    ctx.globalAlpha = 1;
    return;
  }

  let y = 196;
  if (page.kicker) {
    ctx.globalAlpha = 0.72;
    ctx.font = '500 11px Inter, "Helvetica Neue", Arial, sans-serif';
    ctx.letterSpacing = "2px";
    ctx.fillText(page.kicker.toUpperCase(), left, 150);
  }
  ctx.letterSpacing = "0px";
  if (page.heading) {
    ctx.globalAlpha = 1;
    ctx.font = '400 40px "Iowan Old Style", Baskerville, Georgia, serif';
    y = drawParagraph(ctx, page.heading, left - 2, 208, maxWidth, 46, bottom) + 12;
  }

  ctx.globalAlpha = 0.9;
  ctx.font = '400 21px "Iowan Old Style", Baskerville, Georgia, serif';
  (page.list || []).forEach((item) => {
    const text = typeof item === "string" ? item : item.text;
    const icon = typeof item === "string" ? null : ICONS[item.icon];
    if (y > bottom) return;
    if (icon) drawPageIcon(ctx, icon, left, y - 16, 18);
    else ctx.fillRect(left + 2, y - 9, 6, 6);
    y = drawParagraph(ctx, text, left + (icon ? 30 : 22), y, maxWidth - (icon ? 30 : 22), 29, bottom) + 9;
  });
  if (page.list?.length) y += 10;
  (page.body || []).forEach((paragraph) => {
    y = drawParagraph(ctx, paragraph, left, y, maxWidth, 31, bottom) + 12;
  });

  if (page.fine) {
    ctx.globalAlpha = 0.72;
    ctx.font = '500 11px Inter, "Helvetica Neue", Arial, sans-serif';
    ctx.letterSpacing = "1.2px";
    ctx.fillText(page.fine, left, 696);
  }
  ctx.letterSpacing = "0px";
  ctx.globalAlpha = 1;
}

// Right-hand gallery page: the picture, fitted inside the margins, with its title below.
function drawGalleryPicture(ctx, item, logicalWidth, onReady) {
  const box = { x: 52, y: 88, width: logicalWidth - 104, height: 590 };
  ctx.save();
  ctx.globalAlpha = 0.58;
  ctx.textAlign = "center";
  ctx.font = '500 10px Inter, "Helvetica Neue", Arial, sans-serif';
  ctx.letterSpacing = "1.8px";
  ctx.fillText(item.title.toUpperCase(), logicalWidth / 2, 704);
  ctx.restore();

  const image = new Image();
  image.decoding = "async";
  image.onload = () => {
    const fit = Math.min(box.width / image.naturalWidth, box.height / image.naturalHeight);
    const width = image.naturalWidth * fit;
    const height = image.naturalHeight * fit;
    const x = box.x + (box.width - width) / 2;
    const y = box.y + (box.height - height) / 2;
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.shadowColor = "rgba(40, 28, 18, 0.28)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 3;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x, y, width, height);
    ctx.shadowColor = "transparent";
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image, x, y, width, height);
    ctx.restore();
    onReady();
  };
  image.src = item.image;
}

// Left-hand gallery page: the picture's title and its description.
function drawGalleryDescription(ctx, item, index) {
  ctx.font = '500 11px Inter, "Helvetica Neue", Arial, sans-serif';
  ctx.letterSpacing = "2px";
  ctx.fillText(`DRAWING ${pad(index + 1)}`, 54, 166);
  ctx.font = '400 49px "Iowan Old Style", Baskerville, Georgia, serif';
  ctx.letterSpacing = "0px";
  drawWrappedCanvasText(ctx, item.title, 52, 244, 18, 54, 3);
  if (item.description) {
    ctx.globalAlpha = 0.85;
    ctx.font = '400 20px "Iowan Old Style", Baskerville, Georgia, serif';
    drawWrappedCanvasText(ctx, item.description, 54, 400, 42, 28, 11);
  }
}

function makeInteriorPageTextures(book) {
  const pageCount = 8;
  // Near-black ink on every inside page, so the text is easy to read.
  const ink = "#15120f";

  return Array.from({ length: pageCount }, (_, pageIndex) => {
    const canvas = document.createElement("canvas");
    const logicalWidth = 512;
    const logicalHeight = 768;
    const galleryIndex = Math.floor((pageIndex - 1) / 2);
    const galleryItem = pageIndex >= 1 && pageIndex <= 6
      ? book.gallery?.[galleryIndex]
      : null;
    const contentPage = book.pages && pageIndex >= 1 && pageIndex <= 6
      ? book.pages[pageIndex - 1] || {}
      : null;
    // Pictures are drawn sharpest, real text next, and the original sample pages least.
    const isPicturePage = contentPage?.image || (galleryItem && pageIndex % 2 === 0);
    const pageScale = isPicturePage
      ? 2
      : book.pages || book.gallery
        ? (viewWidth < 820 ? 1 : 1.5)
        : 0.75;
    canvas.width = logicalWidth * pageScale;
    canvas.height = logicalHeight * pageScale;
    const ctx = canvas.getContext("2d");
    ctx.scale(pageScale, pageScale);
    const random = seededRandom(hashSeed(`${book.id}-leaf-${pageIndex}`) + book.seed);
    drawPaperSurface(ctx, logicalWidth, logicalHeight, random);
    ctx.fillStyle = ink;
    ctx.strokeStyle = ink;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    ctx.globalAlpha = 0.88;
    ctx.font = '500 10px Inter, "Helvetica Neue", Arial, sans-serif';
    ctx.letterSpacing = "1.8px";
    ctx.fillText(`${SITE.mark}  /  ${book.roman}`, 48, 48);
    ctx.textAlign = "right";
    ctx.fillText(pad(pageIndex + 1), logicalWidth - 48, 48);
    ctx.textAlign = "left";
    ctx.fillRect(48, 64, logicalWidth - 96, 1);
    ctx.globalAlpha = 1;

    if (contentPage) {
      drawContentPage(ctx, book, contentPage, logicalWidth, () => {
        texture.needsUpdate = true;
        requestFrame();
      });
    } else if (galleryItem && pageIndex % 2 === 0) {
      drawGalleryPicture(ctx, galleryItem, logicalWidth, () => {
        texture.needsUpdate = true;
        requestFrame();
      });
    } else if (galleryItem) {
      drawGalleryDescription(ctx, galleryItem, galleryIndex);
    } else if (pageIndex === 0) {
      ctx.font = '500 12px Inter, "Helvetica Neue", Arial, sans-serif';
      ctx.letterSpacing = "2.3px";
      ctx.fillText(book.discipline.toUpperCase(), 54, 174);
      ctx.font = `400 ${book.title.length > 10 ? 48 : 58}px "Iowan Old Style", Baskerville, Georgia, serif`;
      ctx.letterSpacing = "0px";
      drawWrappedCanvasText(ctx, book.title, 52, 246, 18, 58, 2);
      ctx.globalAlpha = 0.88;
      ctx.font = '400 22px "Iowan Old Style", Baskerville, Georgia, serif';
      drawWrappedCanvasText(ctx, book.note, 54, 462, 36, 30, 4);
    } else if (pageIndex === 1 || pageIndex === 3) {
      const chapterIndex = pageIndex === 1 ? 0 : 1;
      ctx.font = '500 11px Inter, "Helvetica Neue", Arial, sans-serif';
      ctx.letterSpacing = "2px";
      ctx.fillText(`CHAPTER ${pad(chapterIndex + 1)}`, 54, 166);
      ctx.font = '400 49px "Iowan Old Style", Baskerville, Georgia, serif';
      ctx.letterSpacing = "0px";
      drawWrappedCanvasText(ctx, book.chapters[chapterIndex], 52, 244, 18, 54, 3);
      ctx.globalAlpha = 0.88;
      ctx.font = '400 20px "Iowan Old Style", Baskerville, Georgia, serif';
      drawWrappedCanvasText(
        ctx,
        chapterIndex === 0 ? book.note : book.deck,
        54,
        438,
        42,
        28,
        6
      );
    } else if (pageIndex === 2) {
      ctx.font = '500 11px Inter, "Helvetica Neue", Arial, sans-serif';
      ctx.letterSpacing = "2px";
      ctx.fillText("PLATE 01  /  SYSTEM MOTIF", 54, 146);
      ctx.save();
      ctx.globalAlpha = 0.58;
      drawMotif(ctx, { ...book, foil: ink }, logicalWidth, logicalHeight * 0.92);
      ctx.restore();
      ctx.globalAlpha = 0.88;
      ctx.font = '400 17px "Iowan Old Style", Baskerville, Georgia, serif';
      drawWrappedCanvasText(ctx, book.theme, 54, 650, 44, 24, 3);
    } else if (pageIndex === 4) {
      ctx.font = '500 11px Inter, "Helvetica Neue", Arial, sans-serif';
      ctx.letterSpacing = "2px";
      ctx.fillText(`NOTES  /  ${book.chapters[1].toUpperCase()}`, 54, 138);
      ctx.globalAlpha = 0.44;
      for (let column = 0; column < 2; column += 1) {
        const left = 54 + column * 214;
        for (let line = 0; line < 24; line += 1) {
          const width = line % 7 === 6 ? 72 + random() * 54 : 138 + random() * 44;
          ctx.fillRect(left, 190 + line * 18, width, 1.25);
        }
      }
      ctx.globalAlpha = 0.78;
      ctx.strokeRect(54, 654, 404, 54);
      ctx.font = '500 10px Inter, "Helvetica Neue", Arial, sans-serif';
      ctx.letterSpacing = "1.4px";
      ctx.fillText(book.motif.toUpperCase(), 70, 686);
    } else if (pageIndex === 5) {
      ctx.font = '500 11px Inter, "Helvetica Neue", Arial, sans-serif';
      ctx.letterSpacing = "2px";
      ctx.fillText("CHAPTER 03", 54, 166);
      ctx.font = '400 49px "Iowan Old Style", Baskerville, Georgia, serif';
      ctx.letterSpacing = "0px";
      drawWrappedCanvasText(ctx, book.chapters[2], 52, 244, 18, 54, 3);
      ctx.globalAlpha = 0.88;
      ctx.font = '400 20px "Iowan Old Style", Baskerville, Georgia, serif';
      drawWrappedCanvasText(ctx, book.deck, 54, 438, 42, 28, 6);
    } else if (pageIndex === 6) {
      ctx.font = '500 11px Inter, "Helvetica Neue", Arial, sans-serif';
      ctx.letterSpacing = "2px";
      ctx.fillText("PLATE 02  /  TECHNICAL SYSTEM", 54, 146);
      ctx.save();
      ctx.translate(logicalWidth * 0.5, 380);
      ctx.globalAlpha = 0.55;
      for (let ring = 0; ring < 5; ring += 1) {
        const radius = 38 + ring * 34;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
      for (let spoke = 0; spoke < 8; spoke += 1) {
        const angle = spoke * Math.PI * 0.25;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * 36, Math.sin(angle) * 36);
        ctx.lineTo(Math.cos(angle) * 176, Math.sin(angle) * 176);
        ctx.stroke();
      }
      ctx.restore();
      ctx.globalAlpha = 0.88;
      ctx.font = '400 17px "Iowan Old Style", Baskerville, Georgia, serif';
      drawWrappedCanvasText(ctx, book.theme, 54, 650, 44, 24, 3);
    } else if (book.closingNote) {
      ctx.globalAlpha = 0.82;
      ctx.font = '400 27px "Iowan Old Style", Baskerville, Georgia, serif';
      ctx.letterSpacing = "0px";
      drawWrappedCanvasText(ctx, book.closingNote, 54, 236, 30, 38, 10);
    } else {
      ctx.font = '500 11px Inter, "Helvetica Neue", Arial, sans-serif';
      ctx.letterSpacing = "2px";
      ctx.fillText("COLOPHON", 54, 164);
      ctx.font = '400 32px "Iowan Old Style", Baskerville, Georgia, serif';
      ctx.letterSpacing = "0px";
      ctx.fillText(book.title, 54, 230);
      ctx.globalAlpha = 0.88;
      ctx.font = '400 18px "Iowan Old Style", Baskerville, Georgia, serif';
      drawWrappedCanvasText(
        ctx,
        `${book.binding}. ${book.format}. ${SITE.colophon}`,
        54,
        306,
        44,
        28,
        7
      );
      ctx.globalAlpha = 0.74;
      ctx.font = '500 10px Inter, "Helvetica Neue", Arial, sans-serif';
      ctx.letterSpacing = "1.8px";
      ctx.fillText(`SPECIMEN ${book.roman} / ${book.seed}  ·  IMAGINED EDITION`, 54, 676);
    }

    ctx.globalAlpha = 0.62;
    ctx.fillRect(48, logicalHeight - 48, logicalWidth - 96, 1);
    ctx.globalAlpha = 1;
    const texture = configureCanvasTexture(new THREE.CanvasTexture(canvas), {
      anisotropy: 16
    });
    texture.name = `${book.id}-interior-page-${pageIndex + 1}`;
    return texture;
  });
}

function makeContactShadowTexture() {
  if (sharedContactShadowTexture) return sharedContactShadowTexture;
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(256, 64, 10, 256, 64, 254);
  gradient.addColorStop(0, "rgba(255,255,255,0.95)");
  gradient.addColorStop(0.38, "rgba(255,255,255,0.62)");
  gradient.addColorStop(0.72, "rgba(255,255,255,0.18)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  sharedContactShadowTexture = configureCanvasTexture(
    new THREE.CanvasTexture(canvas),
    { color: false, anisotropy: 8 }
  );
  sharedContactShadowTexture.name = "soft-contact-shadow";
  return sharedContactShadowTexture;
}

function makePageEdgeTextures(book) {
  if (sharedPageEdgeTextures) return sharedPageEdgeTextures;

  const makeEdgeTexture = (width, height, suffix) => {
    const edgeCanvas = document.createElement("canvas");
    edgeCanvas.width = width;
    edgeCanvas.height = height;
    const ctx = edgeCanvas.getContext("2d");
    const random = seededRandom(
      hashSeed(`${book.id}-${suffix}`) + book.seed
    );

    ctx.fillStyle = "#dcd5c7";
    ctx.fillRect(0, 0, width, height);

    const pageStep = suffix === "fore-edge" ? 2 : 1.35;
    for (let y = 0; y < height; y += pageStep) {
      const shade = Math.round(106 + random() * 74);
      const signature = random() > 0.965;
      ctx.strokeStyle = `rgba(${shade},${shade - 3},${shade - 9},${signature ? 0.34 : 0.13 + random() * 0.13})`;
      ctx.lineWidth = signature ? 1.05 : 0.42 + random() * 0.42;
      ctx.beginPath();
      ctx.moveTo(0, y + (random() - 0.5) * 0.5);
      ctx.bezierCurveTo(
        width * 0.3,
        y + (random() - 0.5) * 0.9,
        width * 0.72,
        y + (random() - 0.5) * 0.9,
        width,
        y + (random() - 0.5) * 0.5
      );
      ctx.stroke();
    }

    const edgeShade = ctx.createLinearGradient(0, 0, width, 0);
    edgeShade.addColorStop(0, "rgba(58,48,35,0.18)");
    edgeShade.addColorStop(0.035, "rgba(255,255,255,0.04)");
    edgeShade.addColorStop(0.86, "rgba(255,255,255,0)");
    edgeShade.addColorStop(1, "rgba(58,48,35,0.12)");
    ctx.fillStyle = edgeShade;
    ctx.fillRect(0, 0, width, height);

    return configureCanvasTexture(new THREE.CanvasTexture(edgeCanvas));
  };

  sharedPageEdgeTextures = {
    fore: makeEdgeTexture(512, 2048, "fore-edge"),
    headTail: makeEdgeTexture(2048, 384, "head-tail-edge")
  };
  return sharedPageEdgeTextures;
}
