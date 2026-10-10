"use strict";
// Lifting a book off the shelf and putting it back.

function openDetail(origin = inspectButton) {
  if (mode !== "hero") return;
  mode = "opening";
  transitionTime = 0;
  readingOpen = false;
  detailBookHovered = false;
  currentSpread = 0;
  resetDetailPress();
  focusReturnTarget = origin === canvas
    ? markers.children[selectedIndex] || inspectButton
    : origin instanceof HTMLElement
      ? origin
      : inspectButton;
  activeBook = bookRigs[selectedIndex];
  activeBook.contactShadow.visible = false;
  populateDetail(activeBook.data);
  updatePageControls(false);
  detailPanel.inert = false;
  detailPanel.setAttribute("aria-hidden", "false");
  browseUi.inert = true;
  experience.classList.add("mode-detail", "is-opening");
  pointerLabel.setAttribute("aria-hidden", "true");
  setHovered(-1);

  activeBook.root.updateWorldMatrix(true, true);
  activeBook.root.matrixWorld.decompose(
    openingBookPosition,
    openingBookQuaternion,
    openingBookScale
  );
  openingCameraPosition.copy(camera.position);
  openingCameraTarget.copy(transitionCameraTarget);
  openingShelfPosition.copy(shelfStage.position);
  openingMotionPosition.copy(activeBook.motion.position);
  openingMotionQuaternion.copy(activeBook.motion.quaternion);
  openingViewOffsetX = currentViewOffsetX;
  scene.add(activeBook.root);
  activeBook.root.position.copy(openingBookPosition);
  activeBook.root.quaternion.copy(openingBookQuaternion);
  activeBook.root.scale.copy(openingBookScale);
  applyDetailViewOffset();
  controls.enabled = false;
  liveRegion.textContent = `Opening a closed copy of ${activeBook.data.title}. Drag the cover, click the book, or use Open book to begin reading.`;

  if (reducedMotion) {
    finishOpening();
  }
  requestFrame();
}

function applyOpeningPose(progress) {
  const eased = smootherstep(clamp(progress, 0, 1));
  const shelfClearEased = smootherstep(clamp(progress / 0.68, 0, 1));
  inspectBookScale.setScalar(getInspectScale());
  shelfStage.position.lerpVectors(
    openingShelfPosition,
    inspectShelfPosition,
    shelfClearEased
  );
  activeBook.root.position.lerpVectors(
    openingBookPosition,
    inspectPosition,
    eased
  );
  activeBook.root.quaternion.slerpQuaternions(
    openingBookQuaternion,
    inspectBookQuaternion,
    eased
  );
  activeBook.root.scale.lerpVectors(
    openingBookScale,
    inspectBookScale,
    eased
  );
  activeBook.motion.position.lerpVectors(
    openingMotionPosition,
    restingMotionPosition,
    eased
  );
  activeBook.motion.quaternion.slerpQuaternions(
    openingMotionQuaternion,
    restingMotionQuaternion,
    eased
  );
  camera.position.lerpVectors(
    openingCameraPosition,
    inspectCameraPosition,
    eased
  );
  transitionCameraTarget.lerpVectors(
    openingCameraTarget,
    inspectCameraTarget,
    eased
  );
  currentViewOffsetX = lerp(openingViewOffsetX, detailViewOffsetX, eased);
  applyDetailViewOffset();
  camera.lookAt(transitionCameraTarget);
}

function finishOpening() {
  if (!activeBook) return;
  applyOpeningPose(1);
  mode = "detail";
  transitionTime = 1;
  controls.target.copy(inspectCameraTarget);
  controls.enabled = true;
  controls.enableDamping = !reducedMotion;
  controls.update();
  updatePageControls(false);
  experience.classList.remove("is-opening");
  closeButton.focus({ preventScroll: true });
}

function closeDetail() {
  if (mode !== "detail") return;
  cancelPageDrag();
  resetDetailPress();
  mode = "closing";
  transitionTime = 0;
  readingOpen = false;
  detailBookHovered = false;
  currentSpread = 0;
  canvas.classList.remove("has-page-hover", "has-closed-book-hover");
  updatePageControls(false);
  controls.enabled = false;
  closingBookStartPosition.copy(activeBook.root.position);
  closingBookStartQuaternion.copy(activeBook.root.quaternion);
  closingBookStartScale.copy(activeBook.root.scale);
  closingMotionPosition.copy(activeBook.motion.position);
  closingMotionQuaternion.copy(activeBook.motion.quaternion);
  closingCameraPosition.copy(camera.position);
  closingCameraTarget.copy(controls.target);
  closingShelfPosition.copy(shelfStage.position);
  closingViewOffsetX = currentViewOffsetX;
  transitionCameraTarget.copy(closingCameraTarget);
  experience.classList.remove("is-opening");
  alignShelfToSelection();
  closingBookPosition.set(
    0,
    shelfBoardTop + activeBook.base.height * 0.5 + 0.15,
    0.37
  );
  bookRigs.forEach((rig, index) => {
    if (rig !== activeBook && rig.root.parent === shelfStage) {
      snapRigToShelfSlot(rig, index);
    }
  });
  experience.classList.remove("mode-detail");
  detailPanel.setAttribute("aria-hidden", "true");
  detailPanel.inert = true;
  liveRegion.textContent = `Returning ${activeBook.data.title} to the shelf.`;
  if (reducedMotion) {
    finishClosing();
  }
  requestFrame();
}

function applyClosingPose(progress) {
  const eased = smootherstep(clamp(progress, 0, 1));
  const shelfReturnEased = smootherstep(
    clamp((progress - 0.24) / 0.76, 0, 1)
  );
  shelfStage.position.lerpVectors(
    closingShelfPosition,
    shelfRestPosition,
    shelfReturnEased
  );
  activeBook.root.position.lerpVectors(
    closingBookStartPosition,
    closingBookPosition,
    eased
  );
  activeBook.root.quaternion.slerpQuaternions(
    closingBookStartQuaternion,
    closingBookQuaternion,
    eased
  );
  activeBook.root.scale.lerpVectors(
    closingBookStartScale,
    closingBookScale,
    eased
  );
  activeBook.motion.position.lerpVectors(
    closingMotionPosition,
    restingMotionPosition,
    eased
  );
  activeBook.motion.quaternion.slerpQuaternions(
    closingMotionQuaternion,
    restingMotionQuaternion,
    eased
  );
  camera.position.lerpVectors(
    closingCameraPosition,
    shelfCameraPosition,
    eased
  );
  transitionCameraTarget.lerpVectors(
    closingCameraTarget,
    shelfCameraTarget,
    eased
  );
  currentViewOffsetX = lerp(closingViewOffsetX, 0, eased);
  applyDetailViewOffset();
  camera.lookAt(transitionCameraTarget);
}

function finishClosing() {
  if (!activeBook) return;
  applyClosingPose(1);
  shelfStage.attach(activeBook.root);
  snapRigToShelfSlot(activeBook, selectedIndex);
  activeBook.contactShadow.visible = true;
  controls.target.copy(shelfCameraTarget);
  browseUi.inert = false;
  mode = "hero";
  transitionTime = 0;
  activeBook = null;
  liveRegion.textContent = `${BOOKS[selectedIndex].title} returned to the shelf.`;
  requestAnimationFrame(() => focusReturnTarget?.focus?.({ preventScroll: true }));
}

function resetInspectionView() {
  if (mode !== "detail") return;
  camera.position.copy(inspectCameraPosition);
  controls.target.copy(inspectCameraTarget);
  controls.update();
  liveRegion.textContent = `Inspection view reset for ${BOOKS[selectedIndex].title}.`;
  requestFrame();
}
