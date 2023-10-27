import { Document, NodeIO } from "@gltf-transform/core";
import { pathify } from "./util.mjs";
import fs from "fs";

export async function alles() {
  const document = new Document();
  const buffer = document.createBuffer();

  const filePath = pathify(
    "swissSURFACE3D_Raster_0.5_xyz_CHLV95_LN02_2666_1211.xyz_normalized",
  );

  const bytes_to_read = 30;

  // TODO: read across files, decide on lods
  // TODO: open once, read multiple times

  const positions = [];

  fs.open(filePath, "r", async (err, fd) => {
    for (let s = 0; s < 4_000_000; s++) {
      const line_contents = await p(s);
      const [x, y, z] = line_contents.split(", ").map((n) => Number(n));

      if (isNaN(x) || isNaN(y) || isNaN(z)) {
        console.log(x, y, z);
      }
      positions.push(x, y, z);

      function p(s: number): Promise<string> {
        return new Promise((resolve, reject) => {
          fs.read(
            fd,
            {
              buffer: Buffer.alloc(bytes_to_read),
              position: 31 * (s - 1),
              length: bytes_to_read,
            },
            (err, bytes_read, buffer) => {
              resolve(buffer.toString("utf8"));
            },
          );
        });
      }
    }
  });

  const position_accessor = document
    .createAccessor()
    .setArray(new Float32Array(positions))
    .setType("VEC3")
    .setBuffer(buffer);

  const surface = document
    .createPrimitive()
    .setAttribute("POSITION", position_accessor);

  const mesh = document.createMesh("mesh").addPrimitive(surface);

  const node = document
    .createNode("node")
    .setMesh(mesh)
    .setTranslation([0, 0, 0]);

  const scene = document.createScene("scene").addChild(node);

  await new NodeIO().write(pathify("scene.gltf"), document);

  console.log("written");
}
