// Loads Three.js (the 3D library) and hands it to the engine files, which run right after this.
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";

Object.assign(window, {
  THREE,
  OrbitControls,
  RoomEnvironment,
  RoundedBoxGeometry,
  RectAreaLightUniformsLib
});
