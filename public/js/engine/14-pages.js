"use strict";
// Opening the book, turning pages and the bend of each sheet.

function setReadingOpen(open, announce = true) {
  if (mode !== "detail" || readingOpen === open) return;
  cancelPageDrag();
  readingOpen = open;
  if (!readingOpen) currentSpread = 0;
  canvas.classList.remove("has-page-hover", "has-closed-book-hover");
  updatePageControls(false);
  pointerDirty = true;

  if (announce && activeBook) {
    liveRegion.textContent = readingOpen
      ? `${activeBook.data.title} opened to its title page. Drag a page horizontally or use the arrow controls to read.`
      : `${activeBook.data.title} closed. Drag the cover, click the book, or use Open book to begin reading.`;
  }
  requestFrame();
}

function turnPage(direction) {
  if (mode !== "detail" || !readingOpen) return;
  const nextSpread = clamp(
    currentSpread + direction,
    0,
    SPREAD_COUNT - 1
  );
  if (nextSpread === currentSpread) return;
  currentSpread = nextSpread;
  updatePageControls(true);
  requestFrame();
}

function updateFlexiblePage(
  pagePivot,
  targetCurve,
  delta,
  immediate = false,
  targetTwist = 0
) {
  const flex = pagePivot.userData.flex;
  if (!flex) return;
  const settleImmediately = immediate || reducedMotion;
  const step = Math.min(delta, 0.033);
  let nextCurve = targetCurve;
  let nextTwist = targetTwist;

  if (settleImmediately) {
    flex.curveVelocity = 0;
    flex.twistVelocity = 0;
  } else {
    const curveAcceleration = (
      (targetCurve - flex.curve) * 178
      - flex.curveVelocity * 19
    );
    const twistAcceleration = (
      (targetTwist - flex.twist) * 210
      - flex.twistVelocity * 21
    );
    flex.curveVelocity = clamp(
      flex.curveVelocity + curveAcceleration * step,
      -1.8,
      1.8
    );
    flex.twistVelocity = clamp(
      flex.twistVelocity + twistAcceleration * step,
      -1.6,
      1.6
    );
    nextCurve = clamp(
      flex.curve + flex.curveVelocity * step,
      -0.025,
      0.19
    );
    nextTwist = clamp(
      flex.twist + flex.twistVelocity * step,
      -0.12,
      0.12
    );

    if (
      Math.abs(targetCurve - nextCurve) < 0.00002
      && Math.abs(flex.curveVelocity) < 0.0008
    ) {
      nextCurve = targetCurve;
      flex.curveVelocity = 0;
    }
    if (
      Math.abs(targetTwist - nextTwist) < 0.00002
      && Math.abs(flex.twistVelocity) < 0.0008
    ) {
      nextTwist = targetTwist;
      flex.twistVelocity = 0;
    }
  }

  if (
    !settleImmediately
    && Math.abs(nextCurve - flex.curve) < 0.00001
    && Math.abs(targetCurve - nextCurve) < 0.00001
    && Math.abs(nextTwist - flex.twist) < 0.00001
    && Math.abs(targetTwist - nextTwist) < 0.00001
  ) return;

  flex.curve = nextCurve;
  flex.twist = nextTwist;
  flex.surfaces.forEach((surface) => {
    const { position, base, direction, geometry } = surface;
    for (let vertex = 0; vertex < position.count; vertex += 1) {
      const offset = vertex * 3;
      const x = base[offset];
      const y = base[offset + 1];
      const u = x + 0.5;
      const mappedU = direction > 0 ? u : 1 - u;
      const arch = Math.sin(Math.PI * mappedU);
      const freeEdgeLift = mappedU * mappedU * 0.16;
      const shape = arch * 0.84 + freeEdgeLift;
      const diagonalTwist = (
        nextTwist
        * y
        * Math.pow(mappedU, 1.35)
      );
      const softRipple = (
        nextTwist
        * Math.sin(mappedU * Math.PI * 2)
        * (1 - Math.min(1, Math.abs(y) * 1.65))
        * 0.09
      );
      const z = (
        nextCurve * shape * (1 + y * 0.14)
        + diagonalTwist
        + softRipple
      ) * direction;
      position.setXYZ(vertex, x, y, z);
    }
    position.needsUpdate = true;
    geometry.computeVertexNormals();
  });
}

function updatePaginatedBook(rig, delta, openAmount = 1) {
  const amount = clamp(openAmount, 0, 1);
  const speed = reducedMotion ? 1000 : 10.5;
  const hoverCrack = (
    mode === "detail"
    && !readingOpen
    && detailBookHovered
    && !reducedMotion
  ) ? -0.16 : 0;
  const coverTarget = amount > 0
    ? (-Math.PI + 0.055) * amount
    : hoverCrack;

  rig.frontPivot.rotation.y = damp(
    rig.frontPivot.rotation.y,
    coverTarget,
    speed,
    delta
  );

  rig.pagePivots.forEach((pagePivot, pageIndex) => {
    const leafOrder = rig.pagePivots.length - 1 - pageIndex;
    let pageTarget = 0;
    let positionTarget = pagePivot.userData.restZ;
    let pageTwistTarget = 0;
    let dragCurveBoost = 0;
    let flexTwistTarget = 0;

    if (leafOrder < PAGINATED_LEAF_COUNT) {
      const isTurned = leafOrder < currentSpread;
      const unturnedTarget = -0.038 + leafOrder * 0.008;
      const turnedTarget = -Math.PI + 0.085 + leafOrder * 0.014;
      pageTarget = isTurned ? turnedTarget : unturnedTarget;
      positionTarget = isTurned
        ? pagePivot.userData.turnedZ
        : pagePivot.userData.restZ;

      if (pageDrag.active && pageDrag.direction !== 0) {
        const dragLeafOrder = pageDrag.direction > 0
          ? currentSpread
          : currentSpread - 1;
        if (leafOrder === dragLeafOrder) {
          const dragProgress = smoothstep(pageDrag.progress);
          const dragEnvelope = Math.sin(Math.PI * dragProgress);
          const speedResponse = clamp(
            Math.abs(pageDrag.progressVelocity) / 5.5,
            0,
            1
          );
          const signedSpeed = clamp(
            pageDrag.progressVelocity / 5.5,
            -1,
            1
          );
          pageTarget = pageDrag.direction > 0
            ? lerp(unturnedTarget, turnedTarget, dragProgress)
            : lerp(turnedTarget, unturnedTarget, dragProgress);
          positionTarget = pageDrag.direction > 0
            ? lerp(pagePivot.userData.restZ, pagePivot.userData.turnedZ, dragProgress)
            : lerp(pagePivot.userData.turnedZ, pagePivot.userData.restZ, dragProgress);
          pageTwistTarget = pageDrag.direction
            * dragEnvelope
            * (0.014 + pageDrag.verticalBias * 0.026);
          dragCurveBoost = dragEnvelope * (
            0.032
            + speedResponse * 0.064
          );
          flexTwistTarget = dragEnvelope * (
            pageDrag.verticalBias * 0.08
            + signedSpeed * pageDrag.direction * 0.03
          );
        }
      }

      pagePivot.position.z = damp(
        pagePivot.position.z,
        pagePivot.userData.restZ
          + (positionTarget - pagePivot.userData.restZ) * amount,
        speed,
        delta
      );
    } else {
      pageTarget = -0.006 + (leafOrder - PAGINATED_LEAF_COUNT) * 0.003;
      pagePivot.position.z = damp(
        pagePivot.position.z,
        pagePivot.userData.restZ,
        speed,
        delta
      );
    }

    pagePivot.rotation.y = damp(
      pagePivot.rotation.y,
      pageTarget * amount,
      speed,
      delta
    );
    pagePivot.rotation.z = damp(
      pagePivot.rotation.z,
      pageTwistTarget * amount,
      speed,
      delta
    );
    const turnProgress = clamp(
      Math.abs(pagePivot.rotation.y) / Math.PI,
      0,
      1
    );
    const curveTarget = amount > 0
      ? amount * (
          0.004
          + Math.sin(Math.PI * turnProgress) * 0.082
          + dragCurveBoost
        )
      : 0;
    updateFlexiblePage(
      pagePivot,
      curveTarget,
      delta,
      false,
      flexTwistTarget * amount
    );
  });
}
