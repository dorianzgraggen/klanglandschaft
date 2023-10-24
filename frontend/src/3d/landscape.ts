import * as THREE from 'three';
import vertexShader from './landscape.vert.glsl?raw';
import fragmentShader from './landscape.frag.glsl?raw';

export class Landscape {
  mesh: THREE.Mesh;

  constructor(parent: THREE.Object3D, renderer: THREE.WebGLRenderer, x = 2665, y = 1210) {
    const texture = new THREE.TextureLoader().load(`/${x}-${y}b_c.jpg`);
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;

    const nrm = new THREE.TextureLoader().load(`/${x}-${y}_normal.png`);

    const material = new THREE.ShaderMaterial({
      fragmentShader,
      vertexShader,
      uniforms: {
        u_height: { value: texture },
        u_nrm: { value: nrm },
        u_resolution: { value: new THREE.Vector2() }
      }
    });

    renderer.getSize(material.uniforms.u_resolution.value);

    console.log(material.uniforms.u_resolution);

    const segments = 8;

    const geometry = new THREE.PlaneGeometry(10, 10, segments, segments);

    geometry.rotateX(-Math.PI / 2);

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.x = -(2665 - x) * 10;
    this.mesh.position.z = (1210 - y) * 10;

    this.mesh.scale.multiplyScalar(512 / 510);
    parent.add(this.mesh);

    const clone = this.mesh.clone();
    parent.add(clone);
    clone.scale.multiplyScalar(1.05);

    clone.position.y -= 0.2;
  }
}
