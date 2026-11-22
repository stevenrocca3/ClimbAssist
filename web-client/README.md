# Web Client

The web client is the React and TypeScript frontend climbers use in a phone browser. It sends a wall photo to the application server and outlines the holds the server finds.

Status: upload, preview, and hold outlines are implemented. The detection endpoint is not on the server yet. If `POST /api/holds/detect` is missing or fails, the page shows the checked-in sample wall and says so. An empty `holds` array asks the climber to retake the photo.

Developed with Node.js v22.23.4 and npm 10.9.9.

## Run locally

From the `web-client/` folder:

```
npm install
npm test
npm run dev
```

`npm test` checks that a hold box stays inside the photo. `x`, `y`, `width`, and `height` are fractions from 0 to 1, and `x + width` and `y + height` must not pass 1.

The dev server uses port 5173 by default. Open http://localhost:5173.

Choose a JPEG or PNG up to 10 MB, check the preview, then choose Detect holds. The page posts the file as `multipart/form-data` under the field `file` to `POST /api/holds/detect` at `VITE_API_URL`, or `http://localhost:8000` when that variable is unset. A successful response looks like this:

```json
{
  "holds": [
    { "id": "h1", "color": "yellow", "x": 0.42, "y": 0.83, "width": 0.09, "height": 0.06 }
  ]
}
```

`x` and `y` are the top-left corner of the box, as fractions of the image from 0 to 1. `width` and `height` are fractions of the image too. The page draws one outline per hold. `{"holds":[]}` means nothing was found.

Use Sample wall to skip the upload and show `public/fixtures/sample-wall.png` with `public/fixtures/sample-holds.json`. That path does not need the application server.
