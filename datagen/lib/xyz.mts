import fs from "fs";
import AdmZip from "adm-zip";
import { pathify } from "./util.mjs";
import readline from "readline";
import events from "events";

export function unzip(filepath: string, args?: { delete_source: boolean }) {
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

export async function normalize_lines_in_file(filepath) {
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
