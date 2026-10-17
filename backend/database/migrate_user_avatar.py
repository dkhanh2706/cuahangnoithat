"""Run from backend: python -B -m database.migrate_user_avatar."""
from sqlalchemy import text
from database.database import engine


if __name__ == "__main__":
    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT"))
    print("Added nullable users.avatar_url if missing")
