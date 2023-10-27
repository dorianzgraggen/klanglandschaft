import { Document, NodeIO } from "@gltf-transform/core";
import { pathify } from "./util.mjs";
import fs from "fs";

export async function build_mesh() {
  const document = new Document();
  const buffer = document.createBuffer();

  const sampler = async (x, z) => {
    const s = await sample_elevation_xyz_file(2666, 1211, x * 0.95, z * 0.95);
    return (s - 400) * 0.02;
  };

  const geometry = await build_cake_geometry(sampler);

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

  console.log("done writing");
}

async function build_cake_geometry(sampleHeight: (x, z) => Promise<number>) {
  let segments = 250;
  let width = 10;

  const positions = new Array<number>();
  const indices = new Array<number>();

  // vertex positions top
  for (let i = 0; i <= segments; i += 1) {
    const z = (i * width) / segments;
    for (let j = 0; j <= segments; j += 1) {
      const x = (j * width) / segments;
      const y = await sampleHeight(x / width, z / width);
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

  // // sides
  // for (let n = 0; n < 4; n++) {
  //   // vertex position sides
  //   for (let i = 0; i <= segments; i++) {
  //     const horizontal_pos = (i * width) / segments;

  //     let x = horizontal_pos;
  //     let z = 0;

  //     switch (n) {
  //       case 1:
  //         z = width;
  //         break;

  //       case 2:
  //         x = 0;
  //         z = horizontal_pos;
  //         break;

  //       case 3:
  //         x = width;
  //         z = horizontal_pos;
  //         break;

  //       default:
  //         break;
  //     }

  //     const y = await sampleHeight(x / width, z / width);

  //     positions.push(x, -3, z);
  //     positions.push(x, y, z);
  //   }

  //   // indices sides
  //   for (let i = 0; i < segments; i++) {
  //     const base = (segments + 1) ** 2 + n * (segments + 1) * 2;
  //     const a = i * 2 + base;
  //     const b = i * 2 + 1 + base;
  //     const c = i * 2 + 2 + base;
  //     const d = i * 2 + 3 + base;

  //     if (n == 0 || n == 3) {
  //       indices.push(a, b, c);
  //       indices.push(b, d, c);
  //     } else {
  //       indices.push(a, c, b);
  //       indices.push(b, c, d);
  //     }
  //   }
  // }

  // // vertices bottom
  // positions.push(0, -3, 0);
  // positions.push(width, -3, 0);
  // positions.push(width, -3, width);
  // positions.push(0, -3, width);

  // // indices bottom
  // {
  //   const base = (segments + 1) ** 2 + 4 * (segments + 1) * 2;

  //   const a = base;
  //   const b = base + 1;
  //   const c = base + 2;
  //   const d = base + 3;
  //   indices.push(a, b, c);
  //   indices.push(a, c, d);
  // }

  return {
    indices,
    positions,
  };
}

export async function sample_elevation_xyz_file(
  base_x: number,
  base_y: number,
  x: number,
  y: number,
): Promise<number> {
  return (await get_entry(x, y)).z;
}

async function sample_elevation_cos_sine(
  x: number,
  z: number,
): Promise<number> {
  return (Math.sin(x * Math.PI * 12) + Math.cos(z * Math.PI * 16)) * 0.2 - 1.8;
}

// export function coords_to_byte_offset(
//   x_normalized: number,
//   y_normalized: number
// ): number {
//   const bytes_first_line = 0;
//   const bytes_per_line = 30;

//   const base_x = 2666_000;
//   const base_y = 1211_000;

//   const ideal_x = x_normalized * 1000 + base_x;
//   const ideal_y = y_normalized * 1000 + base_y;
//   // console.log({ x_normalized, y_normalized, ideal_x, ideal_y });

//   const l = 2000;
//   const x_offset_lines = 2000 * x_normalized;
//   const y_offset_lines = 2000 * (1.0 - y_normalized) * 2000;

//   const x_offset_bytes = Math.round(x_offset_lines * bytes_per_line);
//   const y_offset_bytes = Math.round(y_offset_lines * bytes_per_line);

//   return x_offset_bytes + y_offset_bytes + bytes_first_line;
// }

export function coords_to_line_number(
  x_normalized: number,
  y_normalized: number,
): number {
  const bytes_first_line = 0;
  const bytes_per_line = 30;

  const base_x = 2666_000;
  const base_y = 1211_000;

  const ideal_x = x_normalized * 1000 + base_x;
  const ideal_y = y_normalized * 1000 + base_y;
  // console.log({ x_normalized, y_normalized, ideal_x, ideal_y });

  const l = 2000;
  const x_offset_lines = lerp(0, 2000, x_normalized);
  const y_offset_lines = lerp(0, 2000, y_normalized) * 2000;

  return Math.round(x_offset_lines) + Math.round(y_offset_lines) + 1;
}

type Vec3 = {
  x: number;
  y: number;
  z: number;
};

export async function get_entry(
  x_normalized: number,
  y_normalized: number,
): Promise<Vec3> {
  // console.log("get_entry", x_normalized, y_normalized);
  const line_contents = await get_line(
    coords_to_line_number(x_normalized, y_normalized),
  );

  const [x, y, z] = line_contents.split(", ").map((e) => Number(e));

  return { x, y, z };
}

// export function coords_to_line_number(
//   x_normalized: number,
//   y_normalized: number
// ): Promise<number> {
//   const filePath = pathify(
//     "swissSURFACE3D_Raster_0.5_xyz_CHLV95_LN02_2666_1211.xyz_normalized"
//   );

//   const bytes_to_read = 60;

//   // TODO: read across files, decide on lods
//   // TODO: open once, read multiple times
//   return new Promise((resolve, reject) => {
//     fs.open(filePath, "r", (err, fd) => {
//       fs.read(
//         fd,
//         {
//           buffer: Buffer.alloc(bytes_to_read),
//           position: coords_to_byte_offset(x_normalized, y_normalized),
//           length: bytes_to_read,
//         },
//         (err, bytes_read, buffer) => {
//           console.log(JSON.stringify(buffer.toString("utf8")));

//           const [x, y, z] = buffer
//             .toString("utf8")
//             .split(" ")
//             .map((e) => Number(e));
//           resolve(z);
//           console.log("===");
//         }
//       );
//     });
//   });
// }

export async function get_line(line_number: number): Promise<string> {
  const filePath = pathify(
    "swissSURFACE3D_Raster_0.5_xyz_CHLV95_LN02_2666_1211.xyz_normalized",
  );

  const bytes_to_read = 30;

  // TODO: read across files, decide on lods
  // TODO: open once, read multiple times
  return new Promise((resolve, reject) => {
    if (line_number < 1 || line_number > 4_000_000) {
      reject(
        new Error(
          `line_number must be between 1 and 4_000_000, not '${line_number}'`,
        ),
      );
    }

    // console.log({ line_number });

    fs.open(filePath, "r", (err, fd) => {
      fs.read(
        fd,
        {
          buffer: Buffer.alloc(bytes_to_read),
          position: 31 * (line_number - 1),
          length: bytes_to_read,
        },
        (err, bytes_read, buffer) => {
          resolve(buffer.toString("utf8"));
        },
      );
    });
  });
}

function lerp(a: number, b: number, t: number): number {
  return (1 - t) * a + t * b;
}
