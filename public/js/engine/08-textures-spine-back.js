"use strict";
// Painted surfaces for the spine and back cover.

function makeSpineTexture(book) {
  const spineCanvas = document.createElement("canvas");
  spineCanvas.width = 384;
  spineCanvas.height = 1536;
  const ctx = spineCanvas.getContext("2d");
  const random = seededRandom(hashSeed(`${book.id}-spine-cloth`) + book.seed);
  ctx.fillStyle = book.color;
  ctx.fillRect(0, 0, spineCanvas.width, spineCanvas.height);

  const shade = ctx.createLinearGradient(0, 0, spineCanvas.width, 0);
  shade.addColorStop(0, "rgba(0,0,0,0.2)");
  shade.addColorStop(0.14, "rgba(255,255,255,0.055)");
  shade.addColorStop(0.62, "rgba(255,255,255,0.012)");
  shade.addColorStop(1, "rgba(0,0,0,0.16)");
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, spineCanvas.width, spineCanvas.height);

  for (let thread = 0; thread < 1900; thread += 1) {
    const x = random() * spineCanvas.width;
    const y = random() * spineCanvas.height;
    const vertical = random() > 0.42;
    ctx.strokeStyle = random() > 0.5
      ? `rgba(255,255,255,${0.018 + random() * 0.038})`
      : `rgba(0,0,0,${0.018 + random() * 0.032})`;
    ctx.lineWidth = 0.45 + random() * 0.7;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(
      vertical ? x + (random() - 0.5) * 1.2 : x + 8 + random() * 28,
      vertical ? y + 8 + random() * 34 : y + (random() - 0.5) * 1.2
    );
    ctx.stroke();
  }

  const bottomShade = ctx.createLinearGradient(
    0,
    spineCanvas.height * 0.82,
    0,
    spineCanvas.height
  );
  bottomShade.addColorStop(0, "rgba(0,0,0,0)");
  bottomShade.addColorStop(1, "rgba(0,0,0,0.12)");
  ctx.fillStyle = bottomShade;
  ctx.fillRect(0, 0, spineCanvas.width, spineCanvas.height);

  return configureCanvasTexture(
    new THREE.CanvasTexture(spineCanvas),
    { anisotropy: 16 }
  );
}

function makeSpineFoilTexture(book) {
  const foilCanvas = document.createElement("canvas");
  foilCanvas.width = 384;
  foilCanvas.height = 1536;
  const ctx = foilCanvas.getContext("2d");

  ctx.clearRect(0, 0, foilCanvas.width, foilCanvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2.4;
  ctx.strokeRect(34, 38, foilCanvas.width - 68, foilCanvas.height - 76);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = '500 24px Inter, "Helvetica Neue", Arial, sans-serif';
  ctx.letterSpacing = "5px";
  ctx.fillText(book.roman, foilCanvas.width * 0.5, 118);

  ctx.save();
  ctx.translate(foilCanvas.width * 0.5, foilCanvas.height * 0.5);
  ctx.rotate(Math.PI / 2);
  ctx.font = `400 ${book.title.length > 10 ? 58 : 68}px "Iowan Old Style", Baskerville, Georgia, serif`;
  ctx.letterSpacing = "0px";
  ctx.fillText(book.title, 0, 0);
  ctx.restore();

  ctx.beginPath();
  ctx.arc(foilCanvas.width * 0.5, foilCanvas.height - 120, 24, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(foilCanvas.width * 0.5 - 24, foilCanvas.height - 120);
  ctx.lineTo(foilCanvas.width * 0.5 + 24, foilCanvas.height - 120);
  ctx.stroke();

  return configureCanvasTexture(new THREE.CanvasTexture(foilCanvas));
}

function makeBackCoverTexture(book) {
  const backCanvas = document.createElement("canvas");
  backCanvas.width = 768;
  backCanvas.height = 1152;
  const ctx = backCanvas.getContext("2d");
  const random = seededRandom(hashSeed(`${book.id}-back-cloth`) + book.seed);

  ctx.fillStyle = book.color;
  ctx.fillRect(0, 0, backCanvas.width, backCanvas.height);

  const edgeShade = ctx.createLinearGradient(0, 0, backCanvas.width, 0);
  edgeShade.addColorStop(0, "rgba(0,0,0,0.15)");
  edgeShade.addColorStop(0.05, "rgba(255,255,255,0.028)");
  edgeShade.addColorStop(0.84, "rgba(255,255,255,0)");
  edgeShade.addColorStop(1, "rgba(0,0,0,0.11)");
  ctx.fillStyle = edgeShade;
  ctx.fillRect(0, 0, backCanvas.width, backCanvas.height);

  for (let thread = 0; thread < 2600; thread += 1) {
    const x = random() * backCanvas.width;
    const y = random() * backCanvas.height;
    const length = 5 + random() * 30;
    ctx.strokeStyle = random() > 0.5
      ? `rgba(255,255,255,${0.018 + random() * 0.03})`
      : `rgba(0,0,0,${0.016 + random() * 0.028})`;
    ctx.lineWidth = 0.45 + random() * 0.65;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + length, y + (random() - 0.5) * 1.5);
    ctx.stroke();
  }

  const vignette = ctx.createRadialGradient(
    backCanvas.width * 0.62,
    backCanvas.height * 0.38,
    20,
    backCanvas.width * 0.62,
    backCanvas.height * 0.38,
    backCanvas.width * 0.75
  );
  vignette.addColorStop(0, "rgba(255,255,255,0.03)");
  vignette.addColorStop(1, "rgba(0,0,0,0.09)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, backCanvas.width, backCanvas.height);

  return configureCanvasTexture(new THREE.CanvasTexture(backCanvas));
}

function makeBackFoilTexture(book) {
  const foilCanvas = document.createElement("canvas");
  foilCanvas.width = 768;
  foilCanvas.height = 1152;
  const ctx = foilCanvas.getContext("2d");

  ctx.clearRect(0, 0, foilCanvas.width, foilCanvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  ctx.font = '500 16px Inter, "Helvetica Neue", Arial, sans-serif';
  ctx.letterSpacing = "3px";
  ctx.fillText(`${SITE.mark}  /  ${book.roman}`, 68, 82);
  ctx.globalAlpha = 0.72;
  ctx.fillRect(68, 108, 176, 2);
  ctx.globalAlpha = 1;

  ctx.lineWidth = 1.5;
  for (let ring = 0; ring < 5; ring += 1) {
    ctx.globalAlpha = 0.24 - ring * 0.032;
    ctx.beginPath();
    ctx.arc(548, 374, 74 + ring * 38, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.moveTo(348, 374);
  ctx.lineTo(704, 374);
  ctx.moveTo(548, 174);
  ctx.lineTo(548, 574);
  ctx.stroke();

  ctx.font = `400 ${book.title.length > 10 ? 52 : 62}px "Iowan Old Style", Baskerville, Georgia, serif`;
  ctx.letterSpacing = "0px";
  ctx.fillText(book.title, 68, 956);
  ctx.font = '500 15px Inter, "Helvetica Neue", Arial, sans-serif';
  ctx.letterSpacing = "2.6px";
  ctx.fillText(book.discipline.toUpperCase(), 70, 1004);
  ctx.globalAlpha = 0.68;
  ctx.fillRect(68, 1040, 632, 1.5);
  ctx.globalAlpha = 1;
  ctx.textAlign = "right";
  ctx.fillText("AN IMAGINED EDITION", 700, 1080);

  return configureCanvasTexture(new THREE.CanvasTexture(foilCanvas));
}
