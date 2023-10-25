import sharp from "sharp";
import fs from "fs";
import { pathify } from "./util.mjs";
import { exec } from "node:child_process";

export async function geotiff_to_png(
  in_path: string,
  out_path: string,
  options?: {
    from?: number;
    to?: number;
    width?: number;
    height?: number;
  }
) {
  const { from, to, width, height } = Object.assign(
    {
      from: 0,
      to: 8000,
      width: 512,
      height: 512,
    },
    options ? options : {}
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
  if (!fs.existsSync(out_folder)) {
    fs.mkdirSync(out_folder);
  }

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
      }
    )
    .catch((e) => {
      console.log("error:", e);
    });
}
