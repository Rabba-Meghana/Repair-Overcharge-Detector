import aiosqlite
import json
import logging
from pathlib import Path

logger = logging.getLogger("rod.database")
DB_PATH = Path("rod.db")


async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS analyses (
                id TEXT PRIMARY KEY,
                timestamp TEXT NOT NULL,
                verdict TEXT NOT NULL,
                total_charged REAL NOT NULL,
                total_fair REAL NOT NULL,
                overcharge_amount REAL NOT NULL,
                overcharge_percent REAL NOT NULL,
                vehicle_type TEXT NOT NULL,
                summary TEXT NOT NULL,
                payload TEXT NOT NULL
            )
        """)
        await db.commit()
    logger.info("Database initialized.")


async def save_analysis(result: dict):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """INSERT OR REPLACE INTO analyses
               (id, timestamp, verdict, total_charged, total_fair,
                overcharge_amount, overcharge_percent, vehicle_type, summary, payload)
               VALUES (?,?,?,?,?,?,?,?,?,?)""",
            (
                result["id"],
                result["timestamp"],
                result["verdict"],
                result["total_charged"],
                result["total_fair"],
                result["overcharge_amount"],
                result["overcharge_percent"],
                result["vehicle_type"],
                result["summary"],
                json.dumps(result),
            ),
        )
        await db.commit()


async def get_history(limit: int = 20) -> list[dict]:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM analyses ORDER BY timestamp DESC LIMIT ?", (limit,)
        ) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]


async def get_analysis(analysis_id: str) -> dict | None:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT payload FROM analyses WHERE id=?", (analysis_id,)
        ) as cursor:
            row = await cursor.fetchone()
            if row:
                return json.loads(row["payload"])
            return None


async def get_stats() -> dict:
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT COUNT(*) as total FROM analyses") as c:
            total = (await c.fetchone())[0]
        async with db.execute("SELECT AVG(overcharge_percent) as avg FROM analyses WHERE verdict != 'FAIR'") as c:
            avg_overcharge = (await c.fetchone())[0] or 0
        async with db.execute("SELECT COUNT(*) as n FROM analyses WHERE verdict != 'FAIR'") as c:
            overcharged = (await c.fetchone())[0]
    return {
        "total_analyses": total,
        "overcharged_count": overcharged,
        "avg_overcharge_percent": round(avg_overcharge, 1),
        "detection_rate": round((overcharged / total * 100) if total else 0, 1),
    }
