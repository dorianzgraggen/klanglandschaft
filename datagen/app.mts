import { alles } from "./lib/vernunft.mjs";
import {
  resize_all,
  remap_all_geotiffs,
  geotiff_to_png,
  extend_height_map,
  extend_all,
} from "./lib/image_manipulation.mjs";
import { unzip, normalize_lines_in_file } from "./lib/xyz.mjs";

run();

async function run() {
  // normalize_lines_in_file(
  //   pathify("swissSURFACE3D_Raster_0.5_xyz_CHLV95_LN02_2666_1211.xyz")
  // );

  // await download_geotiffs(2667, 1200, 2681, 1208);
  // await remap_all_geotiffs();

  // const n = "swisssurface3d-raster_2020_2678-1205_0.5_2056_5728";
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
  // unzip("xyz.zip", { delete_source: false });
}
