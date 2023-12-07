import * as THREE from 'three';
import vertexShader from './landscape.vert.glsl?raw';
import fragmentShader from './landscape.frag.glsl?raw';
import { TIFFLoader } from 'three/examples/jsm/loaders/TIFFLoader.js';
import { BG_COLOR } from './consts';
import { bridge, layers } from '@/bridge';

export class Landscape {
  mesh: THREE.Mesh;

  private static base_x = 2665;
  private static base_y = 1210;

  public static center = new THREE.Object3D();

  private download_state: 'empty' | 'loading' | 'loaded' = 'empty';
  private visible = false;

  private static empty_material = new THREE.MeshBasicMaterial({ color: BG_COLOR });

  private landscape_material = new THREE.ShaderMaterial({ fragmentShader, vertexShader });

  public static data_mode = false;
  public static data_layer = 0;

  private static segments = 6;

  public static time = 0;

  private static geometry = new THREE.PlaneGeometry(10, 10, Landscape.segments, Landscape.segments);

  private static empty_texture: THREE.DataTexture | null;

  static set_base_coords(x: number, y: number) {
    this.base_x = x;
    this.base_y = y;
  }

  static init_empty_texture() {
    const width = 32;
    const height = 32;

    const size = width * height;
    const data = new Uint8Array(4 * size);
    const brightness = 90;

    for (let i = 0; i < size; i++) {
      const stride = i * 4;
      data[stride] = brightness;
      data[stride + 1] = brightness;
      data[stride + 2] = brightness;
      data[stride + 3] = 255;
    }

    // used the buffer to create a DataTexture
    Landscape.empty_texture = new THREE.DataTexture(data, width, height);
    Landscape.empty_texture.needsUpdate = true;
  }

  constructor(
    private scene: THREE.Scene,
    renderer: THREE.WebGLRenderer,
    private x = 2665,
    private y = 1210
  ) {
    this.mesh = new THREE.Mesh(Landscape.geometry, Landscape.empty_material);
    this.mesh.position.x = -(Landscape.base_x - x) * 10;
    this.mesh.position.z = (Landscape.base_y - y) * 10;
    this.mesh.rotateX(-Math.PI / 2);

    scene.add(this.mesh);

    this.mesh.onBeforeRender = this.on_before_render.bind(this);

    // Checks every 100ms whether this tile should be enabled. Starts counting
    // after a random offset so not all tiles enable/disable at the same time.
    const interval = 50;
    setTimeout(() => {
      setInterval(() => {
        this.handle_visibility();
      }, interval);
    }, Math.random() * interval);
  }

  private handle_visibility() {
    const distance = Landscape.center.position.distanceToSquared(this.mesh.position);
    const should_be_visible = distance < Math.pow(80, 2);

    if (should_be_visible && !this.visible) {
      this.show();
    }

    if (!should_be_visible && this.visible) {
      this.mesh.material = Landscape.empty_material;
      this.visible = false;
    }
  }

  update(time: number) {
    if (this.download_state === 'loaded') {
      this.landscape_material.uniforms.u_time.value = time / 1000;
    }
  }

  on_before_render(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    geometry: THREE.BufferGeometry<THREE.NormalBufferAttributes>,
    material: THREE.Material,
    group: THREE.Group
  ) {
    if (material.type !== 'ShaderMaterial') {
      return;
    }

    const mat = material as THREE.ShaderMaterial;
    mat.uniforms.u_data_mode.value = Landscape.data_mode;
    mat.uniforms.u_data_layer.value = Landscape.data_layer;
    mat.uniforms.u_m_elevation.value = layers.elevation;
    mat.uniforms.u_m_traffic_noise.value = layers.traffic_noise;
    mat.uniforms.u_m_buildings.value = layers.buildings;
    mat.uniforms.u_m_water.value = layers.water;
    mat.uniforms.u_m_forest.value = layers.forest;
    mat.uniforms.u_m_wind.value = layers.wind;
    mat.uniforms.u_m_railway.value = layers.railway;
  }

  // Downloads textures and creates material if it doesn't exist yet.
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

    this.landscape_material.uniforms = {
      u_height: { value: null },
      u_noise: { value: null },
      u_wind: { value: null },
      u_railway: { value: null },
      u_water: { value: null },
      u_forest: { value: null },
      u_buildings: { value: null },
      u_center: { value: Landscape.center.position },
      u_background: { value: this.scene.background },
      u_satellite: { value: Landscape.empty_texture },
      u_data_mode: { value: Landscape.data_mode },
      u_data_layer: { value: Landscape.data_layer },
      u_time: { value: 0 },
      u_m_elevation: { value: layers.elevation },
      u_m_traffic_noise: { value: layers.traffic_noise },
      u_m_buildings: { value: layers.buildings },
      u_m_water: { value: layers.water },
      u_m_forest: { value: layers.forest },
      u_m_wind: { value: layers.wind },
      u_m_railway: { value: layers.railway }
    };

    this.fetch_texture(`${this.x}-${this.y}-height.png`, 'u_height', (texture) => {
      texture.generateMipmaps = false;
      texture.minFilter = THREE.NearestFilter;
      texture.magFilter = THREE.NearestFilter;
    });

    this.mesh.material = this.landscape_material;

    this.fetch_texture(`${this.x}-${this.y}-satellite.jpg`, 'u_satellite');
    this.fetch_texture(`${this.x}-${this.y}-strassenlaerm.png`, 'u_noise');
    this.fetch_texture(`${this.x}-${this.y}-wind.png`, 'u_wind');
    this.fetch_texture(`${this.x}-${this.y}-railway.png`, 'u_railway');
    this.fetch_texture(`${this.x}-${this.y}-water.png`, 'u_water');
    this.fetch_texture(`${this.x}-${this.y}-forest.png`, 'u_forest');
    this.fetch_texture(`${this.x}-${this.y}-buildings.png`, 'u_buildings');

    this.download_state = 'loaded';
  }

  private loader = new THREE.TextureLoader();

  private async fetch_texture(
    file_path: string,
    uniform: string,
    on_loaded?: (texture: THREE.Texture) => void
  ) {
    const host =
      import.meta.env.MODE == 'online'
        ? 'https://klanglandschaft.b-cdn.net/v01'
        : `http://${window.location.host.split(':')[0]}:8080/data/channels`;

    return this.loader
      .loadAsync(`${host}/${file_path}`)
      .then((t) => {
        this.landscape_material.uniforms[uniform].value = t;
        on_loaded?.(t);
      })
      .catch((e) => {
        console.log(e);
      });
  }
}
