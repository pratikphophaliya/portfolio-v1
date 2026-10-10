"use strict";
// Painted surfaces for the front cover: art, foil lettering and cloth weave.

let sharedPaperFaceTexture = null;
let sharedPageEdgeTextures = null;
let sharedContactShadowTexture = null;

function configureCanvasTexture(texture, {
  color = true,
  anisotropy = 16
} = {}) {
  if (color) texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(
    anisotropy,
    renderer.capabilities.getMaxAnisotropy()
  );
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

function makeCoverTexture(book) {
  const canvasTexture = document.createElement("canvas");
  canvasTexture.width = 768;
  canvasTexture.height = 1152;
  const ctx = canvasTexture.getContext("2d");

  const coverPainter = COVER_PAINTERS[book.coverArt];
  if (coverPainter) {
    coverPainter(ctx, book, canvasTexture.width, canvasTexture.height);
    return configureCanvasTexture(new THREE.CanvasTexture(canvasTexture));
  }

  if (coverAtlasReady) {
    const [sourceX, sourceY, sourceWidth, sourceHeight] = COVER_CROPS[BOOKS.indexOf(book)];
    ctx.drawImage(
      coverAtlasImage,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      canvasTexture.width,
      canvasTexture.height
    );

    const edgeShade = ctx.createLinearGradient(0, 0, canvasTexture.width, 0);
    edgeShade.addColorStop(0, "rgba(0,0,0,0.16)");
    edgeShade.addColorStop(0.055, "rgba(255,255,255,0.015)");
    edgeShade.addColorStop(0.93, "rgba(255,255,255,0)");
    edgeShade.addColorStop(1, "rgba(0,0,0,0.1)");
    ctx.fillStyle = edgeShade;
    ctx.fillRect(0, 0, canvasTexture.width, canvasTexture.height);

    return configureCanvasTexture(new THREE.CanvasTexture(canvasTexture));
  }

  const random = seededRandom(hashSeed(book.id) + book.seed);

  ctx.fillStyle = book.color;
  ctx.fillRect(0, 0, canvasTexture.width, canvasTexture.height);

  const edge = ctx.createLinearGradient(0, 0, canvasTexture.width, 0);
  edge.addColorStop(0, "rgba(0,0,0,0.24)");
  edge.addColorStop(0.075, "rgba(255,255,255,0.035)");
  edge.addColorStop(0.5, "rgba(255,255,255,0.01)");
  edge.addColorStop(0.94, "rgba(0,0,0,0.06)");
  edge.addColorStop(1, "rgba(0,0,0,0.19)");
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, canvasTexture.width, canvasTexture.height);

  for (let line = 0; line < 1250; line += 1) {
    const x = random() * canvasTexture.width;
    const y = random() * canvasTexture.height;
    const length = 4 + random() * 22;
    ctx.strokeStyle = random() > 0.5 ? "rgba(255,255,255,0.024)" : "rgba(0,0,0,0.025)";
    ctx.lineWidth = 0.6 + random() * 0.8;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + length, y + (random() - 0.5) * 2);
    ctx.stroke();
  }

  ctx.strokeStyle = book.foil;
  ctx.globalAlpha = 0.72;
  ctx.lineWidth = 2;
  ctx.strokeRect(42, 42, canvasTexture.width - 84, canvasTexture.height - 84);
  ctx.strokeRect(55, 55, canvasTexture.width - 110, canvasTexture.height - 110);
  ctx.globalAlpha = 1;

  drawMotif(ctx, book, canvasTexture.width, canvasTexture.height);

  ctx.fillStyle = book.foil;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = '500 18px Inter, "Helvetica Neue", Arial, sans-serif';
  ctx.letterSpacing = "4px";
  ctx.fillText(`${SITE.mark}  /  ${book.roman}`, canvasTexture.width / 2, 92);

  const titleSize = book.title.length > 10 ? 72 : 88;
  ctx.font = `400 ${titleSize}px "Iowan Old Style", Baskerville, Georgia, serif`;
  ctx.fillText(book.title, canvasTexture.width / 2, canvasTexture.height * 0.72);
  ctx.font = '500 16px Inter, "Helvetica Neue", Arial, sans-serif';
  ctx.fillText(book.discipline.toUpperCase(), canvasTexture.width / 2, canvasTexture.height * 0.79);

  return configureCanvasTexture(new THREE.CanvasTexture(canvasTexture));
}

function makeFoilTexture(book) {
  const foilCanvas = document.createElement("canvas");
  foilCanvas.width = 768;
  foilCanvas.height = 1152;
  const ctx = foilCanvas.getContext("2d");
  const index = BOOKS.indexOf(book) + 1;

  ctx.clearRect(0, 0, foilCanvas.width, foilCanvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  ctx.font = '500 15px Inter, "Helvetica Neue", Arial, sans-serif';
  ctx.letterSpacing = "2.8px";
  ctx.fillText(`${SITE.mark}  /  ${pad(index)}`, 58, 70);
  ctx.globalAlpha = 0.7;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(58, 86);
  ctx.lineTo(164, 86);
  ctx.stroke();
  ctx.globalAlpha = 1;

  const titleSize = book.title.length > 10 ? 64 : 78;
  ctx.font = `400 ${titleSize}px "Iowan Old Style", Baskerville, Georgia, serif`;
  ctx.fillText(book.title, 58, 1020);
  ctx.font = '500 14px Inter, "Helvetica Neue", Arial, sans-serif';
  ctx.letterSpacing = "2.4px";
  ctx.fillText(book.discipline.toUpperCase(), 60, 1066);

  return configureCanvasTexture(new THREE.CanvasTexture(foilCanvas));
}

function makeClothBumpTexture(book) {
  const bumpCanvas = document.createElement("canvas");
  bumpCanvas.width = 256;
  bumpCanvas.height = 256;
  const ctx = bumpCanvas.getContext("2d");
  const random = seededRandom(hashSeed(`${book.id}-cloth`) + book.seed);

  ctx.fillStyle = "#7f7f7f";
  ctx.fillRect(0, 0, bumpCanvas.width, bumpCanvas.height);

  for (let line = 0; line < 256; line += 2) {
    const value = Math.round(98 + random() * 70);
    ctx.strokeStyle = `rgb(${value},${value},${value})`;
    ctx.globalAlpha = 0.34 + random() * 0.18;
    ctx.lineWidth = 0.65 + random() * 0.45;
    ctx.beginPath();
    ctx.moveTo(0, line + (random() - 0.5));
    ctx.lineTo(256, line + (random() - 0.5));
    ctx.stroke();
  }

  for (let line = 1; line < 256; line += 3) {
    const value = Math.round(105 + random() * 58);
    ctx.strokeStyle = `rgb(${value},${value},${value})`;
    ctx.globalAlpha = 0.25 + random() * 0.14;
    ctx.lineWidth = 0.55 + random() * 0.35;
    ctx.beginPath();
    ctx.moveTo(line + (random() - 0.5), 0);
    ctx.lineTo(line + (random() - 0.5), 256);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  const texture = new THREE.CanvasTexture(bumpCanvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(5, 8);
  return configureCanvasTexture(texture, {
    color: false,
    anisotropy: 12
  });
}

function makeClothSurfaceMaps(book) {
  const size = 256;
  const heightField = new Float32Array(size * size);
  const normalCanvas = document.createElement("canvas");
  const roughnessCanvas = document.createElement("canvas");
  normalCanvas.width = roughnessCanvas.width = size;
  normalCanvas.height = roughnessCanvas.height = size;
  const normalContext = normalCanvas.getContext("2d");
  const roughnessContext = roughnessCanvas.getContext("2d");
  const normalImage = normalContext.createImageData(size, size);
  const roughnessImage = roughnessContext.createImageData(size, size);
  const phase = (book.seed % 19) * 0.23;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const warp = Math.sin((x + phase) * Math.PI * 0.52);
      const weft = Math.sin((y - phase) * Math.PI * 0.41);
      const cross = Math.sin((x + y + phase) * Math.PI * 0.19);
      heightField[y * size + x] = 0.5 + warp * 0.18 + weft * 0.15 + cross * 0.045;
    }
  }

  const sampleHeight = (x, y) => {
    const wrappedX = (x + size) % size;
    const wrappedY = (y + size) % size;
    return heightField[wrappedY * size + wrappedX];
  };

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const index = y * size + x;
      const pixel = index * 4;
      const dx = (sampleHeight(x + 1, y) - sampleHeight(x - 1, y)) * 1.5;
      const dy = (sampleHeight(x, y + 1) - sampleHeight(x, y - 1)) * 1.5;
      const length = Math.hypot(dx, dy, 1);
      normalImage.data[pixel] = Math.round(((-dx / length) * 0.5 + 0.5) * 255);
      normalImage.data[pixel + 1] = Math.round(((-dy / length) * 0.5 + 0.5) * 255);
      normalImage.data[pixel + 2] = Math.round(((1 / length) * 0.5 + 0.5) * 255);
      normalImage.data[pixel + 3] = 255;

      const roughness = Math.round(188 + heightField[index] * 56);
      roughnessImage.data[pixel] = roughness;
      roughnessImage.data[pixel + 1] = roughness;
      roughnessImage.data[pixel + 2] = roughness;
      roughnessImage.data[pixel + 3] = 255;
    }
  }

  normalContext.putImageData(normalImage, 0, 0);
  roughnessContext.putImageData(roughnessImage, 0, 0);

  const configureWeaveMap = (canvas, suffix) => {
    const texture = new THREE.CanvasTexture(canvas);
    texture.name = `${book.id}-${suffix}`;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(5, 8);
    return configureCanvasTexture(texture, {
      color: false,
      anisotropy: 12
    });
  };

  return {
    normal: configureWeaveMap(normalCanvas, "cloth-normal"),
    roughness: configureWeaveMap(roughnessCanvas, "cloth-roughness")
  };
}

function makeEmbossMap(sourceTexture, name) {
  const texture = new THREE.CanvasTexture(sourceTexture.image);
  texture.name = name;
  texture.wrapS = sourceTexture.wrapS;
  texture.wrapT = sourceTexture.wrapT;
  texture.repeat.copy(sourceTexture.repeat);
  texture.offset.copy(sourceTexture.offset);
  texture.center.copy(sourceTexture.center);
  texture.rotation = sourceTexture.rotation;
  return configureCanvasTexture(texture, {
    color: false,
    anisotropy: 16
  });
}
