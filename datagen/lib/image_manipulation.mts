import sharp from "sharp";
import fs from "fs";
import { pathify } from "./util.mjs";
import Jimp from "jimp";
// import { fromArrayBuffer } from "geotiff";
import UTIF from "utif";
import tiff from "tiff";
import { exec } from "node:child_process";

// gdal_translate -of PNG -ot Byte -scale 400 1000 0 255 -outsize 256 256 in.tif out.png

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

export async function ut() {
  const filepath = pathify(
    "geotiff/raw/swisssurface3d-raster_2020_2679-1208_0.5_2056_5728.tif"
  );

  const buffer = fs.readFileSync(filepath);
  const ifds = UTIF.decode(buffer);

  console.log(ifds);
  const img = UTIF.decodeImage(buffer, ifds[0]);

  console.log(img);

  return;

  const a = tiff.decode(buffer, { ignoreImageData: true });

  console.log(a);

  const pages = tiff.pageCount(buffer);
  const multipage = tiff.isMultiPage(buffer);
  console.log({ multipage, pages });
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

// export async function remap_geotiff(
//   file_in: string,
//   file_out: string
// ): Promise<sharp.OutputInfo> {
//   const filepath = pathify(file_in);

//   const buffer = fs.readFileSync(filepath);

//   const tiff = await fromArrayBuffer(buffer.buffer);

//   const image = await tiff.getImage(); // by default, the first image is read.

//   const width = image.getWidth();
//   const height = image.getHeight();
//   const tileWidth = image.getTileWidth();
//   const tileHeight = image.getTileHeight();
//   const samplesPerPixel = image.getSamplesPerPixel();

//   // when we are actually dealing with geo-data the following methods return
//   // meaningful results:
//   const origin = image.getOrigin();
//   const resolution = image.getResolution();
//   const bbox = image.getBoundingBox();

//   console.log({
//     width,
//     height,
//     tileWidth,
//     tileHeight,
//     samplesPerPixel,
//     origin,
//     resolution,
//     bbox,
//   });

//   const [data] = (await image.readRasters()) as Array<Float32Array>;

//   console.log(data);

//   const remapped = data.map((v) => ((v - 400) / 3000) * 255);

//   console.log("lol", typeof data);
//   console.log("lol", remapped);

//   const img = await sharp(remapped, {
//     raw: {
//       width: 2000,
//       height: 2000,
//       channels: 1,
//     },
//   });

//   return img.toFile(pathify(file_out));
// }

export async function sharppp() {
  sharp(
    pathify(
      "geotiff/raw/swisssurface3d-raster_2020_2679-1208_0.5_2056_5728.tif"
    ),
    {
      raw: {
        width: 2000,
        height: 2000,
        channels: 1,
      },
    }
  )
    .raw()
    .toBuffer({ resolveWithObject: true })
    .then(({ data, info }) => {
      console.log(info);
      console.log(data);
      console.log(data.buffer);
      console.log(data[230]);
      // Handle the image data here
      // The data variable now contains the raw image data
    })
    .catch((error) => {
      console.error("Error loading the image:", error);
    });
}

export async function jimppp() {
  Jimp.read(
    pathify(
      "geotiff/raw/swisssurface3d-raster_2020_2679-1208_0.5_2056_5728.tif"
    ),
    (err, image) => {
      if (err) throw err;

      // Define the range of values in the TIFF image
      const tiffMinValue = 500;
      const tiffMaxValue = 3000;

      // Create a new PNG image with the same dimensions
      const pngImage = new Jimp(
        image.getWidth(),
        image.getHeight(),
        0x00000000
      ); // Initialize with transparent pixels

      // Remap values and set them in the PNG image
      image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
        // Get the original pixel value in the TIFF image
        const originalValue = image.bitmap.data.readFloatBE(idx);
        // const originalValue = image.bitmap.data.readUInt32BE(idx);
        // const originalValue = image.bitmap.data.read(idx);
        // const lol = image.bitmap.data.read(idx);
        const value = image.bitmap.data.readFloatBE;

        console.log({ originalValue });

        const l = image.bitmap.data.length;

        var red = image.bitmap.data[idx + 0];
        var green = image.bitmap.data[idx + 1];
        var blue = image.bitmap.data[idx + 2];
        var alpha = image.bitmap.data[idx + 3];
        // console.log({ red, green, blue });

        // Remap the value to the 0-1 range
        const remappedValue =
          (originalValue - tiffMinValue) / (tiffMaxValue - tiffMinValue);

        // Set the remapped value in the PNG image (as a grayscale pixel)
        const grayscaleValue = red;

        // console.log({ grayscaleValue });

        pngImage.setPixelColor(
          Jimp.rgbaToInt(grayscaleValue, grayscaleValue, grayscaleValue, 255),
          x,
          y
        );
      });

      console.log("scanned");

      // Save the PNG image
      pngImage.write("lol.png", (err) => {
        if (err) {
          console.log(err);
        }
        console.log("Remapped image saved as output.png");
      });
    }
  );
}

export async function process_all() {
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
