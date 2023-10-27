import * as THREE from "three";

type DataPoint = {
  x: number;
  y: number;
  z: number;
};

export function constructMap(
  data_file_contents_array: string[],
  smallest_x: number,
  smallest_y: number,
): number[][] {
  const interval = 2; // difference between two points in the XYZ file

  const pointsMap: number[][] = [];

  data_file_contents_array.forEach((data_file_contents) => {
    const lines = data_file_contents.split("\r\n");
    lines.shift();
    lines.pop();
    console.log(lines.length);

    lines.forEach((e, i) => {
      const split = e.split(" ").map((n) => Number(n));
      const point: DataPoint = {
        x: split[0],
        y: split[1],
        z: split[2],
      };

      const q = (point.x - smallest_x) / interval;
      const r = (point.y - smallest_y) / interval;
      if (i < 10) {
        // console.log('q', point.x - smallest_x);
      }

      if (typeof pointsMap[q] === "undefined") {
        pointsMap[q] = [];
      }

      if (typeof point.z !== "number" || isNaN(point.z)) {
        console.log("not num:", point.z);
      }

      // console.log(point.z);
      pointsMap[q][r] = point.z;
    });
  });

  console.log("length:", pointsMap.length, "x", pointsMap[0].length);
  return pointsMap;
}

export function getGeometry(
  data_file_contents_array: string[],
  elevation_map: number[][],
  index: number,
  offset_x: number,
  offset_y: number,
  detail_base = 2,
): THREE.BufferGeometry {
  const data_file_contents = data_file_contents_array[index];
  const width_in_entries = 500;
  const absolute_offset_x = offset_x * width_in_entries;
  const absolute_offset_y = offset_y * width_in_entries;
  console.log({ absolute_offset_x, absolute_offset_y });

  let performance = "";
  let recent_time = Date.now();
  const track = (title: string) => {
    performance += `${title}:\n${Date.now() - recent_time}\n\n`;
    recent_time = Date.now();
  };

  track("start");

  const midHeight = 0;
  // const detail_scale = detail_base ** 2;

  track("prepare");

  track("shift");

  track("pop");

  // console.log(pointsList);
  // console.log(pointsList[pointsList.length - 1])

  // console.log(pointsMap);

  // points.forEach((e, i) => {
  //   if (i % 100 === 0) {
  //     filtered.push(e)
  //   }
  // });

  // console.log(filtered);

  const geometry = new THREE.BufferGeometry();

  const indices = [];

  const vertices = [];
  const uvs = [];
  const normals = [];
  const colors = [];

  const size = 20;
  // const segments = Math.round(Math.sqrt(pointswidth_in_entriesList.length / detail_scale)) - 1;
  // console.log({ segments });

  const halfSize = size / 2;
  const segmentSize = size / width_in_entries;

  // generate vertices, normals and color data for a simple grid geometry
  const change = 2;
  // const segments = width_in_entries / change
  const detail_scale = 5; // 1/n-th of width
  const segments = width_in_entries / 5;

  track("setup");

  let num = 0;

  for (let i = 0; i <= segments; i += 1) {
    const y = (i * 5) / 25;

    for (let j = 0; j <= segments; j += 1) {
      const x = (j * 5) / 25;

      // console.log("num", num)
      // const a = i * Math.sqrt(detail_scale);
      // const b = j * Math.sqrt(detail_scale);

      let a = i * 5 + offset_x * 500;
      let b = j * 5 + offset_y * 500;

      if (a === elevation_map.length) {
        a = elevation_map.length - 1;
      }

      if (b === elevation_map[a].length) {
        b = elevation_map[a].length - 1;
      }

      // if (i == segments) {
      // 	a = pointsMap.length - 1;
      // }

      // if (j == segments) {
      // 	b = pointsMap[a].length - 1;
      // }

      try {
        const elevation = elevation_map[a][b] * 0.02;
      } catch (error) {
        console.error("lul");
        console.error({ a, b });
        console.error(error);
      }

      const elevation = elevation_map[a][b] * 0.02;
      if (typeof elevation !== "number" || isNaN(elevation)) {
        // console.log('elevation:', elevation, a, b);
      }

      // console.log(`a: ${a}/${pointsMap.length} // b: ${b}/${pointsMap[a].length}`);
      vertices.push(x, -y, elevation);
      uvs.push(0.5, 0.5);
      // console.log("elevation", elevation)
      normals.push(0, 0, 1);

      const r = x / size + 0.5;
      const g = y / size + 0.5;

      colors.push(r, g, 1);

      num++;
    }
  }

  // generate indices
  for (let i = 0; i < segments; i += 1) {
    for (let j = 0; j < segments; j += 1) {
      const a = i * (segments + 1) + (j + 1);
      const b = i * (segments + 1) + j;
      const c = (i + 1) * (segments + 1) + j;
      const d = (i + 1) * (segments + 1) + (j + 1);

      // generate two triangles per iteration
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  track("loop");
  //

  geometry.setIndex(indices);
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3),
  );
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(vertices, 2));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  geometry.rotateX(-Math.PI / 2);
  track("set...");

  geometry.computeVertexNormals();
  geometry.normalizeNormals();
  geometry.computeTangents();

  track("normals");

  // console.log(performance);

  // console.log(geometry.attributes.position.array);
  console.log(vertices);

  return geometry;
}
