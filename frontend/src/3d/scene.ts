import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function init() {
  const root = document.getElementById('canvas-root') as HTMLElement; // iuuu

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x2222222);
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  const renderer = new THREE.WebGLRenderer();
  renderer.localClippingEnabled = true;
  renderer.setSize(window.innerWidth, window.innerHeight);
  root.appendChild(renderer.domElement);

  const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  camera.position.z = -1;
  camera.position.x = -1;
  camera.position.y = 1;
  camera.lookAt(new THREE.Vector3());

  const controls = new MapControls(camera, renderer.domElement);

  // controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  controls.dampingFactor = 0.05;

  controls.screenSpacePanning = false;

  controls.minDistance = 10;
  controls.maxDistance = 500;

  controls.maxPolarAngle = Math.PI / 2;
  controls.enableRotate = false;
  controls.enableZoom = false;

  controls.panSpeed = 5;

  const loader = new GLTFLoader();

  controls.update();

  const axes = new THREE.AxesHelper(20);
  scene.add(axes);

  const planes = [
    new THREE.Plane(new THREE.Vector3(1, 0, 0), 3),
    new THREE.Plane(new THREE.Vector3(-1, 0, 0), 3),
    new THREE.Plane(new THREE.Vector3(0, 0, 1), 3),
    new THREE.Plane(new THREE.Vector3(0, 0, -1), 3)
    // new THREE.Plane(new THREE.Vector3(0, -1, 0), 0),
    // new THREE.Plane(new THREE.Vector3(0, 0, -1), 0)
  ];

  const plane_settings = planes.map((p) => {
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

  const planeHelpers = planes.map((p, i) => {
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
    scene.add(helper);

    return helper;
  });

  // Load a glTF resource
  loader.load(
    '/scene.gltf',
    (gltf) => {
      scene.add(gltf.scene);
      gltf.scene.traverse((c) => {
        if (c.type == 'Mesh') {
          const mesh = c as THREE.Mesh;

          mesh.geometry.computeVertexNormals();
          mesh.scale.set(1, 0.5, 1);
          mesh.scale.multiplyScalar(22);
          mesh.material = new THREE.MeshNormalMaterial({ clippingPlanes: planes });
          mesh.position.y += 0;
        }
      });
      console.log(scene);
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

  const camPos = new THREE.Vector3();
  function animate() {
    requestAnimationFrame(animate);

    camera.getWorldPosition(camPos);

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    controls.update();

    const from = -10;
    const to = 70;

    planes[0].constant = -camPos.x + from;
    planes[1].constant = camPos.x + to;
    planes[2].constant = -camPos.z + from;
    planes[3].constant = camPos.z + to;

    planeHelpers[0].position.x = -planes[0].constant;
    planeHelpers[0].position.z = camPos.z + 30;

    planeHelpers[1].position.x = planes[1].constant;
    planeHelpers[1].position.z = camPos.z + 30;

    planeHelpers[2].position.z = -planes[2].constant;
    planeHelpers[2].position.x = camPos.x + 30;

    planeHelpers[3].position.z = planes[3].constant;
    planeHelpers[3].position.x = camPos.x + 30;

    // planeHelpers[3].position.z = planes[3].constant;

    renderer.render(scene, camera);
  }

  animate();
}
