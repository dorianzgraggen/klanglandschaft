import enquirer from 'enquirer';
import { download_tiles, get_and_prepare_large_geotiffs } from './lib/download.ts';

import type { MapSampleSegement } from "./lib/util.ts"

const thun: MapSampleSegement = {
    from: {
        x: 2_610_000,
        y: 1_179_000,
    },
    to: {
        x: 2_630_000, y: 1_162_000
    }
}

console.log(process.argv);


const response = await enquirer.prompt({
    type: "select",
    name: 'value',
    message: 'Pick your favorite colors',
    choices: [
        "all",
        "download_data",
        "download_tiles",
        "build tiles"
    ]
});

console.log(response)


switch ((response as any).value) {
    case "all": {
        console.log("all")
        break;
    }

    case "download_generic_data": {
        await download_generic_data();

        break;
    }

    case "download_tiles": {
        await download_tiles(thun, "geotiff/elevation", "ch.swisstopo.swissalti3d", (url) => url.split("/")[5].split("_")[2] + ".tif");
        await download_tiles(thun, "geotiff/satellite", "ch.swisstopo.swissimage-dop10", (url) => url.split("/")[4].substring(22) + ".tif");

        break;
    }

    default:
        console.log("not implemented")
        break;
}


async function download_generic_data() {
    await get_and_prepare_large_geotiffs();
}
