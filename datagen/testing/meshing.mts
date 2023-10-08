import assert from "node:assert";
import test from "node:test";

import { get_line } from "../lib/meshing.mjs";

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
