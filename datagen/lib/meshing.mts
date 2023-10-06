import { Document, NodeIO } from "@gltf-transform/core";
import { pathify } from "./util.mjs";

export async function build_mesh() {
  const document = new Document();
  const buffer = document.createBuffer();

  const geometry = buildCakeSliceGeometry();

  const indices = document
    .createAccessor()
    .setArray(new Uint16Array(geometry.indices))
    .setType("SCALAR")
    .setBuffer(buffer);

  const position = document
    .createAccessor()
    .setArray(new Float32Array(geometry.positions))
    .setType("VEC3")
    .setBuffer(buffer);

  const surface = document
    .createPrimitive()
    .setIndices(indices)
    .setAttribute("POSITION", position);

  const mesh = document.createMesh("mesh").addPrimitive(surface);

  const node = document
    .createNode("node")
    .setMesh(mesh)
    .setTranslation([0, 0, 0]);

  const scene = document.createScene("scene").addChild(node);

  await new NodeIO().write(pathify("scene.gltf"), document);
}

function buildCakeSliceGeometry() {
  let segments = 160;
  let width = 10;

  const positions = [];
  const indices = [];

  // vertex positions top
  for (let i = 0; i <= segments; i += 1) {
    const z = (i * width) / segments;
    for (let j = 0; j <= segments; j += 1) {
      const x = (j * width) / segments;
      const y = sampleHeight(x, z);
      positions.push(x, y, z);
    }
  }

  // indices top
  for (let i = 0; i < segments; i += 1) {
    for (let j = 0; j < segments; j += 1) {
      const a = i * (segments + 1) + (j + 1);
      const b = i * (segments + 1) + j;
      const c = (i + 1) * (segments + 1) + j;
      const d = (i + 1) * (segments + 1) + (j + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  // sides
  for (let n = 0; n < 4; n++) {
    // vertex position sides
    for (let i = 0; i <= segments; i++) {
      const horizontal_pos = (i * width) / segments;

      let x = horizontal_pos;
      let z = 0;

      switch (n) {
        case 1:
          z = width;
          break;

        case 2:
          x = 0;
          z = horizontal_pos;
          break;

        case 3:
          x = width;
          z = horizontal_pos;
          break;

        default:
          break;
      }

      const y = sampleHeight(x, z);

      positions.push(x, -3, z);
      positions.push(x, y, z);
    }

    // indices sides
    for (let i = 0; i < segments; i++) {
      const base = (segments + 1) ** 2 + n * (segments + 1) * 2;
      const a = i * 2 + base;
      const b = i * 2 + 1 + base;
      const c = i * 2 + 2 + base;
      const d = i * 2 + 3 + base;

      if (n == 0 || n == 3) {
        indices.push(a, b, c);
        indices.push(b, d, c);
      } else {
        indices.push(a, c, b);
        indices.push(b, c, d);
      }
    }
  }

  // vertices bottom
  positions.push(0, -3, 0);
  positions.push(width, -3, 0);
  positions.push(width, -3, width);
  positions.push(0, -3, width);

  // indices bottom
  {
    const base = (segments + 1) ** 2 + 4 * (segments + 1) * 2;

    const a = base;
    const b = base + 1;
    const c = base + 2;
    const d = base + 3;
    indices.push(a, b, c);
    indices.push(a, c, d);
  }

  function sampleHeight(x: number, z: number): number {
    return (Math.sin(x * 2) + Math.cos(z * 2)) * 0.3;
  }

  return {
    indices,
    positions,
  };
}
