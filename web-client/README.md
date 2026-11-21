# Web Client

The web client is the React and TypeScript frontend climbers use in a phone browser. It sends a wall photo to the application server and outlines the holds the server finds.

Status: upload, preview, and hold outlines are implemented. The detection endpoint is not on the server yet. If `POST /api/holds/detect` is missing or fails, the page shows the checked-in sample wall and says so. An empty `holds` array asks the climber to retake the photo.

Developed with Node.js v22.23.4 and npm 10.9.9.

## Run locally

From the `web-client/` folder:

```
npm install
npm run dev
```

The dev server uses port 5173 by default. The page calls `GET /health` at `VITE_API_URL`, or `http://localhost:8000` when that variable is unset. If the request fails, the page shows "Server not reachable".

## Hold detection demo

Open `http://localhost:5173/#hold-detection-demo` while the FastAPI server is
running on port 8000. This hash-routed demo is isolated from the permanent app
screen and does not add a second upload flow to Jayson's confirmed-photo work.
Choose a JPEG or PNG, verify colored outlines and labels appear, then choose the
empty fixture and verify "No holds found. Retake the photo." appears.
