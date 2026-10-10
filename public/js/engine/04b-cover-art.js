"use strict";
// Front-cover pictures painted in code. A book picks one with coverArt: "name" in content.js.
// Every painter keeps the lower fifth of the cover calm, because the foil title is stamped there.

function coverColors(book) {
  const mix = (from, to, amount) => (
    `#${new THREE.Color(from).lerp(new THREE.Color(to), amount).getHexString()}`
  );
  return {
    base: book.color,
    foil: book.foil,
    pale: book.palette.paperPale,
    deep: book.palette.paperDeep,
    dark: book.palette.shelfDark,
    mix
  };
}

// Cloth grain and edge shading, as on the original covers.
function finishCover(ctx, random, width, height) {
  for (let line = 0; line < 1250; line += 1) {
    const x = random() * width;
    const y = random() * height;
    ctx.strokeStyle = random() > 0.5 ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)";
    ctx.lineWidth = 0.6 + random() * 0.8;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 4 + random() * 22, y + (random() - 0.5) * 2);
    ctx.stroke();
  }
  const edgeShade = ctx.createLinearGradient(0, 0, width, 0);
  edgeShade.addColorStop(0, "rgba(0,0,0,0.16)");
  edgeShade.addColorStop(0.055, "rgba(255,255,255,0.015)");
  edgeShade.addColorStop(0.93, "rgba(255,255,255,0)");
  edgeShade.addColorStop(1, "rgba(0,0,0,0.1)");
  ctx.fillStyle = edgeShade;
  ctx.fillRect(0, 0, width, height);
}

function beginCover(ctx, book, width, height, name) {
  const random = seededRandom(hashSeed(`${book.id}-${name}-cover`) + book.seed);
  ctx.fillStyle = book.color;
  ctx.fillRect(0, 0, width, height);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, width, height);
  ctx.clip();
  return random;
}

function endCover(ctx, random, width, height) {
  ctx.globalAlpha = 1;
  ctx.restore();
  finishCover(ctx, random, width, height);
}

function fillPolygon(ctx, fill, points) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  points.forEach(([x, y], index) => {
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fill();
}

// Hobbies: overlapping shapes in the book's own colors.
function drawAbstractCover(ctx, book, width, height) {
  const random = seededRandom(hashSeed(`${book.id}-abstract-cover`) + book.seed);
  const deep = book.palette.paperDeep;
  const pale = book.palette.paperPale;
  const dark = book.palette.shelfDark;
  const plum = `#${new THREE.Color(book.color).lerp(new THREE.Color(0x2b1238), 0.72).getHexString()}`;

  ctx.fillStyle = book.color;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, width, height);
  ctx.clip();

  // Large sun and the plum form that cuts across it.
  ctx.fillStyle = pale;
  ctx.beginPath();
  ctx.arc(width * 0.64, height * 0.3, width * 0.33, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = plum;
  ctx.beginPath();
  ctx.arc(width * 0.2, height * 0.46, width * 0.42, -Math.PI * 0.5, Math.PI * 0.5);
  ctx.fill();
  ctx.fillStyle = book.foil;
  ctx.beginPath();
  ctx.arc(width * 0.2, height * 0.46, width * 0.21, -Math.PI * 0.5, Math.PI * 0.5);
  ctx.fill();

  // Flowing bands across the middle.
  [[deep, 0.56, 0.9], [book.foil, 0.615, 0.85], [pale, 0.665, 0.92], [plum, 0.715, 1]].forEach(([fill, top, alpha], band) => {
    const y = height * top;
    const swing = height * (0.035 + band * 0.006);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(-10, y);
    ctx.bezierCurveTo(width * 0.28, y - swing * 2.2, width * 0.52, y + swing * 2.4, width + 10, y - swing);
    ctx.lineTo(width + 10, y + height * 0.075 - swing);
    ctx.bezierCurveTo(width * 0.55, y + height * 0.075 + swing * 2.2, width * 0.3, y + height * 0.06 - swing * 1.8, -10, y + height * 0.07);
    ctx.closePath();
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // Fine pencil-like rings and a scatter of dots.
  ctx.strokeStyle = dark;
  ctx.lineWidth = 1.6;
  for (let ring = 0; ring < 9; ring += 1) {
    ctx.globalAlpha = 0.5 - ring * 0.04;
    ctx.beginPath();
    ctx.arc(width * 0.64, height * 0.3, width * (0.06 + ring * 0.03), Math.PI * 0.9, Math.PI * 1.95);
    ctx.stroke();
  }
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.arc(width * 0.64, height * 0.3, width * 0.035, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = pale;
  for (let dot = 0; dot < 16; dot += 1) {
    ctx.globalAlpha = 0.55 + random() * 0.4;
    ctx.beginPath();
    ctx.arc(
      width * (0.1 + (dot % 4) * 0.055),
      height * (0.17 + Math.floor(dot / 4) * 0.036),
      3 + random() * 2.5,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  finishCover(ctx, random, width, height);
}

// About Me: a sun coming up over a horizon.
function drawSunriseCover(ctx, book, width, height) {
  const { foil, pale, deep, mix } = coverColors(book);
  const random = beginCover(ctx, book, width, height, "sunrise");
  const centerX = width * 0.5;
  const horizon = height * 0.56;

  ctx.fillStyle = pale;
  for (let star = 0; star < 26; star += 1) {
    ctx.globalAlpha = 0.25 + random() * 0.5;
    ctx.beginPath();
    ctx.arc(random() * width, height * (0.1 + random() * 0.3), 1.2 + random() * 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = pale;
  ctx.lineWidth = 1.5;
  for (let ring = 0; ring < 7; ring += 1) {
    ctx.globalAlpha = 0.3 - ring * 0.035;
    ctx.beginPath();
    ctx.arc(centerX, horizon, width * (0.33 + ring * 0.055), Math.PI, Math.PI * 2);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  ctx.fillStyle = foil;
  ctx.beginPath();
  ctx.arc(centerX, horizon, width * 0.27, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = mix(foil, pale, 0.55);
  ctx.beginPath();
  ctx.arc(centerX, horizon, width * 0.15, Math.PI, Math.PI * 2);
  ctx.fill();

  // Land below the horizon, then the sun's reflection on it.
  ctx.fillStyle = deep;
  ctx.fillRect(0, horizon, width, height * 0.19);
  ctx.fillStyle = pale;
  ctx.fillRect(0, horizon - 2, width, 4);
  [[0.5, 0.9], [0.4, 0.7], [0.29, 0.52], [0.19, 0.36], [0.1, 0.22]].forEach(([span, alpha], bar) => {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = bar % 2 ? pale : foil;
    const barWidth = width * span;
    ctx.fillRect(centerX - barWidth / 2, horizon + height * (0.026 + bar * 0.031), barWidth, height * 0.012);
  });

  endCover(ctx, random, width, height);
}

// Projects: building blocks stacked on a drafting grid.
function drawBlocksCover(ctx, book, width, height) {
  const { foil, pale, deep, mix } = coverColors(book);
  const random = beginCover(ctx, book, width, height, "blocks");

  ctx.strokeStyle = deep;
  ctx.lineWidth = 1.2;
  ctx.globalAlpha = 0.22;
  for (let x = width * 0.1; x <= width * 0.9 + 1; x += width * 0.1) {
    ctx.beginPath();
    ctx.moveTo(x, height * 0.13);
    ctx.lineTo(x, height * 0.75);
    ctx.stroke();
  }
  for (let y = height * 0.13; y <= height * 0.75 + 1; y += width * 0.1) {
    ctx.beginPath();
    ctx.moveTo(width * 0.1, y);
    ctx.lineTo(width * 0.9, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  const size = width * 0.15;
  const cube = (centerX, centerY, top, left, right) => {
    const dx = size * 0.866;
    fillPolygon(ctx, top, [[centerX, centerY - size], [centerX + dx, centerY - size / 2], [centerX, centerY], [centerX - dx, centerY - size / 2]]);
    fillPolygon(ctx, left, [[centerX - dx, centerY - size / 2], [centerX, centerY], [centerX, centerY + size], [centerX - dx, centerY + size / 2]]);
    fillPolygon(ctx, right, [[centerX + dx, centerY - size / 2], [centerX, centerY], [centerX, centerY + size], [centerX + dx, centerY + size / 2]]);
  };
  const baseY = height * 0.58;
  cube(width * 0.5 - size * 0.866, baseY, pale, foil, deep);
  cube(width * 0.5 + size * 0.866, baseY, pale, mix(foil, pale, 0.35), mix(deep, book.color, 0.35));
  cube(width * 0.5, baseY - size * 1.5, mix(pale, foil, 0.25), foil, deep);

  // A loose block waiting to be placed, and a few measuring marks.
  ctx.globalAlpha = 0.9;
  cube(width * 0.8, height * 0.22, pale, foil, deep);
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = pale;
  [[0.2, 0.2], [0.2, 0.28], [0.28, 0.2]].forEach(([x, y]) => {
    ctx.fillRect(width * x - 9, height * y - 1.5, 18, 3);
    ctx.fillRect(width * x - 1.5, height * y - 9, 3, 18);
  });

  endCover(ctx, random, width, height);
}

// Experience: a marked path up a mountain with a flag on top.
function drawPeaksCover(ctx, book, width, height) {
  const { foil, pale, dark, mix } = coverColors(book);
  const random = beginCover(ctx, book, width, height, "peaks");
  const ground = height * 0.76;
  const peak = [width * 0.44, height * 0.3];

  ctx.fillStyle = pale;
  ctx.beginPath();
  ctx.arc(width * 0.72, height * 0.25, width * 0.13, 0, Math.PI * 2);
  ctx.fill();

  fillPolygon(ctx, mix(book.color, dark, 0.3), [[-10, ground], [width * 0.2, height * 0.5], [width * 0.36, height * 0.62], [width * 0.76, height * 0.4], [width + 10, height * 0.66], [width + 10, ground]]);
  fillPolygon(ctx, foil, [[width * 0.03, ground], peak, [width * 0.88, ground]]);
  fillPolygon(ctx, mix(foil, book.color, 0.28), [peak, [width * 0.88, ground], [width * 0.5, ground]]);
  fillPolygon(ctx, pale, [peak, [width * 0.52, height * 0.395], [width * 0.465, height * 0.375], [width * 0.43, height * 0.41], [width * 0.385, height * 0.38], [width * 0.36, height * 0.395]]);

  ctx.strokeStyle = pale;
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.setLineDash([16, 15]);
  ctx.beginPath();
  ctx.moveTo(width * 0.2, ground);
  ctx.bezierCurveTo(width * 0.46, height * 0.7, width * 0.22, height * 0.58, width * 0.4, height * 0.52);
  ctx.bezierCurveTo(width * 0.52, height * 0.48, width * 0.38, height * 0.44, width * 0.44, height * 0.42);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.strokeStyle = foil;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(peak[0], peak[1] + 4);
  ctx.lineTo(peak[0], peak[1] - height * 0.075);
  ctx.stroke();
  fillPolygon(ctx, pale, [[peak[0], peak[1] - height * 0.075], [peak[0] + width * 0.1, peak[1] - height * 0.056], [peak[0], peak[1] - height * 0.036]]);
  ctx.fillStyle = foil;
  ctx.fillRect(0, ground - 2, width, 5);

  endCover(ctx, random, width, height);
}

// Resume: a single written page with a seal.
function drawSheetCover(ctx, book, width, height) {
  const { pale, deep, mix } = coverColors(book);
  const random = beginCover(ctx, book, width, height, "sheet");
  const sheet = { x: width * 0.2, y: height * 0.15, width: width * 0.6, height: height * 0.58 };
  const centerX = sheet.x + sheet.width / 2;
  const centerY = sheet.y + sheet.height / 2;
  const rule = mix(book.color, pale, 0.45);

  ctx.translate(centerX, centerY);
  ctx.rotate(-0.09);
  ctx.fillStyle = deep;
  ctx.fillRect(-sheet.width / 2 + 10, -sheet.height / 2 + 14, sheet.width, sheet.height);
  ctx.rotate(0.13);
  ctx.fillStyle = pale;
  ctx.fillRect(-sheet.width / 2, -sheet.height / 2, sheet.width, sheet.height);

  const left = -sheet.width / 2 + sheet.width * 0.1;
  const top = -sheet.height / 2 + sheet.height * 0.09;
  const inner = sheet.width * 0.8;
  ctx.fillStyle = book.color;
  ctx.beginPath();
  ctx.arc(left + 34, top + 34, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(left + 88, top + 8, inner * 0.52, 16);
  ctx.fillStyle = rule;
  ctx.fillRect(left + 88, top + 40, inner * 0.36, 9);

  [1, 0.86, 0.94, 0.6, 0, 1, 0.9, 0.72, 0, 0.96, 0.82, 0.5].forEach((span, line) => {
    if (!span) return;
    ctx.fillStyle = line === 5 || line === 9 ? book.color : rule;
    ctx.fillRect(left, top + 112 + line * 34, inner * span * (line === 5 || line === 9 ? 0.4 : 1), 9);
  });

  const sealX = sheet.width / 2 - sheet.width * 0.2;
  const sealY = sheet.height / 2 - sheet.height * 0.13;
  ctx.fillStyle = book.color;
  ctx.beginPath();
  ctx.arc(sealX, sealY, 44, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = pale;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(sealX, sealY, 31, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(sealX - 14, sealY + 1);
  ctx.lineTo(sealX - 4, sealY + 11);
  ctx.lineTo(sealX + 15, sealY - 10);
  ctx.stroke();

  endCover(ctx, random, width, height);
}

// Origins: the growth rings of a tree.
function drawRingsCover(ctx, book, width, height) {
  const { foil, pale, deep, mix } = coverColors(book);
  const random = beginCover(ctx, book, width, height, "rings");
  const centerX = width * 0.5;
  const centerY = height * 0.43;
  const ringPath = (radius, phase) => {
    ctx.beginPath();
    for (let step = 0; step <= 72; step += 1) {
      const angle = (step / 72) * Math.PI * 2;
      const wobble = 1 + Math.sin(angle * 3 + phase) * 0.035 + Math.sin(angle * 5 + phase * 1.7) * 0.022;
      const x = centerX + Math.cos(angle) * radius * wobble;
      const y = centerY + Math.sin(angle) * radius * wobble * 1.04;
      if (step === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  };

  ctx.fillStyle = deep;
  ringPath(width * 0.42, 0.4);
  ctx.fill();
  ctx.fillStyle = mix(book.color, pale, 0.72);
  ringPath(width * 0.39, 0.4);
  ctx.fill();

  for (let ring = 0; ring < 11; ring += 1) {
    const radius = width * (0.035 + ring * 0.033);
    ctx.strokeStyle = ring % 3 === 2 ? foil : mix(book.color, deep, 0.35);
    ctx.globalAlpha = ring % 3 === 2 ? 0.95 : 0.8;
    ctx.lineWidth = ring % 3 === 2 ? 7 : 3 + random() * 2.5;
    ringPath(radius, 0.4 + ring * 0.21);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = deep;
  ringPath(width * 0.018, 0);
  ctx.fill();

  // A crack running out from the heart, as on a real slice of wood.
  ctx.strokeStyle = deep;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(centerX + width * 0.03, centerY - width * 0.02);
  ctx.lineTo(centerX + width * 0.16, centerY - width * 0.13);
  ctx.lineTo(centerX + width * 0.2, centerY - width * 0.24);
  ctx.lineTo(centerX + width * 0.3, centerY - width * 0.3);
  ctx.stroke();

  endCover(ctx, random, width, height);
}

// Contact: a paper plane leaving a looping trail.
function drawPlaneCover(ctx, book, width, height) {
  const { pale, deep, mix } = coverColors(book);
  const random = beginCover(ctx, book, width, height, "plane");
  const ink = mix(book.color, 0x0b1c26, 0.82);

  ctx.fillStyle = mix(book.color, pale, 0.42);
  [[0.2, 0.2, 0.09], [0.31, 0.215, 0.07], [0.72, 0.66, 0.1], [0.84, 0.675, 0.075]].forEach(([x, y, radius]) => {
    ctx.beginPath();
    ctx.arc(width * x, height * y, width * radius, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.strokeStyle = ink;
  ctx.lineWidth = 4.5;
  ctx.lineCap = "round";
  ctx.setLineDash([15, 14]);
  ctx.beginPath();
  ctx.moveTo(width * 0.08, height * 0.72);
  ctx.bezierCurveTo(width * 0.34, height * 0.74, width * 0.5, height * 0.62, width * 0.36, height * 0.55);
  ctx.bezierCurveTo(width * 0.22, height * 0.49, width * 0.16, height * 0.63, width * 0.32, height * 0.64);
  ctx.bezierCurveTo(width * 0.46, height * 0.65, width * 0.5, height * 0.56, width * 0.5, height * 0.5);
  ctx.stroke();
  ctx.setLineDash([]);

  const nose = [width * 0.86, height * 0.2];
  const fold = [width * 0.48, height * 0.44];
  fillPolygon(ctx, mix(pale, deep, 0.5), [nose, fold, [width * 0.5, height * 0.56]]);
  fillPolygon(ctx, mix(pale, deep, 0.24), [nose, [width * 0.5, height * 0.56], [width * 0.6, height * 0.5]]);
  fillPolygon(ctx, pale, [nose, [width * 0.16, height * 0.36], fold]);
  fillPolygon(ctx, mix(pale, deep, 0.12), [nose, [width * 0.6, height * 0.5], [width * 0.7, height * 0.58]]);

  endCover(ctx, random, width, height);
}

const COVER_PAINTERS = {
  abstract: drawAbstractCover,
  sunrise: drawSunriseCover,
  blocks: drawBlocksCover,
  peaks: drawPeaksCover,
  sheet: drawSheetCover,
  rings: drawRingsCover,
  plane: drawPlaneCover
};
