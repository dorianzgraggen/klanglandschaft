import path from "path";

export function pathify(file_path: string) {
  return path.join("data", file_path);
}
