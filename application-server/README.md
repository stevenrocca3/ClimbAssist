# Application Server

The application server is the Python FastAPI backend. It accepts requests from the web client and coordinates image analysis, route solving, and account data stored in PostgreSQL.

Status: includes `GET /health` and the `POST /api/holds/detect` hold-detection endpoint.

Developed with Python 3.9.6.

## Run locally

From the `application-server/` folder:

```
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Then check it: `curl http://localhost:8000/health`

Detect holds in an uploaded JPEG or PNG:

```
curl -F "file=@../image-analysis/fixtures/representative-holds.png" \
  http://localhost:8000/api/holds/detect
```
