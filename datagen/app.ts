import * as fs from "fs";
import * as https from "https";
import path from "path";

run();

async function run() {
  download_if_missing(
    "xyz.zip",
    "https://data.geo.admin.ch/ch.swisstopo.swisssurface3d-raster/swisssurface3d-raster_2020_2666-1211/swisssurface3d-raster_2020_2666-1211_0.5_2056_5728.xyz.zip"
  );
}

async function download_if_missing(filepath: string, url: string) {
  const _filepath = path.join("files", filepath);

  if (fs.existsSync(_filepath)) {
    console.log("exists");
    return;
  }

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(_filepath);
    const request = https.get(url, function (response) {
      response.pipe(file);

      file.on("finish", () => {
        file.close();
        console.log("Download Completed");
        resolve;
      });
    });
  });
}
