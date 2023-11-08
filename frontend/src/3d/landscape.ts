import * as THREE from 'three';
import vertexShader from './landscape.vert.glsl?raw';
import fragmentShader from './landscape.frag.glsl?raw';
import { TIFFLoader } from 'three/examples/jsm/loaders/TIFFLoader.js';

export class Landscape {
  mesh: THREE.Mesh;

  private static base_x = 2665;
  private static base_y = 1210;

  public static center = new THREE.Object3D();

  private download_state: 'empty' | 'loading' | 'loaded' = 'empty';
  private visible = false;

  private static empty_material = new THREE.MeshBasicMaterial({ color: 0x334433 });

  private landscape_material = new THREE.ShaderMaterial({ fragmentShader, vertexShader });

  static set_base_coords(x: number, y: number) {
    this.base_x = x;
    this.base_y = y;
  }

  constructor(
    private scene: THREE.Scene,
    renderer: THREE.WebGLRenderer,
    private x = 2665,
    private y = 1210
  ) {
    const segments = 6;

    const geometry = new THREE.PlaneGeometry(10, 10, segments, segments);
    // geometry.scale(0.9, 0.9, 0.9);

    geometry.rotateX(-Math.PI / 2);

    this.mesh = new THREE.Mesh(geometry, Landscape.empty_material);
    this.mesh.position.x = -(Landscape.base_x - x) * 10;
    this.mesh.position.z = (Landscape.base_y - y) * 10;

    scene.add(this.mesh);

    const interval = 100;
    setTimeout(() => {
      setInterval(() => {
        this.handle_visibility();
      }, interval);
    }, Math.random() * interval);
  }

  private handle_visibility() {
    const distance = Landscape.center.position.distanceToSquared(this.mesh.position);
    const should_be_visible = distance < Math.pow(60, 2);

    if (should_be_visible && !this.visible) {
      this.show();
    }

    if (!should_be_visible && this.visible) {
      this.mesh.material = Landscape.empty_material;
      this.visible = false;
    }
  }

  // downloads textures and creates material if it doesn't exist yet
  async show() {
    this.visible = true;

    if (this.download_state == 'loading') {
      return;
    }

    if (this.download_state == 'loaded') {
      this.mesh.material = this.landscape_material;
      return;
    }

    this.download_state = 'loading';

    const texture = await new THREE.TextureLoader().loadAsync(
      `http://${window.location.host.split(':')[0]}:8080/data/geotiff/extended/${this.x}-${
        this.y
      }.png`
    );

    texture.generateMipmaps = false;
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;

    const tiff = await new TIFFLoader().loadAsync(
      `http://${window.location.host.split(':')[0]}:8080/data/geotiff/satellite/${this.x}-${
        this.y
      }.tif`
    );
    tiff.colorSpace = THREE.LinearSRGBColorSpace;

    this.landscape_material.uniforms = {
      u_height: { value: texture },
      u_satellite: { value: tiff },
      u_center: { value: Landscape.center.position },
      u_background: { value: this.scene.background }
    };

    this.mesh.material = this.landscape_material;
    this.download_state = 'loaded';
  }
}
