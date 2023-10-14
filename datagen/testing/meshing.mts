import assert from "node:assert";
import test from "node:test";

import { get_line, get_entry, coords_to_line_number } from "../lib/meshing.mjs";

test("meshing/get_line(1)", async (t) => {
  let content = await get_line(1);
  return assert.strictEqual(content, "2666000.25, 1211999.75, 479.29");
});

test("meshing/get_line(2)", async (t) => {
  let content = await get_line(2);
  return assert.strictEqual(content, "2666000.75, 1211999.75, 479.41");
});

test("meshing/get_line(80)", async (t) => {
  let content = await get_line(80);
  return assert.strictEqual(content, "2666039.75, 1211999.75, 478.20");
});

test("meshing/get_line(0)", async (t) => {
  return assert.rejects(() => get_line(0));
});

test("meshing/get_line(4_000_001)", async (t) => {
  return assert.rejects(() => get_line(4_000_001));
});

// test("meshing/get_entry", async (t) => {
//   let c = await get_entry(0.5, 0.5);
//   return assert.strictEqual(c, 433.64);
// });

// test("meshing/get_entry", async (t) => {
//   let c = await get_entry(0.0, 1.0);
//   return assert.strictEqual(c, 433.64);
// });

test("meshing/coords_to_line_number 1", (t) => {
  let ln = coords_to_line_number(0.0, 0.0);
  return assert.strictEqual(ln, 1);
});

test("meshing/coords_to_line_number 2", (t) => {
  let ln = coords_to_line_number(1.0, 0.0);
  return assert.strictEqual(ln, 2001);
});

test("meshing/coords_to_line_number 3", (t) => {
  let ln = coords_to_line_number(0.5, 0.0);
  return assert.strictEqual(ln, 1001); // 1000.5
});

test("meshing/coords_to_line_number 4", (t) => {
  let ln = coords_to_line_number(0.0, 0.0);
  return assert.strictEqual(ln, 1);
});

// test("meshing/coords_to_line_number 5", (t) => {
//   let ln = coords_to_line_number(0.0, 1.0);
//   return assert.strictEqual(ln, 3_998_001);
// });

// test("meshing/coords_to_line_number 6", (t) => {
//   let ln = coords_to_line_number(1.0, 1.0);
//   return assert.strictEqual(ln, 4_000_000);
// });

test("meshing/coords_to_line_number 7", (t) => {
  let ln = coords_to_line_number(0.2, 0.0);
  return assert.strictEqual(ln, 401);
});

test("meshing/coords_to_line_number 8", (t) => {
  let ln = coords_to_line_number(0.7, 0.0);
  return assert.strictEqual(ln, 1401);
});

// test("meshing/coords_to_line_number", (t) => {
//   let ln = coords_to_line_number(0.5, 1.0);
//   return assert.strictEqual(ln, 1001);
// });

// test("meshing/coords_to_line_number", (t) => {
//   let ln = coords_to_line_number(0.0, 0.5);
//   return assert.strictEqual(ln, 2_000_001);
// });

// test("meshing/get_entry", async (t) => {
//   let ln = await get_entry(0.0, 0.5);
//   return assert.strictEqual(ln, 0);
// });

test("meshing/coords_to_line_number x1", (t) => {
  let ln = coords_to_line_number(0.0, 0.0);
  return assert.strictEqual(ln, 1);
});

test("meshing/coords_to_line_number x1", (t) => {
  let ln = coords_to_line_number(0.0, 1 / 2000);
  return assert.strictEqual(ln, 2001);
});

test("meshing/coords_to_line_number x1", (t) => {
  let ln = coords_to_line_number(0.0, 2 / 2000);
  return assert.strictEqual(ln, 4001);
});

test("meshing/coords_to_line_number x1", (t) => {
  let ln = coords_to_line_number(0.0, 3 / 2000);
  return assert.strictEqual(ln, 6001);
});

test("meshing/coords_to_line_number x1", (t) => {
  let ln = coords_to_line_number(0.0, 1999 / 2000);
  return assert.strictEqual(ln, 3_998_001);
});

test("meshing/coords_to_line_number x1", (t) => {
  let ln = coords_to_line_number(0.5, 0.5);
  return assert.strictEqual(ln, 2_001_001);
});
