import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "meals.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  
    return conn


def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS meals (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            dish_name     TEXT NOT NULL,
            calories      REAL,
            protein_g     REAL,
            carbs_g       REAL,
            fat_g         REAL,
            fiber_g       REAL,
            sodium_mg     REAL,
            sugar_g       REAL,
            quality_score INTEGER,
            logged_at     TEXT NOT NULL
        )
    """)

    conn.commit()
    conn.close()