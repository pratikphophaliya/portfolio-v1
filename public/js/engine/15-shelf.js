"use strict";
// Moving along the shelf and placing every book in its slot.

function selectMarker(index, origin) {
  if (mode !== "hero") return;
  const rounded = Math.round(targetPosition);
  const current = mod(rounded, BOOKS.length);
  let delta = index - current;
  if (delta > BOOKS.length / 2) delta -= BOOKS.length;
  if (delta < -BOOKS.length / 2) delta += BOOKS.length;
  targetPosition = rounded + delta;
  focusReturnTarget = origin;
  updateSelection(index, true);
  requestFrame();
}

function navigate(direction, origin) {
  if (mode !== "hero") return;
  targetPosition = Math.round(targetPosition) + direction;
  focusReturnTarget = origin;
  updateSelection(mod(Math.round(targetPosition), BOOKS.length), true);
  requestFrame();
}

function alignShelfToSelection() {
  const rounded = Math.round(targetPosition);
  const current = mod(rounded, BOOKS.length);
  let delta = selectedIndex - current;
  if (delta > BOOKS.length / 2) delta -= BOOKS.length;
  if (delta < -BOOKS.length / 2) delta += BOOKS.length;
  targetPosition = rounded + delta;
  position = targetPosition;
}

function snapRigToShelfSlot(rig, index) {
  let offset = index - position;
  offset -= Math.round(offset / BOOKS.length) * BOOKS.length;
  const distance = Math.abs(offset);
  const focus = 1 - clamp(distance, 0, 1);
  const fadeProgress = clamp((distance - 2.55) / 0.7, 0, 1);
  const opacity = 1 - smoothstep(fadeProgress);

  rig.root.position.set(
    offset * spacing,
    shelfBoardTop + rig.base.height * 0.5 + focus * 0.15,
    0.13 + focus * 0.24 - Math.min(distance, 2.8) * 0.07
  );
  rig.root.rotation.set(0, -offset * 0.105, -offset * 0.018);
  rig.root.scale.setScalar(1 + focus * 0.09);
  rig.motion.position.y = 0;
  rig.motion.rotation.set(0, 0, 0);
  rig.frontPivot.rotation.y = 0;
  rig.pagePivots.forEach((pagePivot) => {
    pagePivot.rotation.y = 0;
    pagePivot.rotation.z = 0;
    pagePivot.position.z = pagePivot.userData.restZ;
    updateFlexiblePage(pagePivot, 0, 0, true);
  });
  rig.opacity = opacity;
  rig.fadeMaterials.forEach((material) => {
    material.opacity = opacity;
  });
  rig.contactShadow.visible = true;
  rig.contactShadow.material.opacity = opacity * 0.24;
  rig.hit.visible = opacity > 0.12;
  rig.lastOffset = offset;
}

function updateShelfLayout(delta, elapsed) {
  if (mode === "hero") {
    position = reducedMotion
      ? targetPosition
      : damp(position, targetPosition, 9.5, delta);
    if (Math.abs(position - targetPosition) < 0.0005) position = targetPosition;

    if (wheelIdle > 0) {
      wheelIdle -= delta;
      if (wheelIdle <= 0) targetPosition = Math.round(targetPosition);
    }

    const nearest = mod(Math.round(position), BOOKS.length);
    if (nearest !== selectedIndex) updateSelection(nearest, false);
  }

  bookRigs.forEach((rig, index) => {
    if (rig.root.parent !== shelfStage) return;

    let offset = index - position;
    offset -= Math.round(offset / BOOKS.length) * BOOKS.length;
    const distance = Math.abs(offset);
    const wrappedAcrossSeam = rig.lastOffset !== null
      && Math.abs(offset - rig.lastOffset) > BOOKS.length * 0.5;
    const focus = 1 - clamp(distance, 0, 1);
    const targetX = offset * spacing;
    const targetY = shelfBoardTop + rig.base.height * 0.5 + focus * 0.15;
    const targetZ = 0.13 + focus * 0.24 - Math.min(distance, 2.8) * 0.07;
    const targetRotationY = -offset * 0.105;
    const targetRotationZ = -offset * 0.018;
    const targetScale = 1 + focus * 0.09;
    const speed = reducedMotion ? 1000 : 12;

    if (wrappedAcrossSeam) {
      rig.root.position.x = targetX;
      rig.opacity = 0;
    }
    rig.lastOffset = offset;

    rig.root.position.x = damp(rig.root.position.x, targetX, speed, delta);
    rig.root.position.y = damp(rig.root.position.y, targetY, speed, delta);
    rig.root.position.z = damp(rig.root.position.z, targetZ, speed, delta);
    rig.root.rotation.y = damp(rig.root.rotation.y, targetRotationY, speed, delta);
    rig.root.rotation.z = damp(rig.root.rotation.z, targetRotationZ, speed, delta);
    const nextScale = damp(rig.root.scale.x, targetScale, speed, delta);
    rig.root.scale.setScalar(nextScale);

    const fadeProgress = clamp((distance - 2.55) / 0.7, 0, 1);
    const targetOpacity = 1 - smoothstep(fadeProgress);
    rig.opacity = reducedMotion
      ? targetOpacity
      : damp(rig.opacity, targetOpacity, 18, delta);
    rig.fadeMaterials.forEach((material) => {
      material.opacity = rig.opacity;
    });
    rig.contactShadow.visible = true;
    rig.contactShadow.material.opacity = rig.opacity * 0.24;
    rig.hit.visible = rig.opacity > 0.12;

    const isHovered = hoveredIndex === index && mode === "hero";
    const hoverPreview = isHovered && !reducedMotion;
    const hoverAngle = hoverPreview ? -0.085 : 0;
    rig.frontPivot.rotation.y = damp(
      rig.frontPivot.rotation.y,
      hoverAngle,
      reducedMotion ? 1000 : 13,
      delta
    );
    rig.pagePivots.forEach((pagePivot) => {
      pagePivot.rotation.y = damp(
        pagePivot.rotation.y,
        0,
        reducedMotion ? 1000 : 13,
        delta
      );
      pagePivot.rotation.z = damp(
        pagePivot.rotation.z,
        0,
        reducedMotion ? 1000 : 13,
        delta
      );
      updateFlexiblePage(pagePivot, 0, delta);
    });

    const idle = reducedMotion ? 0 : Math.sin(elapsed * 0.72 + index * 0.8) * 0.012 * focus;
    rig.motion.position.y = damp(rig.motion.position.y, idle + (hoverPreview ? 0.035 : 0), 9, delta);
    rig.motion.rotation.x = damp(
      rig.motion.rotation.x,
      hoverPreview ? pointer.ndc.y * 0.035 : 0,
      10,
      delta
    );
    rig.motion.rotation.y = damp(
      rig.motion.rotation.y,
      hoverPreview ? -pointer.ndc.x * 0.035 : 0,
      10,
      delta
    );
  });
}
