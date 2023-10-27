import sharp from "sharp";
import fs from "fs";
import { mk_dir_if_not_exists, pathify } from "./util.mjs";
import { exec } from "node:child_process";

export async function extend_all() {
  mk_dir_if_not_exists(pathify("geotiff/extended"));

  const from_x = 2668;
  const to_x = 2680;
  const from_y = 1202;
  const to_y = 1210;

  let i = 0;
  for (let x = from_x; x < to_x; x++) {
    for (let y = from_y; y < to_y; y++) {
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
  const files = fs
    .readdirSync(pathify("geotiff/raw"))
    .map((f) => "geotiff/raw/" + f);
  console.log(files);

  const out_folder = pathify("geotiff/png");
  mk_dir_if_not_exists(out_folder);

  let i = 0;
  for (const file of files) {
    let output = file.replace("raw", "png");

    // output = output.replace(".tif", ".png");
    output = output.substring(39, 48) + ".png";
    output = "geotiff/png/" + output;
    console.log({ file, output });

    await geotiff_to_png(pathify(file), pathify(output), {
      from: 400,
      to: 2000,
      width: 63,
      height: 63,
    });
    // await remap_geotiff(file, output);

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
