import { Accessor, Document, NodeIO, GLTF } from "@gltf-transform/core";
import { pathify } from "./util.mjs";

export async function build_mesh() {
  const document = new Document();
  const buffer = document.createBuffer();

  const plane = createPlane();

  const indices = document
    .createAccessor()
    .setArray(new Uint16Array(plane.indices))
    .setType("SCALAR")
    .setBuffer(buffer);

  const position = document
    .createAccessor()
    .setArray(new Float32Array(plane.positions))
    .setType("VEC3")
    .setBuffer(buffer);

  const prim = document
    .createPrimitive()
    .setIndices(indices)
    .setAttribute("POSITION", position);

  const mesh = document.createMesh("mesh").addPrimitive(prim);

  const node = document
    .createNode("node")
    .setMesh(mesh)
    .setTranslation([0, 0, 0]);

  const scene = document.createScene("scene").addChild(node);

  await new NodeIO().write(pathify("scene.gltf"), document);

  console.log("c");
}

function createPlane() {
  let segments = 100;
  let width = 10;

  const positions = [];
  const indices = [];

  // vertex positions
  for (let i = 0; i <= segments; i += 1) {
    const z = (i * width) / segments;
    for (let j = 0; j <= segments; j += 1) {
      const x = (j * width) / segments;
      const y = (Math.sin(x * 2) + Math.cos(z * 2)) * 0.3;
      positions.push(x, y, z);
    }
  }

  // indices
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

  return {
    indices,
    positions,
  };
}
