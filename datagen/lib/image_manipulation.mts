import sharp from "sharp";
import fs from "fs";
import { chapter_log, mk_dir_if_not_exists, pathify } from "./util.mjs";
import { exec } from "node:child_process";

const from_x = 2658;
const to_x = 2695;
const from_y = 1191;
const to_y = 1218;

async function for_every_tile(
  callback: (x: number, y: number, i: number) => Promise<void>,
) {
  let i = 0;
  for (let x = from_x; x < to_x - 1; x++) {
    for (let y = from_y; y < to_y - 1; y++) {
      i++;
      await callback(x, y, i);
    }
  }
}

export async function crop_all_noise_levels() {
  chapter_log("cropping noise levels");

  mk_dir_if_not_exists(pathify("geotiff/cropped"));

  await for_every_tile(
    async (x, y, i) =>
      await crop_geotiff(
        pathify(
          "geotiff/strassenlaerm_tag/STRASSENLAERM_Tag/StrassenLaerm_Tag_LV95.tif",
        ),
        pathify(`geotiff/cropped/${x}-${y}-strassenlaerm.png`),
        {
          from_x: x,
          from_y: y,
          to_x: x + 1,
          to_y: y + 1,
          out_width: 256,
          out_height: 256,
        },
      ),
  );
}

export async function crop_all_wind_levels() {
  chapter_log("cropping wind levels");

  mk_dir_if_not_exists(pathify("geotiff/cropped"));

  await for_every_tile(
    async (x, y, i) =>
      await crop_geotiff(
        pathify(
          "geotiff/windenergie-geschwindigkeit_h150/WINDATLAS_SCHWEIZ_HEIGHT_LEVEL_150_CH_2018.tif",
        ),
        pathify(`geotiff/cropped/${x}-${y}-wind.png`),
        {
          from_x: x,
          from_y: y,
          to_x: x + 1,
          to_y: y + 1,
          out_width: 256,
          out_height: 256,
          from: 0,
          to: 9,
        },
      ),
  );
}

export async function extend_all() {
  chapter_log("extending elevation geotiffs");

  mk_dir_if_not_exists(pathify("geotiff/extended"));

  let i = 0;
  for (let x = from_x; x < to_x - 1; x++) {
    for (let y = from_y; y < to_y - 1; y++) {
      console.log("extending", x, y);

      await extend_height_map({
        main: pathify(`geotiff/png/${x}-${y}.png`),
        top: pathify(`geotiff/png/${x}-${y + 1}.png`),
        right: pathify(`geotiff/png/${x + 1}-${y}.png`),
        top_right: pathify(`geotiff/png/${x + 1}-${y + 1}.png`),
        out: pathify(`geotiff/extended/${x}-${y}.png`),
      });
      i++;
      console.log("extended", i, ":", x, y);
    }
  }
}

export async function extend_height_map(options: {
  main: string;
  top: string;
  right: string;
  top_right: string;
  out: string;
}) {
  return sharp({
    create: {
      width: 64,
      height: 64,
      channels: 3,
      background: { r: 0, g: 0, b: 0 },
    },
  })
    .composite([
      { input: options.main, top: 1, left: 0, tile: false, blend: "add" },
      { input: options.top, top: -62, left: 0, tile: false, blend: "add" },
      { input: options.right, top: 1, left: 63, tile: false, blend: "add" },
      {
        input: options.top_right,
        top: -62,
        left: 63,
        tile: false,
        blend: "add",
      },
    ])
    .toFile(options.out);
}

export async function crop_geotiff(
  in_path: string,
  out_path: string,
  options: {
    out_width: number;
    out_height: number;
    from_x: number;
    from_y: number;
    to_x: number;
    to_y: number;
    from?: number;
    to?: number;
  },
): Promise<void> {
  const command = `gdal_translate 
    -projwin ${options.from_x}000 ${options.to_y}000 ${options.to_x}000 ${
      options.from_y
    }000 
    ${
      typeof options.from !== "undefined" && typeof options.to !== "undefined"
        ? `-scale ${options.from} ${options.to} 0 255`
        : ``
    }
    ${in_path}
    ${out_path}
  `.replaceAll(/\r?\n/gi, "");

  console.log({ command });

  return new Promise<void>((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err) {
        // node couldn't execute the command
        reject(err);
      }

      // the *entire* stdout and stderr (buffered)
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);

      resolve();
    });
  });
}

export async function geotiff_to_png(
  in_path: string,
  out_path: string,
  options?: {
    from?: number;
    to?: number;
    width?: number;
    height?: number;
  },
) {
  const { from, to, width, height } = Object.assign(
    {
      from: 0,
      to: 8000,
      width: 512,
      height: 512,
    },
    options ? options : {},
  );

  const command = `gdal_translate -of PNG -ot Byte -scale ${from} ${to} 0 255 -outsize ${width} ${height} ${in_path} ${out_path}`;

  return new Promise<void>((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err) {
        // node couldn't execute the command
        reject(err);
      }

      // the *entire* stdout and stderr (buffered)
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);

      resolve();
    });
  });
}

export async function remap_all_geotiffs() {
  chapter_log("remapping elevation geotiffs");

  const files = fs
    .readdirSync(pathify("geotiff/raw"))
    .map((f) => "geotiff/raw/" + f);

  const out_folder = pathify("geotiff/png");
  mk_dir_if_not_exists(out_folder);

  let i = 0;
  for (const file of files) {
    let output_path = file.replace("raw", "png");
    output_path = output_path.substring(39, 48) + ".png";
    output_path = "geotiff/png/" + output_path;
    console.log({ file, output: output_path });

    await geotiff_to_png(pathify(file), pathify(output_path), {
      // there's no point in the area with an elevation <400m above sea level,
      // so we set it as the lower limit
      from: 400,
      // there's no point in the area with an elevation >3000m above sea level,
      // so we set it as the upper limit
      to: 3000,
      // only 63 pixels wide, because we're gonna add a one pixel row on each side later
      width: 63,
      height: 63,
    });

    i++;
    console.log("remapped", i, files.length);
  }
}

export async function resize_all() {
  const files = fs
    .readdirSync(pathify("geotiff/raw"))
    .map((f) => pathify("geotiff/raw/" + f));
  console.log(files);

  const out_folder = pathify("geotiff/resized");
  if (!fs.existsSync(out_folder)) {
    fs.mkdirSync(out_folder);
    return;
  }

  let i = 0;
  for (const file of files) {
    let output = file.replace("raw", "resized");
    output = output.replace(".tif", ".png");
    await resize(file, output);
    i++;
    console.log("processed", i, files.length);
  }
}

export async function resize(input: string, output: string): Promise<any> {
  return sharp(input)
    .resize(510, 510, {
      kernel: sharp.kernel.nearest,
      fit: "contain",
    })
    .toFile(output)
    .then(
      (a) => {
        console.log("fullfilled", a);
      },
      (b) => {
        console.log("rejected", b);
      },
    )
    .catch((e) => {
      console.log("error:", e);
    });
}
