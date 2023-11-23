## Requirements

- Node.js 18^
- gdal cli (make sure you can run commands like gdal_translate)

## Folders

- datagen: This is where tile maps for the landscape are being created. (Height maps, traffic noise levels, wind strength, ...)
- frontend: The actual web app, built using Three.js, Tone.js and Vue.

## Data Generation

1. `npm install`
1. `npm start`

## Frontend Development

Spin up a local file server for the tile maps:

1. Go to the datagen folder.
2. `npm run serve` (make sure no other application is using port 8080 if it complains)

In another terminal window/tab, go to the frontend folder, then..

1. `npm install`
2. `npm run dev` (or `npm run dev -- --host` if you want to test it on a device in your local network)
