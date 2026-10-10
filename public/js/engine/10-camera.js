"use strict";
// Where the camera and the picked-up book sit on each screen size.

function configureResponsiveTargets() {
  const narrow = viewWidth < 820;
  shelfCameraPosition.set(0, narrow ? 2.02 : 1.92, narrow ? 8.7 : 8.1);
  shelfCameraTarget.set(0, narrow ? 1.57 : 1.55, 0);
  inspectPosition.set(narrow ? 0 : -2.25, narrow ? 2.3 : 1.56, narrow ? 0.15 : 0);
  inspectCameraPosition.set(narrow ? 0 : -0.52, narrow ? 2.46 : 1.78, narrow ? 5.7 : 5.25);
  inspectCameraTarget.copy(inspectPosition);

  if (narrow) {
    detailViewOffsetX = 0;
    detailSafeWidth = viewWidth;
    return;
  }

  const panelBounds = detailPanel.getBoundingClientRect();
  const panelLeft = panelBounds.left > 0 ? panelBounds.left : viewWidth * 0.64;
  const gutter = clamp(viewWidth * 0.035, 32, 56);
  detailSafeWidth = Math.max(viewWidth * 0.42, panelLeft - gutter);
  const wideLayoutProgress = clamp((viewWidth - 820) / 620, 0, 1);
  const bookCenterRatio = THREE.MathUtils.lerp(0.55, 0.615, wideLayoutProgress);
  const desiredBookCenter = detailSafeWidth * bookCenterRatio;
  detailViewOffsetX = Math.max(0, viewWidth * 0.5 - desiredBookCenter);
}

function getInspectScale() {
  if (!activeBook || viewWidth < 820) return 0.82;
  const distance = Math.abs(inspectCameraPosition.z - inspectPosition.z);
  const worldHeight = 2 * distance * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5));
  const pixelsPerWorld = viewHeight / Math.max(worldHeight, 0.001);
  const estimatedBookWidth = activeBook.base.width * pixelsPerWorld * 1.16;
  const scaleForSafeWidth = (detailSafeWidth * 0.72) / Math.max(estimatedBookWidth, 1);
  return clamp(scaleForSafeWidth, 0.9, 1.32);
}

function applyDetailViewOffset() {
  if (Math.abs(currentViewOffsetX) < 0.5) {
    camera.clearViewOffset();
    return;
  }
  camera.setViewOffset(
    viewWidth,
    viewHeight,
    currentViewOffsetX,
    0,
    viewWidth,
    viewHeight
  );
}
