import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';

import { LandscapeMeshTest } from './mesh';
import { Landscape } from './landscape';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { Center } from './center';

export function init() {
  let debug_view = false;

  const root = document.getElementById('canvas-root') as HTMLElement; // iuuu

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xb8dbf5);
  const user_camera = new THREE.PerspectiveCamera(
    30,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  const debug_camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  const renderer = new THREE.WebGLRenderer({ antialias: false });
  renderer.localClippingEnabled = true;
  renderer.setSize(window.innerWidth, window.innerHeight);
  root.appendChild(renderer.domElement);

  user_camera.position.set(-1, 20, -1);
  user_camera.lookAt(new THREE.Vector3());

  debug_camera.position.set(-1, -1, 20);
  debug_camera.lookAt(new THREE.Vector3());

  const user_controls = new MapControls(user_camera, renderer.domElement);
  user_controls.enabled = !debug_view;

  // controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  user_controls.dampingFactor = 0.05;
  user_controls.screenSpacePanning = false;
  user_controls.minDistance = 30;
  user_controls.maxDistance = 50;
  user_controls.maxPolarAngle = Math.PI / 4;
  user_controls.enableRotate = true;
  user_controls.enableZoom = true;

  user_controls.panSpeed = 5;

  user_controls.update();

  const debug_controls = new MapControls(debug_camera, renderer.domElement);
  debug_controls.enabled = debug_view;

  // controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  debug_controls.dampingFactor = 0.05;
  debug_controls.screenSpacePanning = false;
  debug_controls.minDistance = 4;
  debug_controls.maxDistance = 500;
  debug_controls.maxPolarAngle = Math.PI / 2;
  debug_controls.enableRotate = true;
  debug_controls.enableZoom = true;

  debug_controls.panSpeed = 5;

  debug_controls.update();

  const axes = new THREE.AxesHelper(20);
  scene.add(axes);

  window.addEventListener('keydown', (ev) => {
    switch (ev.key) {
      case 'Q':
        debug_view = !debug_view;
        debug_controls.enabled = debug_view;
        user_controls.enabled = !debug_view;
        break;

      default:
        break;
    }
  });

  // const landscape = new LandscapeMeshTest(scene, camera);

  // const tiles = [
  //   new Landscape(scene, renderer, 2665, 1210),
  //   new Landscape(scene, renderer, 2666, 1210),
  //   new Landscape(scene, renderer, 2665, 1211),
  //   new Landscape(scene, renderer, 2666, 1211)
  // ];

  // 2668 1202 2680 1210

  const from_x = 2658;
  const to_x = 2668;
  const from_y = 1191;
  const to_y = 1201;

  Landscape.set_base_coords(from_x, from_y);
  const center = new Center(scene, user_camera, renderer, user_controls);

  Landscape.center = center.root;

  for (let x = from_x; x < to_x; x++) {
    for (let y = from_y; y < to_y; y++) {
      new Landscape(scene, renderer, x, y);
    }
  }

  function animate() {
    requestAnimationFrame(animate);

    if (debug_view) {
      debug_controls.update();
      renderer.render(scene, debug_camera);
    } else {
      user_controls.update();
      renderer.render(scene, user_camera);
    }
    // landscape.update(camera);
  }

  animate();
}
