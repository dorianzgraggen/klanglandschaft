import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class LandscapeMeshTest {
  camPos = new THREE.Vector3();
  planes: Array<THREE.Plane>;
  planeHelpers: Array<THREE.Object3D>;

  constructor(
    private parent: THREE.Object3D,
    camera: THREE.Camera
  ) {
    const loader = new GLTFLoader();

    this.planes = [
      new THREE.Plane(new THREE.Vector3(1, 0, 0), 3),
      new THREE.Plane(new THREE.Vector3(-1, 0, 0), 3),
      new THREE.Plane(new THREE.Vector3(0, 0, 1), 3),
      new THREE.Plane(new THREE.Vector3(0, 0, -1), 3)
      // new THREE.Plane(new THREE.Vector3(0, -1, 0), 0),
      // new THREE.Plane(new THREE.Vector3(0, 0, -1), 0)
    ];

    const plane_settings = this.planes.map((p) => {
      const pos = new THREE.Vector3().copy(p.normal).multiplyScalar(-p.constant);
      console.log(pos);
      const initial_diff = new THREE.Vector3().subVectors(camera.position, pos);
      const diff = new THREE.Vector3().subVectors(
        initial_diff,
        new THREE.Vector3().subVectors(camera.position, pos)
      );

      return {
        constant: p.constant,
        pos,
        diff,
        initial_diff
      };
    });

    console.log(plane_settings[0].diff.toArray());

    this.planeHelpers = this.planes.map((p, i) => {
      const plane_geometry = new THREE.PlaneGeometry(130, 30);
      const material = new THREE.MeshBasicMaterial({
        color: i < 2 ? 0xff0000 : 0x0000ff,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide
      });
      const g = new THREE.SphereGeometry(3);
      const helper = new THREE.Mesh(plane_geometry, material);
      // helper.visible = i == 3;

      helper.position.y = -25;

      if (i < 2) {
        helper.rotateY(Math.PI / 2);
      }
      parent.add(helper);

      return helper;
    });

    // Load a glTF resource
    loader.load(
      '/scene.gltf',
      (gltf) => {
        parent.add(gltf.scene);
        gltf.scene.traverse((c) => {
          if (c.type == 'Mesh') {
            const mesh = c as THREE.Mesh;

            mesh.geometry.computeVertexNormals();
            mesh.scale.set(1, 0.5, 1);
            mesh.scale.multiplyScalar(22);
            mesh.material = new THREE.MeshNormalMaterial({ clippingPlanes: this.planes });
            mesh.position.y += 0;
          }
        });
        console.log(parent);
      },
      // called while loading is progressing
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
      },
      // called when loading has errors
      (error) => {
        console.log('An error happened');
      }
    );
  }

  public update(camera: THREE.PerspectiveCamera) {
    camera.getWorldPosition(this.camPos);

    const from = -10;
    const to = 70;

    this.planes[0].constant = -this.camPos.x + from;
    this.planes[1].constant = this.camPos.x + to;
    this.planes[2].constant = -this.camPos.z + from;
    this.planes[3].constant = this.camPos.z + to;

    this.planeHelpers[0].position.x = -this.planes[0].constant;
    this.planeHelpers[0].position.z = this.camPos.z + 30;

    this.planeHelpers[1].position.x = this.planes[1].constant;
    this.planeHelpers[1].position.z = this.camPos.z + 30;

    this.planeHelpers[2].position.z = -this.planes[2].constant;
    this.planeHelpers[2].position.x = this.camPos.x + 30;

    this.planeHelpers[3].position.z = this.planes[3].constant;
    this.planeHelpers[3].position.x = this.camPos.x + 30;
  }
}
