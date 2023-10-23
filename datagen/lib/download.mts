import fs from "fs";
import https from "https";
import { pathify } from "./util.mjs";

export async function download_geotiffs(
  from_x: number,
  from_y: number,
  to_x: number,
  to_y: number
): Promise<void> {
  const coords = new Array<{ x: number; y: number }>();

  const file = fs.readFileSync("tiff-links.csv", { encoding: "utf8" });

  const urls = file.split("\n");

  let i = 1;
  for (const url of urls) {
    console.log(i, "/", urls.length);
    const filepath = "geotiff/" + url.split("/")[5];
    await download_if_missing(filepath, url);
    i++;
  }

  console.log("done");
}

export async function download_if_missing(filepath: string, url: string) {
  const _filepath = pathify(filepath);

  if (fs.existsSync(_filepath)) {
    console.log("exists");
    return;
  }
  console.log("downloading", url);
  return new Promise<void>((resolve, reject) => {
    const file = fs.createWriteStream(_filepath);
    const request = https
      .get(url, function (response) {
        response.pipe(file);
        file.on("error", (e) => {
          console.log("file error", e);
          reject(e);
        });
        file.on("finish", () => {
          file.close();
          console.log("Download Completed", url);
          resolve();
        });
      })
      .on("error", (error) => {
        console.log("err", error);
        reject(error);
      });
  });
}
