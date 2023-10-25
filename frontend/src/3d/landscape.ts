import * as THREE from 'three';
import vertexShader from './landscape.vert.glsl?raw';
import fragmentShader from './landscape.frag.glsl?raw';

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

    const debug_texture = new THREE.TextureLoader().load(`/debug_edges.png`);
    debug_texture.generateMipmaps = false;
    debug_texture.minFilter = THREE.NearestFilter;
    debug_texture.magFilter = THREE.NearestFilter;

    const debug_height = new THREE.TextureLoader().load(`/debug_height.png`);
    debug_height.generateMipmaps = false;
    debug_height.minFilter = THREE.NearestFilter;
    debug_height.magFilter = THREE.NearestFilter;

    // const nrm = new THREE.TextureLoader().load(`/${x}-${y}_normal.png`);

    const material = new THREE.ShaderMaterial({
      fragmentShader,
      vertexShader,
      uniforms: {
        u_height: { value: texture },
        u_debug: { value: debug_texture },
        u_debug_height: { value: debug_height },
        // u_nrm: { value: nrm },
        u_resolution: { value: new THREE.Vector2() }
      }
    });

    renderer.getSize(material.uniforms.u_resolution.value);

    console.log(material.uniforms.u_resolution);

    const segments = 28;

    const geometry = new THREE.PlaneGeometry(10, 10, segments, segments);

    geometry.rotateX(-Math.PI / 2);

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.x = -(Landscape.base_x - x) * 10;
    this.mesh.position.z = (Landscape.base_y - y) * 10;

    // this.mesh.scale.multiplyScalar(0.9);
    parent.add(this.mesh);

    const clone = this.mesh.clone();
    // parent.add(clone);
    // clone.scale.multiplyScalar(1.05);

    clone.position.y -= 0.2;
  }
}
