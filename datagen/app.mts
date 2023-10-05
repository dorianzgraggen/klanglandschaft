import fs from "fs";
import https from "https";
import AdmZip from "adm-zip";
import { build_mesh } from "./lib/meshing.mjs";
import { pathify } from "./lib/util.mjs";

run();

async function run() {
  await build_mesh();

  return;
  await download_if_missing(
    "xyz.zip",
    "https://data.geo.admin.ch/ch.swisstopo.swisssurface3d-raster/swisssurface3d-raster_2020_2666-1211/swisssurface3d-raster_2020_2666-1211_0.5_2056_5728.xyz.zip"
  );

  unzip("xyz.zip", { delete_source: false });
}

async function download_if_missing(filepath: string, url: string) {
  const _filepath = pathify(filepath);

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

function unzip(filepath: string, args?: { delete_source: boolean }) {
  const _args = {
    delete_source: true,
    ...args,
  };

  const zip = new AdmZip(pathify(filepath));
  const entries = zip.getEntries();

  if (entries.length !== 1) {
    throw new Error("Expected zip to have one file only");
  }

  if (fs.existsSync(pathify(entries[0].entryName))) {
    console.log("Skipped unzipping, already exists");
    return;
  }

  try {
    zip.extractEntryTo(entries[0], pathify("/"));
  } catch (error) {
    console.error("Couldn't unzip:", error);
  }

  if (_args.delete_source) {
    fs.unlinkSync(pathify("xyz.zip"));
  }
}
