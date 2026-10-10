"use strict";
// Dragging the cover and pages by hand.

function resetPageDrag() {
  const capturedPointerId = pageDrag.pointerId;
  pageDrag.active = false;
  pageDrag.pointerId = null;
  pageDrag.progress = 0;
  pageDrag.peakProgress = 0;
  pageDrag.committed = false;
  pageDrag.progressVelocity = 0;
  pageDrag.verticalBias = 0;
  pageDrag.lastProgress = 0;
  pageDrag.lastTime = 0;
  pageDrag.direction = 0;
  pageDrag.kind = null;
  canvas.classList.remove("is-page-dragging");
  controls.enabled = mode === "detail";
  if (
    capturedPointerId !== null
    && canvas.hasPointerCapture?.(capturedPointerId)
  ) {
    canvas.releasePointerCapture(capturedPointerId);
  }
}

function applyPageReleaseImpulse(turnDirection) {
  if (!activeBook || turnDirection === 0) return;
  const leafOrder = turnDirection > 0
    ? currentSpread
    : currentSpread - 1;
  const pageIndex = activeBook.pagePivots.length - 1 - leafOrder;
  const pagePivot = activeBook.pagePivots[pageIndex];
  const flex = pagePivot?.userData.flex;
  if (!flex) return;

  const speedResponse = clamp(
    Math.abs(pageDrag.progressVelocity) / 5.5,
    0.12,
    1
  );
  flex.curveVelocity = clamp(
    flex.curveVelocity + speedResponse * 0.46,
    -1.8,
    1.8
  );
  flex.twistVelocity = clamp(
    flex.twistVelocity
      + pageDrag.verticalBias * 0.38
      + clamp(
          pageDrag.progressVelocity / 5.5,
          -1,
          1
        ) * turnDirection * 0.14,
    -1.6,
    1.6
  );
}

function settlePageDrag(commitLatchedGesture = false) {
  if (!pageDrag.active) return false;
  const turnDirection = pageDrag.direction;
  const shouldCloseCover = commitLatchedGesture
    && pageDrag.kind === "cover-close"
    && pageDrag.committed;
  const shouldOpenCover = commitLatchedGesture
    && pageDrag.kind === "cover-open"
    && pageDrag.committed;
  const shouldTurnPage = commitLatchedGesture
    && pageDrag.kind === "page"
    && pageDrag.committed
    && turnDirection !== 0;
  if (shouldTurnPage) {
    applyPageReleaseImpulse(turnDirection);
  }
  resetPageDrag();
  if (shouldCloseCover) {
    setReadingOpen(false);
  } else if (shouldOpenCover) {
    setReadingOpen(true);
  } else if (shouldTurnPage) {
    turnPage(turnDirection);
  } else {
    requestFrame();
  }
  return shouldCloseCover || shouldOpenCover || shouldTurnPage;
}

function cancelPageDrag() {
  settlePageDrag(false);
}

function resetDetailPress() {
  detailPress.active = false;
  detailPress.pointerId = null;
  detailPress.moved = false;
  detailPress.allowClick = false;
}

function onDetailBookPointerDown(event) {
  if (
    mode !== "detail"
    || readingOpen
    || event.button !== 0
    || event.isPrimary === false
  ) return;

  setPointerFromEvent(event);
  detailPress.allowClick = false;
  if (!activeBookAtPointer()) return;
  detailPress.active = true;
  detailPress.pointerId = event.pointerId;
  detailPress.startX = event.clientX;
  detailPress.startY = event.clientY;
  detailPress.moved = false;
}

function onDetailBookPointerMove(event) {
  if (!detailPress.active || event.pointerId !== detailPress.pointerId) return;
  if (
    Math.hypot(
      event.clientX - detailPress.startX,
      event.clientY - detailPress.startY
    ) > 16
  ) {
    detailPress.moved = true;
  }
}

function onDetailBookPointerEnd(event) {
  if (!detailPress.active || event.pointerId !== detailPress.pointerId) return;
  detailPress.allowClick = event.type === "pointerup" && !detailPress.moved;
  detailPress.active = false;
  detailPress.pointerId = null;
}

function onPagePointerDown(event) {
  if (
    mode !== "detail"
    || !activeBook
    || event.button !== 0
    || event.isPrimary === false
  ) return;

  setPointerFromEvent(event);
  const coverSurface = coverSurfaceAtPointer();
  const pageSurface = readingOpen ? pageSurfaceAtPointer() : null;
  if (!coverSurface && !pageSurface) return;

  event.preventDefault();
  event.stopImmediatePropagation();
  pageDrag.active = true;
  pageDrag.pointerId = event.pointerId;
  pageDrag.startX = event.clientX;
  pageDrag.startY = event.clientY;
  pageDrag.progress = 0;
  pageDrag.peakProgress = 0;
  pageDrag.committed = false;
  pageDrag.progressVelocity = 0;
  pageDrag.verticalBias = 0;
  pageDrag.lastProgress = 0;
  pageDrag.lastTime = event.timeStamp || performance.now();
  pageDrag.direction = 0;
  pageDrag.kind = coverSurface
    ? readingOpen
      ? "cover-close"
      : "cover-open"
    : "page";
  controls.enabled = false;
  canvas.classList.add("has-page-hover", "is-page-dragging");
  canvas.setPointerCapture?.(event.pointerId);
  requestFrame();
}

function updatePageDragMotion(event, deltaY) {
  const eventTime = event.timeStamp || performance.now();
  const elapsed = clamp(
    (eventTime - pageDrag.lastTime) / 1000,
    0.008,
    0.08
  );
  const instantVelocity = clamp(
    (pageDrag.progress - pageDrag.lastProgress) / elapsed,
    -8,
    8
  );
  pageDrag.progressVelocity = lerp(
    pageDrag.progressVelocity,
    instantVelocity,
    0.42
  );
  pageDrag.verticalBias = lerp(
    pageDrag.verticalBias,
    clamp(deltaY / 180, -1, 1),
    0.36
  );
  pageDrag.lastProgress = pageDrag.progress;
  pageDrag.lastTime = eventTime;
}

function updatePageDragFromEvent(event) {
  setPointerFromEvent(event);

  const deltaX = event.clientX - pageDrag.startX;
  const deltaY = event.clientY - pageDrag.startY;
  const horizontalDistance = Math.abs(deltaX);

  if (
    pageDrag.kind === "cover-open"
    || pageDrag.kind === "cover-close"
  ) {
    const openingCover = pageDrag.kind === "cover-open";
    const signedDistance = openingCover ? -deltaX : deltaX;
    const commitProgress = openingCover
      ? COVER_OPEN_COMMIT_PROGRESS
      : COVER_CLOSE_COMMIT_PROGRESS;
    pageDrag.direction = 0;
    pageDrag.progress = (
      horizontalDistance >= 3
      && horizontalDistance >= Math.abs(deltaY) * 0.72
    )
      ? clamp(Math.max(0, signedDistance) / 140, 0, 1)
      : 0;
    pageDrag.peakProgress = Math.max(
      pageDrag.peakProgress,
      pageDrag.progress
    );
    if (pageDrag.peakProgress >= commitProgress) {
      pageDrag.committed = true;
    }
    updatePageDragMotion(event, deltaY);
    return;
  }

  if (
    horizontalDistance < 3
    || horizontalDistance < Math.abs(deltaY) * 0.72
  ) {
    pageDrag.progress = 0;
  } else {
    if (pageDrag.direction === 0 && horizontalDistance >= 6) {
      const direction = deltaX < 0 ? 1 : -1;
      const directionAvailable = direction > 0
        ? currentSpread < SPREAD_COUNT - 1
        : currentSpread > 0;
      pageDrag.direction = directionAvailable ? direction : 0;
    }

    const signedDistance = pageDrag.direction > 0 ? -deltaX : deltaX;
    pageDrag.progress = pageDrag.direction !== 0
      ? clamp(Math.max(0, signedDistance) / 150, 0, 1)
      : 0;
    pageDrag.peakProgress = Math.max(
      pageDrag.peakProgress,
      pageDrag.progress
    );
    if (pageDrag.peakProgress >= PAGE_TURN_COMMIT_PROGRESS) {
      pageDrag.committed = true;
    }
  }
  updatePageDragMotion(event, deltaY);
}

function onPagePointerMove(event) {
  if (!pageDrag.active || event.pointerId !== pageDrag.pointerId) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  updatePageDragFromEvent(event);

  requestFrame();
}

function onPagePointerEnd(event) {
  if (!pageDrag.active || event.pointerId !== pageDrag.pointerId) return;
  if (event.cancelable) event.preventDefault();
  event.stopImmediatePropagation();
  if (event.type === "pointerup") updatePageDragFromEvent(event);
  const dragKind = pageDrag.kind;
  const releaseDistance = Math.hypot(
    event.clientX - pageDrag.startX,
    event.clientY - pageDrag.startY
  );
  const shouldClickOpen = event.type === "pointerup"
    && dragKind === "cover-open"
    && !pageDrag.committed
    && releaseDistance <= 12;
  if (pageDrag.committed) {
    settlePageDrag(true);
  } else if (shouldClickOpen) {
    resetPageDrag();
    detailPress.allowClick = false;
    setReadingOpen(true);
  } else {
    if (dragKind === "cover-open") {
      detailPress.allowClick = false;
    }
    cancelPageDrag();
  }
}

function onWindowPagePointerEnd(event) {
  if (!pageDrag.active || event.pointerId !== pageDrag.pointerId) return;
  if (event.type === "pointerup") updatePageDragFromEvent(event);
  settlePageDrag(true);
}
