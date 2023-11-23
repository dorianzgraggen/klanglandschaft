import path from "path";
import fs from "fs";

export function pathify(file_path: string) {
  return path.join("data", file_path);
}

export function mk_dir_if_not_exists(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function chapter_log(...args) {
  console.log("\n :::::", ...args);
}
