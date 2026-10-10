"use strict";
// Math helpers, the live state of the scene, tuning numbers and shared materials.

const clamp = THREE.MathUtils.clamp;
const damp = THREE.MathUtils.damp;
const lerp = THREE.MathUtils.lerp;
const smoothstep = (value) => value * value * (3 - 2 * value);
const smootherstep = (value) => (
  value * value * value * (value * (value * 6 - 15) + 10)
);
const mod = (value, length) => ((value % length) + length) % length;
const pad = (value) => String(value).padStart(2, "0");

let reducedMotion = reducedMotionQuery.matches;
let renderer;
let scene;
let camera;
let controls;
let environmentTarget;
let shelfStage;
let bookRigs = [];
let hitTargets = [];
let rafId = 0;
let lastTime = performance.now();
let mode = "hero";
let transitionTime = 0;
let position = 0;
let targetPosition = 0;
let selectedIndex = 0;
let hoveredIndex = -1;
let wheelIdle = 0;
let focusReturnTarget = inspectButton;
let activeBook = null;
let readingOpen = false;
let detailBookHovered = false;
let currentSpread = 0;
let pointerDirty = false;
let suspended = false;
let viewWidth = window.innerWidth;
let viewHeight = window.innerHeight;
let detailViewOffsetX = 0;
let currentViewOffsetX = 0;
let detailSafeWidth = viewWidth * 0.6;
let themeInitialized = false;
let themeMoving = false;

const roomMaterials = {
  floor: null,
  wall: null,
  shelf: null,
  shelfDark: null,
  shadow: null
};
const roomLights = {
  hemisphere: null,
  key: null,
  softKey: null,
  fill: null,
  rim: null,
  backFill: null,
  spineRake: null,
  pageRake: null
};
const themeTargets = {
  floor: new THREE.Color(0xd8c8aa),
  wall: new THREE.Color(0xe9dfcb),
  shelf: new THREE.Color(0x4a2b1d),
  shelfDark: new THREE.Color(0x2a170f),
  shadow: new THREE.Color(0x2f1d13),
  fog: new THREE.Color(0xe9dfcb),
  hemisphere: new THREE.Color(0xfff8e8),
  hemisphereGround: new THREE.Color(0x5b4030),
  key: new THREE.Color(0xffe8c2),
  fill: new THREE.Color(0xd8e3e7),
  rim: new THREE.Color(0xd5a45e)
};

const pointer = {
  ndc: new THREE.Vector2(3, 3),
  clientX: 0,
  clientY: 0
};
const pageDrag = {
  active: false,
  pointerId: null,
  startX: 0,
  startY: 0,
  progress: 0,
  peakProgress: 0,
  committed: false,
  progressVelocity: 0,
  verticalBias: 0,
  lastProgress: 0,
  lastTime: 0,
  direction: 0,
  kind: null
};
const detailPress = {
  active: false,
  pointerId: null,
  startX: 0,
  startY: 0,
  moved: false,
  allowClick: false
};

const raycaster = new THREE.Raycaster();
const shelfCameraPosition = new THREE.Vector3();
const shelfCameraTarget = new THREE.Vector3();
const inspectPosition = new THREE.Vector3();
const inspectCameraPosition = new THREE.Vector3();
const inspectCameraTarget = new THREE.Vector3();
const transitionCameraTarget = new THREE.Vector3();
const openingBookPosition = new THREE.Vector3();
const openingBookQuaternion = new THREE.Quaternion();
const openingBookScale = new THREE.Vector3();
const openingMotionPosition = new THREE.Vector3();
const openingMotionQuaternion = new THREE.Quaternion();
const restingMotionPosition = new THREE.Vector3();
const restingMotionQuaternion = new THREE.Quaternion();
const openingCameraPosition = new THREE.Vector3();
const openingCameraTarget = new THREE.Vector3();
const openingShelfPosition = new THREE.Vector3();
const inspectShelfPosition = new THREE.Vector3(0, -4.2, -3);
const inspectBookQuaternion = new THREE.Quaternion().setFromEuler(
  new THREE.Euler(0.055, -0.14, 0)
);
const inspectBookScale = new THREE.Vector3();
const closingBookPosition = new THREE.Vector3();
const closingBookStartPosition = new THREE.Vector3();
const closingBookStartQuaternion = new THREE.Quaternion();
const closingBookStartScale = new THREE.Vector3();
const closingBookQuaternion = new THREE.Quaternion();
const closingBookScale = new THREE.Vector3(1.09, 1.09, 1.09);
const closingMotionPosition = new THREE.Vector3();
const closingMotionQuaternion = new THREE.Quaternion();
const closingCameraPosition = new THREE.Vector3();
const closingCameraTarget = new THREE.Vector3();
const closingShelfPosition = new THREE.Vector3();
const shelfRestPosition = new THREE.Vector3();
const scratchBox = new THREE.Box3();
const scratchVector = new THREE.Vector3();
const shelfBoardTop = 0.47;
const spacing = 1.5;
const PAGINATED_LEAF_COUNT = 4;
const SPREAD_COUNT = PAGINATED_LEAF_COUNT + 1;
const FLEXIBLE_PAGE_SEGMENTS = 18;
const FLEXIBLE_PAGE_VERTICAL_SEGMENTS = 8;
const PAGE_TURN_COMMIT_PROGRESS = 0.18;
const COVER_OPEN_COMMIT_PROGRESS = 0.16;
const COVER_CLOSE_COMMIT_PROGRESS = 0.2;
const DETAIL_TRANSITION_DURATION = 0.92;
const SHELF_TRANSITION_DURATION = 0.92;
let openingViewOffsetX = 0;
let closingViewOffsetX = 0;

const shared = {
  box: new THREE.BoxGeometry(1, 1, 1),
  plane: new THREE.PlaneGeometry(1, 1),
  page: new THREE.MeshPhysicalMaterial({
    color: 0xe7dfcf,
    roughness: 0.95,
    metalness: 0,
    sheen: 0.025,
    sheenRoughness: 1
  }),
  pageSheet: new THREE.MeshPhysicalMaterial({
    color: 0xeee6d7,
    roughness: 0.955,
    metalness: 0,
    sheen: 0.02,
    sheenRoughness: 1,
    side: THREE.DoubleSide
  }),
  headband: new THREE.MeshPhysicalMaterial({
    color: 0xc6a66d,
    roughness: 0.58,
    metalness: 0.16,
    sheen: 0.14,
    sheenRoughness: 0.76
  }),
  walnut: new THREE.MeshStandardMaterial({
    color: 0x4a2b1d,
    roughness: 0.58,
    metalness: 0
  }),
  walnutDark: new THREE.MeshStandardMaterial({
    color: 0x2a170f,
    roughness: 0.7,
    metalness: 0
  })
};

function createFadeMaterial(baseMaterial) {
  const material = baseMaterial.clone();
  material.transparent = true;
  material.opacity = 1;
  return material;
}

function hashSeed(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}
