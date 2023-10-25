import fs from "fs";
import https from "https";
import AdmZip from "adm-zip";
import { build_mesh, get_entry } from "./lib/meshing.mjs";
import { pathify } from "./lib/util.mjs";
import { alles } from "./lib/vernunft.mjs";
import readline from "readline";
import events from "events";
import { download_if_missing, download_geotiffs } from "./lib/download.mjs";
import {
  resize_all,
  remap_all_geotiffs,
  geotiff_to_png,
  extend_height_map,
  extend_all,
} from "./lib/image_manipulation.mjs";

run();

async function run() {
  // normalize_lines_in_file(
  //   pathify("swissSURFACE3D_Raster_0.5_xyz_CHLV95_LN02_2666_1211.xyz")
  // );
  // get_entry(0.93, 0.92);

  // await download_geotiffs(2667, 1200, 2681, 1208);
  // await remap_all_geotiffs();

  // return;

  const n = "swisssurface3d-raster_2020_2678-1205_0.5_2056_5728";

  // await geotiff_to_png(
  //   pathify(`geotiff/raw/${n}.tif`),
  //   pathify(`geotiff/png/${n}.png`),
  //   { from: 400, to: 2000 }
  // );

  await extend_all();

  // await extend_height_map({
  //   main: pathify("geotiff/png/2669-1203.png"),
  //   top: pathify("geotiff/png/2669-1204.png"),
  //   right: pathify("geotiff/png/2670-1203.png"),
  //   top_right: pathify("geotiff/png/2670-1204.png"),
  //   out: pathify("geotiff/extended/2669-1203.png"),
  // });

  // remap_all_geotiffs();

  // await build_mesh();
  return;
  await alles();
  await download_if_missing(
    "xyz.zip",
    "https://data.geo.admin.ch/ch.swisstopo.swisssurface3d-raster/swisssurface3d-raster_2020_2666-1211/swisssurface3d-raster_2020_2666-1211_0.5_2056_5728.xyz.zip"
  );

  unzip("xyz.zip", { delete_source: false });
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

async function normalize_lines_in_file(filepath) {
  const outputFile = fs.createWriteStream(filepath + "_normalized");

  const rl = readline.createInterface({
    input: fs.createReadStream(filepath),
    crlfDelay: Infinity,
  });

  rl.on("line", (line) => {
    const split = line.split(" ");
    if (split.length !== 3 || line.length < 10) {
      console.log("skipped", line);
      return;
    }

    const [x, y, z] = split.map((n) =>
      (Math.round(Number(n) * 100) / 100).toFixed(2)
    );

    outputFile.write(`${x}, ${y}, ${z}\n`);

    //   console.log({ x, y, z });
    //   console.log(`Line from file: ${line}`);
  });

  await events.once(rl, "close");
  outputFile.end();

  console.log("Reading file line by line with readline done.");
  const used = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(
    `The script uses approximately ${Math.round(used * 100) / 100} MB`
  );
}
