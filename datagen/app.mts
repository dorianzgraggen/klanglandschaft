import { alles } from "./lib/vernunft.mjs";
import {
  resize_all,
  remap_all_geotiffs,
  geotiff_to_png,
  extend_height_map,
  extend_all,
  crop_geotiff,
  crop_all_noise_levels,
  crop_all_wind_levels,
  generate_all_railway_tiles,
  manipulate_swisstlm3d_layers,
  generate_all_building_tiles,
  generate_all_water_tiles,
  generate_all_forest_tiles,
  resize_satellites,
} from "./lib/image_manipulation.mjs";
import { unzip, normalize_lines_in_file } from "./lib/xyz.mjs";
import {
  download_elevation_lake_lucerne,
  download_geotiffs,
  download_satellite,
  get_and_prepare_large_geotiffs,
  get_swisstlm3d_gpkg,
} from "./lib/download.mjs";
import { pathify } from "./lib/util.mjs";

run();

/**
 * How to use:
 * (un)comment whatever function you want to run at the moment.
 * Some of these download pretty large files (up to 4.5GB), so they might take quite some time!
 */
async function run() {
  // await download_elevation_lake_lucerne();
  // await remap_all_geotiffs();
  // await extend_all();

  // await download_satellite();

  // await get_and_prepare_large_geotiffs();
  // await crop_all_noise_levels();
  // await crop_all_wind_levels();

  await resize_satellites();

  // await get_swisstlm3d_gpkg();
  // await manipulate_swisstlm3d_layers();
  // await generate_all_railway_tiles();
  // await generate_all_building_tiles();
  // await generate_all_lake_tiles();
  // await generate_all_water_tiles();
  // await generate_all_forest_tiles();
}

async function test() {
  // normalize_lines_in_file(
  //   pathify("swissSURFACE3D_Raster_0.5_xyz_CHLV95_LN02_2666_1211.xyz")
  // );
  // const n = "swisssurface3d-raster_2020_2678-1205_0.5_2056_5728";
  // await geotiff_to_png(
  //   pathify(`geotiff/raw/${n}.tif`),
  //   pathify(`geotiff/png/${n}.png`),
  //   { from: 400, to: 2000 }
  // );
  // await extend_height_map({
  //   main: pathify("geotiff/png/2669-1203.png"),
  //   top: pathify("geotiff/png/2669-1204.png"),
  //   right: pathify("geotiff/png/2670-1203.png"),
  //   top_right: pathify("geotiff/png/2670-1204.png"),
  //   out: pathify("geotiff/extended/2669-1203.png"),
  // });
  // await build_mesh();
  // unzip("xyz.zip", { delete_source: false });
}
