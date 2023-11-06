import * as THREE from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

export class Center {
  public root: THREE.Object3D;

  constructor(
    scene: THREE.Object3D,
    camera: THREE.Camera,
    renderer: THREE.WebGLRenderer,
    orbit_controls: OrbitControls
  ) {
    const geometry = new THREE.BoxGeometry(0.5, 20, 0.5);
    const material = new THREE.MeshNormalMaterial();

    this.root = new THREE.Mesh(geometry, material);
    scene.add(this.root);

    const transform_controls = new TransformControls(camera, renderer.domElement);
    transform_controls.attach(this.root);
    scene.add(transform_controls);

    transform_controls.showY = false;

    transform_controls.addEventListener('dragging-changed', function (event) {
      orbit_controls.enabled = !event.value;
    });
  }
}
