import * as THREE from 'three';
import type { MapControls } from 'three/examples/jsm/controls/MapControls.js';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { DEBUG_LAYER, DEFAULT_LAYER } from './consts';

export class Center {
  public root: THREE.Object3D;
  private transform_controls: TransformControls;

  constructor(
    scene: THREE.Object3D,
    camera: THREE.Camera,
    renderer: THREE.WebGLRenderer,
    orbit_controls: OrbitControls
  ) {
    const geometry = new THREE.BoxGeometry(0.5, 20, 0.5);
    const material = new THREE.MeshNormalMaterial();

    this.root = new THREE.Mesh(geometry, material);
    this.root.layers.enable(DEBUG_LAYER);
    this.root.layers.disable(DEFAULT_LAYER);
    scene.add(this.root);

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
  }
}
