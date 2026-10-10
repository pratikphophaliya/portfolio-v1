"use strict";
// The animation loop and window resizing.

function updateTransition(delta) {
  if (mode === "opening") {
    transitionTime = Math.min(
      1,
      transitionTime + delta / DETAIL_TRANSITION_DURATION
    );
    applyOpeningPose(transitionTime);
    updatePaginatedBook(activeBook, delta, 0);
    if (transitionTime >= 1) finishOpening();
  } else if (mode === "closing") {
    transitionTime = Math.min(
      1,
      transitionTime + delta / SHELF_TRANSITION_DURATION
    );
    applyClosingPose(transitionTime);
    updatePaginatedBook(activeBook, delta, 0);
    if (transitionTime >= 1) finishClosing();
  } else if (mode === "hero") {
    shelfStage.position.y = damp(shelfStage.position.y, 0, 10, delta);
    shelfStage.position.z = damp(shelfStage.position.z, 0, 10, delta);
    camera.position.x = damp(camera.position.x, shelfCameraPosition.x, 8, delta);
    camera.position.y = damp(camera.position.y, shelfCameraPosition.y, 8, delta);
    camera.position.z = damp(camera.position.z, shelfCameraPosition.z, 8, delta);
    transitionCameraTarget.copy(shelfCameraTarget);
    currentViewOffsetX = 0;
    applyDetailViewOffset();
    camera.lookAt(shelfCameraTarget);
  }
}

function updateDust(elapsed) {
  if (reducedMotion) return;
  const dust = scene.getObjectByName("paper-dust");
  if (dust) {
    dust.rotation.y = elapsed * 0.012;
    dust.position.y = Math.sin(elapsed * 0.17) * 0.025;
  }
}

function requestFrame() {
  if (!rafId && !suspended) {
    rafId = requestAnimationFrame(frame);
  }
}

function getDetailOpenAmount() {
  if (pageDrag.active && pageDrag.kind === "cover-open") {
    return smoothstep(pageDrag.progress);
  }
  if (!readingOpen) return 0;
  if (pageDrag.active && pageDrag.kind === "cover-close") {
    return 1 - smoothstep(pageDrag.progress);
  }
  return 1;
}

function frame(time) {
  rafId = 0;
  const delta = Math.min((time - lastTime) / 1000, 0.05);
  const elapsed = time / 1000;
  lastTime = time;

  if (pointerDirty) updateHover();
  updateShelfLayout(delta, elapsed);
  updateTransition(delta);
  updateDust(elapsed);
  const themeIsMoving = updateTheme(delta);

  if (mode === "detail") {
    if (pageDrag.active) {
      pageDrag.progressVelocity = damp(
        pageDrag.progressVelocity,
        0,
        9,
        delta
      );
    }
    controls.update();
    updatePaginatedBook(activeBook, delta, getDetailOpenAmount());
  }

  renderer.render(scene, camera);

  const shelfMoving = Math.abs(position - targetPosition) > 0.0005 || wheelIdle > 0;
  const shouldContinue = !reducedMotion
    || mode === "opening"
    || mode === "closing"
    || shelfMoving
    || themeIsMoving;
  if (shouldContinue && !suspended) requestFrame();
}

function resize() {
  viewWidth = window.innerWidth;
  viewHeight = window.innerHeight;
  configureResponsiveTargets();
  renderer.setSize(viewWidth, viewHeight, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, viewWidth < 820 ? 1.5 : 2));
  camera.aspect = viewWidth / viewHeight;
  camera.updateProjectionMatrix();

  if (mode === "hero") {
    camera.position.copy(shelfCameraPosition);
    transitionCameraTarget.copy(shelfCameraTarget);
    currentViewOffsetX = 0;
    applyDetailViewOffset();
    camera.lookAt(shelfCameraTarget);
  } else if (mode === "detail" && activeBook) {
    activeBook.root.position.copy(inspectPosition);
    activeBook.root.scale.setScalar(getInspectScale());
    transitionCameraTarget.copy(inspectCameraTarget);
    currentViewOffsetX = detailViewOffsetX;
    applyDetailViewOffset();
    resetInspectionView();
  }
  requestFrame();
}
