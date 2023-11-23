import fs from "fs";
import https from "https";
import { chapter_log, mk_dir_if_not_exists, pathify } from "./util.mjs";
import AdmZip from "adm-zip";

export async function get_and_prepare_large_geotiffs() {
  chapter_log("getting large geotiffs for datasets");
  const files = [
    {
      id: "strassenlaerm_tag",
      url: "https://data.geo.admin.ch/ch.bafu.laerm-strassenlaerm_tag/data.zip",
    },
    {
      id: "windenergie-geschwindigkeit_h150",
      url: "https://data.geo.admin.ch/ch.bfe.windenergie-geschwindigkeit_h150/windenergie-geschwindigkeit_h150/windenergie-geschwindigkeit_h150_2056.tif.zip",
    },
  ];

  for (const file of files) {
    const folder = pathify(`geotiff/${file.id}`);
    const zip_path = `geotiff/${file.id}/data.zip`;

    mk_dir_if_not_exists(folder);
    await download_if_missing(zip_path, file.url);

    const zip = new AdmZip(pathify(zip_path));
    zip.extractAllTo(folder);
    console.log("unzipped", file.id);
  }
}

export async function download_geotiffs(): Promise<void> {
  mk_dir_if_not_exists(pathify("geotiff/raw"));

  const file = fs.readFileSync("tiff-links.csv", { encoding: "utf8" });

  const urls = file.split(/\r?\n/);

  let i = 1;
  for (const url of urls) {
    console.log(i, "/", urls.length);
    const filepath = "geotiff/raw/" + url.split("/")[5];
    await download_if_missing(filepath, url);
    i++;
  }

  console.log("done");
}

export async function download_elevation_lake_lucerne(): Promise<void> {
  chapter_log("downloading Elevation Geotiffs for lake lucerne area");
  return download_from_csv(
    "tiff-links-lake-lucerne.csv",
    "geotiff/raw",
    (url) => url.split("/")[5],
  );
}

export async function download_satellite(): Promise<void> {
  chapter_log("downloading satellite tiles for lake lucerne area");
  return download_from_csv(
    "tiff-links-satellite-lake-lucerne.csv",
    "geotiff/satellite",
    (url) => url.split("/")[4].substring(22) + ".tif",
  );
}

export async function download_from_csv(
  csv_path: string,
  destination_path: string,
  generate_filename: (url: string) => string,
): Promise<void> {
  mk_dir_if_not_exists(pathify(destination_path));

  const file = fs.readFileSync(csv_path, { encoding: "utf8" });

  const urls = file.split(/\r?\n/);

  let i = 1;
  for (const url of urls) {
    console.log(i, "/", urls.length);
    const filepath = destination_path + "/" + generate_filename(url);
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
