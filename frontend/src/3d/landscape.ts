import * as THREE from 'three';
import vertexShader from './landscape.vert.glsl?raw';
import fragmentShader from './landscape.frag.glsl?raw';

export class Landscape {
  constructor(parent: THREE.Object3D, renderer: THREE.WebGLRenderer) {
    const texture = new THREE.TextureLoader().load('/height.jpg');

    const material = new THREE.ShaderMaterial({
      fragmentShader,
      vertexShader,
      uniforms: {
        u_height: { value: texture },
        u_resolution: { value: new THREE.Vector2() }
      }
    });

    renderer.getSize(material.uniforms.u_resolution.value);

    console.log(material.uniforms.u_resolution);

    const geometry = new THREE.PlaneGeometry(10, 10, 10, 10);

    geometry.rotateX(-Math.PI / 2);

    const mesh = new THREE.Mesh(geometry, material);

    parent.add(mesh);
  }
}
