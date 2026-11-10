# Application Server

The application server is the Python FastAPI backend. It accepts requests from the web client and coordinates image analysis, route solving, and account data stored in PostgreSQL.

Status: skeleton only. The app starts and `GET /health` returns `{"status": "ok"}`. No other features yet.

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

## Database

The server uses PostgreSQL 16 (tested with 16.15), run locally.

Create a local database and user for ClimbAssist (use your own password):

```
sudo -u postgres psql -c "CREATE USER climbassist WITH PASSWORD 'change-me';"
sudo -u postgres createdb -O climbassist climbassist
```

On macOS with Homebrew, run `createuser` / `createdb` / `psql` without `sudo -u postgres`.

Set `DATABASE_URL` in your shell (example only, fake credentials):

```
export DATABASE_URL="postgresql+psycopg://climbassist:change-me@localhost:5432/climbassist"
```

Check the connection from the `application-server/` folder:

```
python check_db.py
```

It prints `database connection OK`, or prints the error and exits with a non-zero status.
