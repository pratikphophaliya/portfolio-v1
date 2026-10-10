"use strict";
// Start-up: creates the scene and connects every event.

async function initialize() {
  const woodTexturePromise = woodTextureImage.decode().then(
    () => true,
    () => false
  );

  try {
    await document.fonts.load("600 82px Inter");
  } catch (error) {
    // The system sans-serif fallback keeps the interface usable offline.
  }

  try {
    await coverAtlasImage.decode();
    coverAtlasReady = true;
  } catch (error) {
    coverAtlasReady = false;
  }

  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
  } catch (error) {
    showFallback("WebGL is unavailable in this browser. The complete static catalog remains available.");
    return;
  }

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x000000, 0);

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xe9dfcb, 0.027);
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  environmentTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = environmentTarget.texture;
  scene.environmentIntensity = 0.72;
  pmremGenerator.dispose();

  camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
  shelfStage = new THREE.Group();
  shelfStage.name = "continuous-shelf-stage";
  scene.add(shelfStage);

  configureResponsiveTargets();
  camera.position.copy(shelfCameraPosition);
  camera.lookAt(shelfCameraTarget);

  controls = new OrbitControls(camera, canvas);
  controls.enabled = false;
  controls.enableDamping = !reducedMotion;
  controls.dampingFactor = 0.075;
  controls.enablePan = true;
  controls.screenSpacePanning = true;
  controls.minDistance = 2.8;
  controls.maxDistance = 7.2;
  controls.minPolarAngle = Math.PI * 0.24;
  controls.maxPolarAngle = Math.PI * 0.76;
  controls.target.copy(shelfCameraTarget);
  controls.addEventListener("change", requestFrame);

  RectAreaLightUniformsLib.init();
  addRoom();
  addLights();
  buildMarkers();

  bookRigs = BOOKS.map((book, index) => {
    const rig = createBookRig(book, index);
    shelfStage.add(rig.root);
    return rig;
  });

  updateSelection(0, true);
  resize();

  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerleave", onPointerLeave);
  canvas.addEventListener("click", onCanvasClick);
  canvas.addEventListener("pointerdown", onDetailBookPointerDown, { capture: true });
  canvas.addEventListener("pointermove", onDetailBookPointerMove, { capture: true });
  canvas.addEventListener("pointerup", onDetailBookPointerEnd, { capture: true });
  canvas.addEventListener("pointercancel", onDetailBookPointerEnd, { capture: true });
  canvas.addEventListener("lostpointercapture", onDetailBookPointerEnd, { capture: true });
  canvas.addEventListener("pointerdown", onPagePointerDown, { capture: true });
  canvas.addEventListener("pointermove", onPagePointerMove, { capture: true });
  canvas.addEventListener("pointerup", onPagePointerEnd, { capture: true });
  canvas.addEventListener("pointercancel", onPagePointerEnd, { capture: true });
  canvas.addEventListener("lostpointercapture", onPagePointerEnd, { capture: true });
  window.addEventListener("pointerup", onWindowPagePointerEnd);
  window.addEventListener("pointercancel", onWindowPagePointerEnd);
  experience.addEventListener("wheel", onWheel, { passive: false });
  canvas.addEventListener("webglcontextlost", handleContextLost);
  window.addEventListener("resize", resize);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("blur", onWindowBlur);
  document.addEventListener("visibilitychange", onVisibilityChange);
  reducedMotionQuery.addEventListener("change", onReducedMotionChange);

  previousButton.addEventListener("click", () => navigate(-1, previousButton));
  nextButton.addEventListener("click", () => navigate(1, nextButton));
  inspectButton.addEventListener("click", () => openDetail(inspectButton));
  closeButton.addEventListener("click", closeDetail);
  toggleBookButton.addEventListener("click", () => setReadingOpen(!readingOpen));
  previousPageButton.addEventListener("click", () => turnPage(-1));
  nextPageButton.addEventListener("click", () => turnPage(1));
  resetButton.addEventListener("click", resetInspectionView);

  renderer.render(scene, camera);
  loading.hidden = true;
  experience.classList.add("webgl-ready");
  requestFrame();

  woodTexturePromise.then((ready) => {
    if (!ready || suspended || !renderer) return;
    woodTextureReady = true;
    applyWoodTexture();
  });
}

initialize().catch(() => {
  showFallback("The interactive shelf could not be prepared. The complete static catalog remains available.");
});
window.addEventListener("beforeunload", disposeExperience, { once: true });
