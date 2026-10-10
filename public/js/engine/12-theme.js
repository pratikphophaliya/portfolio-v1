"use strict";
// Room and interface colors that change with the selected book.

function setThemeColorsImmediately() {
  roomMaterials.floor?.color.copy(themeTargets.floor);
  roomMaterials.wall?.color.copy(themeTargets.wall);
  roomMaterials.shelf?.color.copy(themeTargets.shelf);
  roomMaterials.shelfDark?.color.copy(themeTargets.shelfDark);
  roomMaterials.shadow?.color.copy(themeTargets.shadow);
  scene?.fog?.color.copy(themeTargets.fog);
  roomLights.hemisphere?.color.copy(themeTargets.hemisphere);
  roomLights.hemisphere?.groundColor.copy(themeTargets.hemisphereGround);
  roomLights.key?.color.copy(themeTargets.key);
  roomLights.softKey?.color.copy(themeTargets.key);
  roomLights.fill?.color.copy(themeTargets.fill);
  roomLights.rim?.color.copy(themeTargets.rim);
  roomLights.backFill?.color.copy(themeTargets.fill);
  roomLights.spineRake?.color.copy(themeTargets.key);
  roomLights.pageRake?.color.copy(themeTargets.hemisphere);
  themeMoving = false;
}

function applyBookTheme(book) {
  const palette = book.palette;
  const rootStyle = document.documentElement.style;
  rootStyle.setProperty("--paper", palette.paper);
  rootStyle.setProperty("--paper-deep", palette.paperDeep);
  rootStyle.setProperty("--paper-pale", palette.paperPale);
  rootStyle.setProperty("--ink", palette.ink);
  rootStyle.setProperty("--ink-soft", palette.inkSoft);
  rootStyle.setProperty("--walnut", palette.shelf);
  rootStyle.setProperty("--walnut-deep", palette.shelfDark);
  rootStyle.setProperty("--rule", `color-mix(in srgb, ${palette.ink} 24%, transparent)`);
  rootStyle.setProperty("--accent", book.foil);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", palette.paper);

  themeTargets.floor.set(palette.paperDeep);
  themeTargets.wall.set(palette.wall);
  themeTargets.shelf.set(palette.shelf);
  themeTargets.shelfDark.set(palette.shelfDark);
  themeTargets.shadow.set(palette.shelfDark);
  themeTargets.fog.set(palette.wall);
  themeTargets.hemisphere.set(palette.paperPale);
  themeTargets.hemisphereGround.set(palette.shelf);
  themeTargets.key.set(palette.light);
  themeTargets.fill.set(palette.fill);
  themeTargets.rim.set(book.foil);

  if (!themeInitialized || reducedMotion) {
    themeInitialized = true;
    setThemeColorsImmediately();
  } else {
    themeMoving = true;
    requestFrame();
  }
}

function updateTheme(delta) {
  if (!themeMoving) return false;
  const amount = 1 - Math.exp(-delta * 5.5);
  let largestGap = 0;
  const easeColor = (current, target) => {
    if (!current) return;
    const redGap = current.r - target.r;
    const greenGap = current.g - target.g;
    const blueGap = current.b - target.b;
    largestGap = Math.max(
      largestGap,
      redGap * redGap + greenGap * greenGap + blueGap * blueGap
    );
    current.lerp(target, amount);
  };

  easeColor(roomMaterials.floor?.color, themeTargets.floor);
  easeColor(roomMaterials.wall?.color, themeTargets.wall);
  easeColor(roomMaterials.shelf?.color, themeTargets.shelf);
  easeColor(roomMaterials.shelfDark?.color, themeTargets.shelfDark);
  easeColor(roomMaterials.shadow?.color, themeTargets.shadow);
  easeColor(scene?.fog?.color, themeTargets.fog);
  easeColor(roomLights.hemisphere?.color, themeTargets.hemisphere);
  easeColor(roomLights.hemisphere?.groundColor, themeTargets.hemisphereGround);
  easeColor(roomLights.key?.color, themeTargets.key);
  easeColor(roomLights.softKey?.color, themeTargets.key);
  easeColor(roomLights.fill?.color, themeTargets.fill);
  easeColor(roomLights.rim?.color, themeTargets.rim);
  easeColor(roomLights.backFill?.color, themeTargets.fill);
  easeColor(roomLights.spineRake?.color, themeTargets.key);
  easeColor(roomLights.pageRake?.color, themeTargets.hemisphere);

  if (largestGap < 0.0000025) {
    setThemeColorsImmediately();
  }
  return themeMoving;
}
