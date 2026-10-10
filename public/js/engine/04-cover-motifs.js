"use strict";
// Line drawings used on endpapers, inside pages and the backup covers.

function drawMotif(ctx, book, width, height) {
  const foil = book.foil;
  ctx.save();
  ctx.strokeStyle = foil;
  ctx.fillStyle = foil;
  ctx.lineWidth = Math.max(3, width * 0.004);
  ctx.globalAlpha = 0.88;
  const centerX = width * 0.5;
  const centerY = height * 0.38;
  const size = Math.min(width, height) * 0.22;

  if (book.motifKey === "brackets") {
    for (let layer = 0; layer < 3; layer += 1) {
      const inset = layer * size * 0.22;
      const left = centerX - size + inset;
      const right = centerX + size - inset;
      const top = centerY - size * 0.72 + inset;
      const bottom = centerY + size * 0.72 - inset;
      ctx.beginPath();
      ctx.moveTo(left + size * 0.25, top);
      ctx.lineTo(left, top);
      ctx.lineTo(left, bottom);
      ctx.lineTo(left + size * 0.25, bottom);
      ctx.moveTo(right - size * 0.25, top);
      ctx.lineTo(right, top);
      ctx.lineTo(right, bottom);
      ctx.lineTo(right - size * 0.25, bottom);
      ctx.stroke();
    }
    ctx.fillRect(centerX - 3, centerY - 3, 6, 6);
  } else if (book.motifKey === "paths") {
    ctx.beginPath();
    ctx.moveTo(centerX - size, centerY + size * 0.35);
    ctx.bezierCurveTo(centerX - size * 0.2, centerY - size, centerX + size * 0.1, centerY + size, centerX + size, centerY - size * 0.25);
    ctx.stroke();
    ctx.globalAlpha = 0.52;
    ctx.beginPath();
    ctx.moveTo(centerX - size, centerY - size * 0.45);
    ctx.bezierCurveTo(centerX - size * 0.25, centerY + size, centerX + size * 0.3, centerY - size, centerX + size, centerY + size * 0.45);
    ctx.stroke();
    for (let point = -1; point <= 1; point += 1) {
      ctx.beginPath();
      ctx.arc(centerX + point * size, centerY - point * size * 0.25, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (book.motifKey === "caret") {
    ctx.beginPath();
    ctx.moveTo(centerX - size * 0.9, centerY + size * 0.6);
    ctx.lineTo(centerX, centerY - size * 0.65);
    ctx.lineTo(centerX + size * 0.9, centerY + size * 0.6);
    ctx.stroke();
    ctx.globalAlpha = 0.38;
    for (let line = -2; line <= 2; line += 1) {
      ctx.beginPath();
      ctx.moveTo(centerX - size, centerY + line * size * 0.28);
      ctx.lineTo(centerX + size, centerY + line * size * 0.28);
      ctx.stroke();
    }
  } else if (book.motifKey === "orbits") {
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, size, size * 0.42, -0.35, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.58;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, size * 0.72, size, 0.52, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.arc(centerX + size * 0.64, centerY - size * 0.34, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(centerX - 6, centerY - 6, 12, 12);
  } else if (book.motifKey === "modules") {
    const moduleSize = size * 0.54;
    const positions = [
      [-0.55, -0.5, "circle"],
      [0.25, -0.5, "rect"],
      [-0.55, 0.3, "rect"],
      [0.25, 0.3, "circle"]
    ];
    positions.forEach(([x, y, shape], index) => {
      ctx.globalAlpha = 0.45 + index * 0.12;
      if (shape === "circle") {
        ctx.beginPath();
        ctx.arc(centerX + x * size, centerY + y * size, moduleSize * 0.48, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.strokeRect(
          centerX + x * size - moduleSize * 0.5,
          centerY + y * size - moduleSize * 0.5,
          moduleSize,
          moduleSize
        );
      }
    });
  } else if (book.motifKey === "frames") {
    for (let layer = 0; layer < 4; layer += 1) {
      ctx.globalAlpha = 0.9 - layer * 0.17;
      const offset = layer * size * 0.18;
      ctx.strokeRect(
        centerX - size + offset,
        centerY - size * 0.7 + offset,
        size * 2 - offset * 2,
        size * 1.4 - offset * 2
      );
    }
    ctx.beginPath();
    ctx.moveTo(centerX - size, centerY - size * 0.7);
    ctx.lineTo(centerX + size, centerY + size * 0.7);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(centerX, centerY, size * 0.78, 0.15, Math.PI * 1.82);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centerX - size * 0.72, centerY + size * 0.88);
    ctx.lineTo(centerX, centerY - size * 0.92);
    ctx.lineTo(centerX + size * 0.72, centerY + size * 0.88);
    ctx.stroke();
    ctx.globalAlpha = 0.48;
    ctx.beginPath();
    ctx.moveTo(centerX - size, centerY);
    ctx.lineTo(centerX + size, centerY);
    ctx.stroke();
  }
  ctx.restore();
}
