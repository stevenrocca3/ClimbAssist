"""Check that the Application Server can reach the database in DATABASE_URL.

Usage (from application-server/):
    python check_db.py
"""

import sys

from sqlalchemy import text

from app.db import get_engine


def main() -> int:
    try:
        engine = get_engine()
        with engine.connect() as conn:
            conn.execute(text("SELECT 1")).scalar_one()
    except Exception as exc:
        print(f"database connection failed: {exc}", file=sys.stderr)
        return 1
    print("database connection OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
