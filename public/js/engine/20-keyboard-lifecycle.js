"use strict";
// Keyboard, tab switching, reduced motion, fallback and clean-up.

function onKeyDown(event) {
  if (event.key === "Escape" && mode === "detail") {
    event.preventDefault();
    closeDetail();
    return;
  }

  if (
    mode === "detail"
    && !event.metaKey
    && !event.ctrlKey
    && !event.altKey
    && (event.key === "ArrowLeft" || event.key === "ArrowRight")
  ) {
    event.preventDefault();
    turnPage(event.key === "ArrowLeft" ? -1 : 1);
    return;
  }

  if (mode === "detail" && event.key === "Tab") {
    const focusables = [
      closeButton,
      ...detailLinks.querySelectorAll("a"),
      toggleBookButton,
      previousPageButton,
      nextPageButton,
      resetButton
    ].filter((element) => !element.disabled);
    const current = focusables.indexOf(document.activeElement);
    const next = event.shiftKey
      ? (current <= 0 ? focusables.length - 1 : current - 1)
      : (current >= focusables.length - 1 ? 0 : current + 1);
    event.preventDefault();
    focusables[next].focus();
    return;
  }

  if (mode !== "hero" || event.metaKey || event.ctrlKey || event.altKey) return;
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    navigate(-1, document.activeElement);
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    navigate(1, document.activeElement);
  } else if ((event.key === "Enter" || event.key === " ") && document.activeElement === inspectButton) {
    event.preventDefault();
    openDetail(inspectButton);
  }
}

function onVisibilityChange() {
  suspended = document.hidden;
  if (!suspended) {
    lastTime = performance.now();
    requestFrame();
  } else {
    settlePageDrag(true);
    resetDetailPress();
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  }
}

function onWindowBlur() {
  settlePageDrag(true);
  resetDetailPress();
}

function onReducedMotionChange(event) {
  cancelPageDrag();
  resetDetailPress();
  reducedMotion = event.matches;
  controls.enableDamping = !reducedMotion;
  if (reducedMotion) {
    position = targetPosition;
  }
  requestFrame();
}

function showFallback(message) {
  loading.hidden = true;
  experience.classList.remove("webgl-ready");
  staticFallback.hidden = false;
  fallbackStatus.textContent = message;
}

function handleContextLost(event) {
  event.preventDefault();
  cancelPageDrag();
  resetDetailPress();
  suspended = true;
  if (rafId) cancelAnimationFrame(rafId);
  rafId = 0;
  showFallback("The 3D view paused after losing its graphics context. The complete static catalog remains available; reload to restore inspection.");
}

function disposeExperience() {
  suspended = true;
  cancelPageDrag();
  resetDetailPress();
  if (rafId) cancelAnimationFrame(rafId);
  rafId = 0;

  canvas.removeEventListener("pointermove", onPointerMove);
  canvas.removeEventListener("pointerleave", onPointerLeave);
  canvas.removeEventListener("click", onCanvasClick);
  canvas.removeEventListener("pointerdown", onDetailBookPointerDown, true);
  canvas.removeEventListener("pointermove", onDetailBookPointerMove, true);
  canvas.removeEventListener("pointerup", onDetailBookPointerEnd, true);
  canvas.removeEventListener("pointercancel", onDetailBookPointerEnd, true);
  canvas.removeEventListener("lostpointercapture", onDetailBookPointerEnd, true);
  canvas.removeEventListener("pointerdown", onPagePointerDown, true);
  canvas.removeEventListener("pointermove", onPagePointerMove, true);
  canvas.removeEventListener("pointerup", onPagePointerEnd, true);
  canvas.removeEventListener("pointercancel", onPagePointerEnd, true);
  canvas.removeEventListener("lostpointercapture", onPagePointerEnd, true);
  window.removeEventListener("pointerup", onWindowPagePointerEnd);
  window.removeEventListener("pointercancel", onWindowPagePointerEnd);
  experience.removeEventListener("wheel", onWheel);
  canvas.removeEventListener("webglcontextlost", handleContextLost);
  window.removeEventListener("resize", resize);
  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("blur", onWindowBlur);
  document.removeEventListener("visibilitychange", onVisibilityChange);
  reducedMotionQuery.removeEventListener("change", onReducedMotionChange);

  controls?.dispose();
  scene?.traverse((object) => {
    object.geometry?.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.filter(Boolean).forEach((material) => {
      Object.values(material).forEach((value) => {
        if (value?.isTexture) value.dispose();
      });
      material.dispose();
    });
  });
  environmentTarget?.dispose();
  renderer?.dispose();
}
