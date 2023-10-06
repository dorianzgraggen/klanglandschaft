import sqlite3 from "sqlite3";
import { pathify } from "./lib/util.mjs";
import events from "events";
import fs from "fs";
import readline from "readline";

const db = new (sqlite3.verbose().Database)(pathify("db.sqlite"));

db.serialize(async () => {
  const command = `
    CREATE TABLE IF NOT EXISTS Points (
      XCoordLV95 DECIMAL(10,2),
      YCoordLV95 DECIMAL(10,2),
      ZCoordLV95 DECIMAL(10,2),
      PRIMARY KEY(XCoordLV95, YCoordLV95)
    );
  `;

  db.run(command);

  const statement = db.prepare(
    "INSERT INTO Points (XCoordLV95,YCoordLV95,ZCoordLV95) VALUES (?, ?, ?)"
  );

  await extract_xyz_and_process(
    pathify("swissSURFACE3D_Raster_0.5_xyz_CHLV95_LN02_2666_1211.xyz"),
    (x, y, z) => {
      statement.run(x, y, z);
    }
  );

  //   stmt.run(2666004.75, 1211999.75, 469.82);

  statement.finalize();
});

db.close();

async function extract_xyz_and_process(
  filepath: string,
  callback: (x, y, z) => void
) {
  try {
    const rl = readline.createInterface({
      input: fs.createReadStream(filepath),
      crlfDelay: Infinity,
    });

    rl.on("line", (line) => {
      const split = line.split(" ");
      if (split.length !== 3) {
        return;
      }

      const [x, y, z] = split.map((n) => Number(n));
      callback(x, y, z);

      //   console.log({ x, y, z });
      //   console.log(`Line from file: ${line}`);
    });

    await events.once(rl, "close");

    console.log("Reading file line by line with readline done.");
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(
      `The script uses approximately ${Math.round(used * 100) / 100} MB`
    );
  } catch (err) {
    console.error(err);
  }
}
