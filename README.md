_Klanglandschaft_ is an interactive web application that explores the connection between sound and cartography and invites users to express their individual perception of the Central Swiss landscape through sound. 

![image](https://github.com/dorianzgraggen/hslu-stuw1/assets/39463388/87babeb2-24ea-4052-ade0-99c418a8c608)


:warning: _Klanglandschaft still is a prototype or a proof of concept. You will experience bugs._

## Contributing

The app is split into two components:
- frontend: The actual web app. Built using Vue.js (UI), Three.js (3D stuff) and Rete.js (Node Editor).
- datagen: Functions for creating the tiles used in the 3D landscape view.

### Frontend
Requirements: Node.js 18^ and npm

1. `npm install`
2. `npm run dev` (or `npm run dev -- --host` if you want to test it on a device in your local network)


### Data Generation

:warning: _Only fully works on Linux atm. There is a bug where the tiles for wind levels are mapped incorrectly on Windows._

If you only want to work on the frontend, you can ignore this folder. By default, the frontend fetches the tiles from a server on the internet.

Requirements: Node.js 18^, npm, gdal (make sure you can run the commands `gdal_translate`, `gdal_rasterize` and `ogr2ogr`)

1. `npm install`
2. `npm start`

This will download a lot of data from the [Federal Office of Topography](https://www.swisstopo.admin.ch/). You need about 75GB of available disk space.

It then creates multiple tile maps for every square kilometer. You can serve this tiles locally by running `npm run serve`. To make the frontend fetch the tiles locally, run the dev server using `npm run dev:local`
