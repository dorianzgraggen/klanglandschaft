import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';

import { LandscapeMeshTest } from './mesh';

export function init() {
  const root = document.getElementById('canvas-root') as HTMLElement; // iuuu

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x2222222);
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  const renderer = new THREE.WebGLRenderer();
  renderer.localClippingEnabled = true;
  renderer.setSize(window.innerWidth, window.innerHeight);
  root.appendChild(renderer.domElement);

  const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  camera.position.z = -1;
  camera.position.x = -1;
  camera.position.y = 1;
  camera.lookAt(new THREE.Vector3());

  const controls = new MapControls(camera, renderer.domElement);

  // controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  controls.dampingFactor = 0.05;

  controls.screenSpacePanning = false;

  controls.minDistance = 10;
  controls.maxDistance = 500;

  controls.maxPolarAngle = Math.PI / 2;
  controls.enableRotate = false;
  controls.enableZoom = false;

  controls.panSpeed = 5;

  controls.update();

  const axes = new THREE.AxesHelper(20);
  scene.add(axes);

  const landscape = new LandscapeMeshTest(scene, camera);

  function animate() {
    requestAnimationFrame(animate);

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    controls.update();
    landscape.update(camera);

    renderer.render(scene, camera);
  }

  animate();
}
