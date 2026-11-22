# Web Client

The web client is the React and TypeScript frontend climbers use in a phone browser. It sends a wall photo to the application server, outlines the holds the server finds, and lets the climber select holds for a route.

Status: upload, preview, hold outlines, and hold selection are implemented. The server provides `POST /api/holds/detect`. If detection is unavailable, the page shows the checked-in sample wall and says so. An empty `holds` array asks the climber to retake the photo.

Developed with Node.js v22.23.4 and npm 10.9.9.

## Run locally

From the `web-client/` folder:

```
npm install
npm test
npm run dev
```

The dev server uses port 5173 by default. The page posts the photo to `/api/holds/detect` at `VITE_API_URL`, or `http://localhost:8000` when that variable is unset. To use live detection, start the application server using its [README](../application-server/README.md).

## Select holds

1. Open `http://localhost:5173`. Upload a JPEG or PNG and press **Detect holds**, or press **Use sample wall** to try selection without the backend.
2. Click a hold to select its color group. Click more holds to add or remove them individually. Selected holds show a check mark, a stronger outline, and their count below the photo.
3. Press **Clear selection** to choose a different color group. Replacing the photo, detecting again, loading the sample wall, or starting over clears the selection.

Holds are keyboard-accessible toggle buttons. Tab to a hold and press Enter or Space to select it.

This is partial progress on issue #5 (`Refs #5`). Start/finish markers and route generation remain planned.

## Checks

`npm test` checks normalized hold bounds, color-group selection, individual corrections, and cancellation of outdated operations. Run `npm run build` for the TypeScript/Vite build and `npm run lint` for lint checks.
