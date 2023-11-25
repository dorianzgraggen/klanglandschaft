import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';

import { Landscape } from './landscape';
import { Center } from './center';
import { BG_COLOR, DEBUG_LAYER } from './consts';
import { bridge } from '@/bridge';
import type { Ref } from 'vue';

export function init(settings: Ref<{ editor_open: boolean }>) {
  let debug_view = false;
  let debug_panels = false;

  if (new URLSearchParams(window.location.search).get('debug') !== null) {
    debug_panels = set_debug_panels(true);
  }

  const debug_info = document.querySelector('#debug-info')!;

  const root = document.getElementById('canvas-root') as HTMLElement; // iuuu

  const scene = new THREE.Scene();
  scene.background = BG_COLOR;

  // USER CAMERA
  const user_camera = new THREE.PerspectiveCamera(
    30,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  user_camera.layers.disable(DEBUG_LAYER);

  user_camera.position.set(-1, 20, -1);
  user_camera.lookAt(new THREE.Vector3());

  // DEBUG CAMERA
  const debug_camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  debug_camera.layers.enable(DEBUG_LAYER);

  // RENDERER
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.localClippingEnabled = true;
  renderer.setSize(window.innerWidth, window.innerHeight);
  root.appendChild(renderer.domElement);

  const renderer_data = new THREE.WebGLRenderer();
  renderer_data.setSize(100, 100);
  document.body.appendChild(renderer_data.domElement);
  renderer_data.domElement.classList.add('renderer-data', 'debug');
  // renderer_data.outputColorSpace = THREE.LinearSRGBColorSpace;

  const rt = new THREE.WebGLRenderTarget(100, 100);

  // USER MAP CONTROLS
  const user_controls = new MapControls(user_camera, renderer.domElement);
  user_controls.enabled = !debug_view;
  user_controls.dampingFactor = 0.05;
  user_controls.screenSpacePanning = false;
  user_controls.minDistance = 30;
  user_controls.maxDistance = 80;
  user_controls.maxPolarAngle = Math.PI / 4;
  user_controls.enableRotate = true;
  user_controls.enableZoom = true;
  user_controls.zoomSpeed = 0.3;
  user_controls.panSpeed = 1;
  user_controls.target.set(82, 0, -200); // center camera at lucerne train station

  user_controls.update();

  // DEBUG CONTROLS - You can switch to a debug view using Shift + Y and
  // center the camera around the user's target using Shift + X.
  const debug_controls = new MapControls(debug_camera, renderer.domElement);
  debug_controls.enabled = debug_view;
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

  // KEYBOARD STUFF
  window.addEventListener('keydown', (ev) => {
    switch (ev.key) {
      case 'Y':
        debug_view = !debug_view;
        debug_controls.enabled = debug_view;
        user_controls.enabled = !debug_view;
        break;

      case 'X':
        debug_controls.target.copy(center.root.position);
        debug_camera.position.copy(user_camera.position);
        debug_controls.update();
        break;

      case 'D': {
        debug_panels = set_debug_panels(!debug_panels);
        break;
      }

      default:
        break;
    }
  });

  // LANDSCAPE TILES SETUP
  const from_x = 2658;
  const to_x = 2694;
  const from_y = 1191;
  const to_y = 1217;

  Landscape.set_base_coords(from_x, from_y);
  const center = new Center(scene, debug_camera, renderer, user_controls);
  Landscape.center = center.root;

  for (let x = from_x; x < to_x; x++) {
    for (let y = from_y; y < to_y; y++) {
      new Landscape(scene, renderer, x, y);
    }
  }

  renderer_data.setRenderTarget(rt);

  // RENDER LOOP
  const pixels = new Uint8Array(100 * 100 * 4);
  let previous_time = 0;

  function animate(time: number) {
    requestAnimationFrame(animate);

    if (settings.value.editor_open) {
      return;
    }

    const delta_ms = time - previous_time;
    const fps = 1000 / delta_ms;
    previous_time = time;

    Landscape.data_mode = false;

    debug_controls.update();
    user_controls.update();
    center.update(user_controls, debug_view);

    if (debug_view) {
      renderer.render(scene, debug_camera);
    } else {
      renderer.render(scene, user_camera);
    }

    Landscape.data_mode = true;

    if (debug_panels) {
      // render data view to canvas (for debugging)
      renderer_data.setRenderTarget(null);
      renderer_data.render(scene, user_camera);
    }
    // render data view to render texture (for reading pixels)
    renderer_data.setRenderTarget(rt);
    renderer_data.render(scene, user_camera);

    renderer_data.readRenderTargetPixels(rt, 0, 0, 100, 100, pixels);

    let r = 0;
    let g = 0;
    let b = 0;
    let a = 0;

    pixels.forEach((pixel, i) => {
      switch (i % 4) {
        case 0:
          r += pixel;
          break;

        case 1:
          g += pixel;
          break;

        case 2:
          b += pixel;
          break;

        case 3:
          a += pixel;
          break;

        default:
          break;
      }
    });

    r = r / (100 * 100) / 255;
    g = g / (100 * 100) / 255;
    b = b / (100 * 100) / 255;
    a = a / (100 * 100) / 255;
    // console.log(`r:${r} g:${g} b:${b} a:${a}`);

    bridge.elevation = r;
    bridge.traffic_noise = g;

    debug_info.children[1].innerHTML = (Math.round(r * 1000) / 1000).toString();
    debug_info.children[2].innerHTML = (Math.round(g * 1000) / 1000).toString();
    debug_info.children[3].innerHTML = (Math.round(b * 1000) / 1000).toString();
    debug_info.children[4].innerHTML = (Math.round(a * 1000) / 1000).toString();
    let heap = 0;

    // @ts-ignore
    if (typeof performance.memory !== 'undefined') {
      // @ts-ignore
      heap = performance.memory.usedJSHeapSize / 1_000_000;
    }

    debug_info.children[0].innerHTML = `
      <strong>memory:</strong>
      textures: ${renderer.info.memory.textures}
      geometries: ${renderer.info.memory.geometries}
      heap: ${Math.round(heap)} mb
      | <strong>frame:</strong>
      calls: ${renderer.info.render.calls}
      triangles: ${renderer.info.render.triangles}
      fps: ${Math.round(fps)}
    `;
  }

  animate(0);
}

function set_debug_panels(on: boolean) {
  const dso = document.getElementById('debug-style-off') as any;
  dso.disabled = on;
  return on;
}
