"use strict";
// Mouse and touch: hover, clicks, wheel and what is under the pointer.

function setPointerFromEvent(event) {
  const rect = canvas.getBoundingClientRect();
  pointer.clientX = event.clientX;
  pointer.clientY = event.clientY;
  pointer.ndc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.ndc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  pointerDirty = true;
}

function updateHover() {
  pointerDirty = false;
  if (mode === "detail" && activeBook) {
    setHovered(-1);
    if (readingOpen) {
      detailBookHovered = false;
      canvas.classList.remove("has-closed-book-hover");
      canvas.classList.toggle(
        "has-page-hover",
        pageDrag.active
          || Boolean(pageSurfaceAtPointer())
          || Boolean(coverSurfaceAtPointer())
      );
    } else {
      detailBookHovered = Boolean(coverSurfaceAtPointer());
      canvas.classList.remove("has-page-hover");
      canvas.classList.toggle(
        "has-closed-book-hover",
        detailBookHovered
      );
    }
    return;
  }
  detailBookHovered = false;
  canvas.classList.remove("has-page-hover", "has-closed-book-hover");
  if (mode !== "hero") {
    setHovered(-1);
    return;
  }
  setHovered(bookIndexAtPointer());
}

function bookIndexAtPointer() {
  raycaster.setFromCamera(pointer.ndc, camera);
  const hits = raycaster.intersectObjects(hitTargets, false);
  return hits.length ? hits[0].object.userData.index : -1;
}

function activeBookAtPointer() {
  if (mode !== "detail" || !activeBook) return false;
  activeBook.root.updateWorldMatrix(true, true);
  raycaster.setFromCamera(pointer.ndc, camera);
  return raycaster.intersectObject(activeBook.hit, false).length > 0;
}

function pageSurfaceAtPointer() {
  if (mode !== "detail" || !activeBook || !readingOpen) return null;
  activeBook.root.updateWorldMatrix(true, true);
  raycaster.setFromCamera(pointer.ndc, camera);
  const hits = raycaster.intersectObjects(
    activeBook.pageGestureSurfaces,
    false
  );
  return hits.length ? hits[0].object : null;
}

function coverSurfaceAtPointer() {
  if (
    mode !== "detail"
    || !activeBook
    || currentSpread !== 0
  ) return null;
  activeBook.root.updateWorldMatrix(true, true);
  raycaster.setFromCamera(pointer.ndc, camera);
  const hits = raycaster.intersectObject(activeBook.frontCover, false);
  return hits.length ? hits[0].object : null;
}

function setHovered(index) {
  if (hoveredIndex === index) return;
  hoveredIndex = index;
  canvas.classList.toggle("has-book-hover", index >= 0);
  if (index >= 0) {
    const book = BOOKS[index];
    pointerLabelIndex.textContent = `Volume ${pad(index + 1)}`;
    pointerLabelTitle.textContent = book.title;
    pointerLabel.setAttribute("aria-hidden", "false");
  } else {
    pointerLabel.setAttribute("aria-hidden", "true");
  }
  requestFrame();
}

function positionPointerLabel() {
  pointerLabel.style.left = `${pointer.clientX}px`;
  pointerLabel.style.top = `${pointer.clientY}px`;
}

function onPointerMove(event) {
  setPointerFromEvent(event);
  positionPointerLabel();
  requestFrame();
}

function onPointerLeave() {
  pointer.ndc.set(3, 3);
  pointerDirty = false;
  detailBookHovered = false;
  setHovered(-1);
  if (!pageDrag.active) {
    canvas.classList.remove("has-page-hover", "has-closed-book-hover");
  }
}

function onCanvasClick(event) {
  if (mode === "detail" && !readingOpen && event.button === 0) {
    if (!detailPress.allowClick) return;
    detailPress.allowClick = false;
    setPointerFromEvent(event);
    if (!activeBookAtPointer()) return;
    event.preventDefault();
    setReadingOpen(true);
    return;
  }
  if (mode !== "hero" || event.button !== 0) return;
  setPointerFromEvent(event);
  const clickedBookIndex = bookIndexAtPointer();
  if (clickedBookIndex < 0) return;
  event.preventDefault();
  selectMarker(clickedBookIndex, canvas);
  openDetail(canvas);
}

function onWheel(event) {
  if (mode !== "hero") return;
  event.preventDefault();
  const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
  targetPosition += clamp(delta * 0.0022, -0.72, 0.72);
  wheelIdle = 0.14;
  requestFrame();
}
