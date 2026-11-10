# Web Client

The web client is the React and TypeScript frontend climbers use in a phone browser. It sends wall photos and account actions to the application server and shows the recommended way to complete a route.

Status: Vite + React + TypeScript start page. It shows the ClimbAssist name and the `GET /health` result.

Developed with Node.js v22.23.4 and npm 10.9.9.

## Run locally

From the `web-client/` folder:

```
npm install
npm run dev
```

The dev server uses port 5173 by default. The page calls `GET /health` at `VITE_API_URL`, or `http://localhost:8000` when that variable is unset. If the request fails, the page shows "Server not reachable".
