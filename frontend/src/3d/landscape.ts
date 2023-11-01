import * as THREE from 'three';
import vertexShader from './landscape.vert.glsl?raw';
import fragmentShader from './landscape.frag.glsl?raw';
import { TIFFLoader } from 'three/examples/jsm/loaders/TIFFLoader.js';

export class Landscape {
  mesh: THREE.Mesh;

  private static base_x = 2665;
  private static base_y = 1210;

  static set_base_coords(x: number, y: number) {
    this.base_x = x;
    this.base_y = y;
  }

  constructor(parent: THREE.Object3D, renderer: THREE.WebGLRenderer, x = 2665, y = 1210) {
    const texture = new THREE.TextureLoader().load(
      `http://${window.location.host.split(':')[0]}:8080/data/geotiff/extended/${x}-${y}.png`
    );

    texture.generateMipmaps = false;
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;

    const tiff = new TIFFLoader().load(
      `http://${window.location.host.split(':')[0]}:8080/data/geotiff/satellite/${x}-${y}.tif`
    );
    tiff.colorSpace = THREE.LinearSRGBColorSpace;

    const material = new THREE.ShaderMaterial({
      fragmentShader,
      vertexShader,
      uniforms: {
        u_height: { value: texture },
        u_satellite: { value: tiff },
        u_resolution: { value: new THREE.Vector2() }
      }
    });

    renderer.getSize(material.uniforms.u_resolution.value);

    const segments = 8;

    const geometry = new THREE.PlaneGeometry(10, 10, segments, segments);

    geometry.rotateX(-Math.PI / 2);

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.x = -(Landscape.base_x - x) * 10;
    this.mesh.position.z = (Landscape.base_y - y) * 10;

    parent.add(this.mesh);
  }
}
