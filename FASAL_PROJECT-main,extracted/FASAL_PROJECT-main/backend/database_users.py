"""
backend/database_users.py

User / Farmer persistence helper for FASAL's auth and community routes.
Backed by fasal.db SQLite database.
"""

import sqlite3
import os
from typing import Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "fasal.db")


def _get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_users_table():
    with _get_connection() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS farmers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                phone TEXT UNIQUE,
                state TEXT DEFAULT 'Maharashtra',
                district TEXT DEFAULT 'Nagpur',
                land_size REAL DEFAULT 4.0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()


# Initialize table on import
init_users_table()


def get_or_create_user(phone: str) -> dict:
    with _get_connection() as conn:
        cursor = conn.execute("SELECT * FROM farmers WHERE phone = ?", (phone,))
        row = cursor.fetchone()
        if row:
            return dict(row)

        default_name = f"Farmer {phone[-4:]}"
        cursor = conn.execute(
            "INSERT INTO farmers (name, phone, state, district, land_size) VALUES (?, ?, ?, ?, ?)",
            (default_name, phone, "Maharashtra", "Nagpur", 4.0)
        )
        conn.commit()
        user_id = cursor.lastrowid
        cursor = conn.execute("SELECT * FROM farmers WHERE id = ?", (user_id,))
        new_row = cursor.fetchone()
        return dict(new_row) if new_row else {"id": user_id, "name": default_name, "phone": phone, "state": "Maharashtra", "district": "Nagpur", "land_size": 4.0}


def get_user_by_id(user_id: int) -> Optional[dict]:
    with _get_connection() as conn:
        cursor = conn.execute("SELECT * FROM farmers WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        return dict(row) if row else None


def update_user(user_id: int, updates: dict) -> Optional[dict]:
    if not updates:
        return get_user_by_id(user_id)

    fields = []
    values = []
    for k, v in updates.items():
        if k in ("name", "state", "district", "land_size"):
            fields.append(f"{k} = ?")
            values.append(v)

    if not fields:
        return get_user_by_id(user_id)

    values.append(user_id)
    with _get_connection() as conn:
        conn.execute(f"UPDATE farmers SET {', '.join(fields)} WHERE id = ?", values)
        conn.commit()

    return get_user_by_id(user_id)
