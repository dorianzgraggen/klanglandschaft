import * as THREE from 'three';
import type { MapControls } from 'three/examples/jsm/controls/MapControls.js';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { DEBUG_LAYER, DEFAULT_LAYER } from './consts';
import vertexShader from './box.vert.glsl?raw';
import fragmentShader from './box.frag.glsl?raw';

/**
 * Center is an object that always moves to the user controls' orbit target,
 * it is only visible in debug view, which is handy, because sometimes you need
 * to check where the user is looking at.
 */
export class Center {
  public root: THREE.Object3D;
  private transform_controls: TransformControls;

  constructor(
    scene: THREE.Object3D,
    camera: THREE.Camera,
    renderer: THREE.WebGLRenderer,
    orbit_controls: OrbitControls
  ) {
    const width = 40;
    const geometry = new THREE.BoxGeometry(width, width, width);
    const material = new THREE.ShaderMaterial({fragmentShader, vertexShader, transparent: true, side: THREE.DoubleSide, blending: THREE.NormalBlending})

    this.root = new THREE.Mesh(geometry, material);
    this.root.layers.enable(DEBUG_LAYER);
    // this.root.layers.disable(DEFAULT_LAYER);
    scene.add(this.root);

    // const cmaterial = material.clone();
    // cmaterial.side = THREE.BackSide;
    // const clone = new THREE.Mesh(geometry, cmaterial);;
    // scene.add(clone);

    const transform_controls = new TransformControls(camera, renderer.domElement);
    transform_controls.attach(this.root);
    transform_controls.showY = false;
    scene.add(transform_controls);

    transform_controls.addEventListener('dragging-changed', function (event) {
      orbit_controls.enabled = !event.value;
    });

    this.transform_controls = transform_controls;
  }

  update(controls: MapControls, debug_view: boolean) {
    this.root.position.copy(controls.target);

    // for some reason layers don't seem to work on the gizmos
    this.transform_controls.visible = debug_view;
    this.transform_controls.enabled = debug_view;
  }
}
