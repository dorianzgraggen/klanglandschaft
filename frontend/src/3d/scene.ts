import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';

import { LandscapeMeshTest } from './mesh';
import { Landscape } from './landscape';

export function init() {
  const root = document.getElementById('canvas-root') as HTMLElement; // iuuu

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x2222222);
  scene.background = new THREE.Color(0xffaa44);
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.localClippingEnabled = true;
  renderer.setSize(window.innerWidth, window.innerHeight);
  root.appendChild(renderer.domElement);

  camera.position.z = -1;
  camera.position.x = -1;
  camera.position.y = 1;
  camera.lookAt(new THREE.Vector3());

  const controls = new MapControls(camera, renderer.domElement);

  // controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  controls.dampingFactor = 0.05;

  controls.screenSpacePanning = false;

  controls.minDistance = 4;
  controls.maxDistance = 500;

  controls.maxPolarAngle = Math.PI / 2;
  controls.enableRotate = true;
  controls.enableZoom = true;

  controls.panSpeed = 5;

  controls.update();

  const axes = new THREE.AxesHelper(20);
  scene.add(axes);

  // const landscape = new LandscapeMeshTest(scene, camera);

  const tiles = [
    new Landscape(scene, renderer, 2665, 1210),
    new Landscape(scene, renderer, 2666, 1210),
    new Landscape(scene, renderer, 2665, 1211),
    new Landscape(scene, renderer, 2666, 1211)
  ];

  function animate() {
    requestAnimationFrame(animate);

    controls.update();
    // landscape.update(camera);

    renderer.render(scene, camera);
  }

  animate();
}
