import path from "path";

export function pathify(file_path: string) {
  return path.join("files", file_path);
}
