from __future__ import annotations

import re
import secrets
import sqlite3
import uuid
from contextlib import contextmanager
from datetime import date
from pathlib import Path

from .domain.consumable import Consumable
from .domain.enums import Difficulty, Period, Status
from .domain.task import Task

DB_PATH = Path(__file__).resolve().parents[1] / "household.db"

# Lowercase letters and digits, without lookalikes like 0/o and 1/l/i.
CODE_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"


@contextmanager
def _db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def _slug(name: str) -> str:
    name = name.strip().lower().replace(" ", "-").replace("_", "-")
    return re.sub(r"[^a-z0-9-]", "", name)


def _code(name: str) -> str:
    random_part = "".join(secrets.choice(CODE_ALPHABET) for _ in range(8))
    return f"{_slug(name)}-{random_part}"


class Household:
    def __init__(self) -> None:
        with _db() as conn:
            conn.execute(
                "CREATE TABLE IF NOT EXISTS households ("
                "id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL)"
            )
            conn.execute(
                "CREATE TABLE IF NOT EXISTS consumables ("
                "id TEXT PRIMARY KEY, household_id TEXT NOT NULL, "
                "name TEXT NOT NULL, period TEXT NOT NULL, status TEXT NOT NULL)"
            )
            conn.execute(
                "CREATE TABLE IF NOT EXISTS tasks ("
                "id TEXT PRIMARY KEY, household_id TEXT NOT NULL, "
                "name TEXT NOT NULL, period TEXT NOT NULL, "
                "difficulty TEXT NOT NULL, last_done TEXT)"
            )

    def create_household(self, name: str) -> str:
        code = _code(name)
        while self.household_id(code) is not None:
            code = _code(name)
        with _db() as conn:
            conn.execute(
                "INSERT INTO households (id, code) VALUES (?, ?)",
                (uuid.uuid4().hex, code),
            )
        return code

    def household_id(self, code: str) -> str | None:
        with _db() as conn:
            row = conn.execute(
                "SELECT id FROM households WHERE code = ?", (code,)
            ).fetchone()
        return row["id"] if row else None

    def consumables(self, household_id: str) -> list[Consumable]:
        with _db() as conn:
            rows = conn.execute(
                "SELECT * FROM consumables WHERE household_id = ?", (household_id,)
            ).fetchall()
        return [_consumable(row) for row in rows]

    def add_consumable(self, household_id: str, consumable: Consumable) -> Consumable:
        with _db() as conn:
            conn.execute(
                "INSERT INTO consumables (id, household_id, name, period, status) "
                "VALUES (?, ?, ?, ?, ?)",
                (
                    consumable.id,
                    household_id,
                    consumable.name,
                    consumable.period.value,
                    consumable.status.value,
                ),
            )
        return consumable

    def consumable(self, household_id: str, id: str) -> Consumable | None:
        with _db() as conn:
            row = conn.execute(
                "SELECT * FROM consumables WHERE household_id = ? AND id = ?",
                (household_id, id),
            ).fetchone()
        return _consumable(row) if row else None

    def set_status(self, household_id: str, id: str, status: Status) -> None:
        with _db() as conn:
            conn.execute(
                "UPDATE consumables SET status = ? WHERE household_id = ? AND id = ?",
                (status.value, household_id, id),
            )

    def add_task(self, household_id: str, task: Task) -> Task:
        with _db() as conn:
            conn.execute(
                "INSERT INTO tasks "
                "(id, household_id, name, period, difficulty, last_done) "
                "VALUES (?, ?, ?, ?, ?, ?)",
                (
                    task.id,
                    household_id,
                    task.name,
                    task.period.value,
                    task.difficulty.value,
                    task.last_done.isoformat() if task.last_done else None,
                ),
            )
        return task

    def task(self, household_id: str, id: str) -> Task | None:
        with _db() as conn:
            row = conn.execute(
                "SELECT * FROM tasks WHERE household_id = ? AND id = ?",
                (household_id, id),
            ).fetchone()
        return _task(row) if row else None

    def tasks(self, household_id: str) -> list[Task]:
        with _db() as conn:
            rows = conn.execute(
                "SELECT * FROM tasks WHERE household_id = ?", (household_id,)
            ).fetchall()
        return [_task(row) for row in rows]

    def complete_task(
        self, household_id: str, id: str, on: date | None = None
    ) -> None:
        task = self.task(household_id, id)
        if task is None:
            return
        task.mark_done(on)
        with _db() as conn:
            conn.execute(
                "UPDATE tasks SET last_done = ? WHERE household_id = ? AND id = ?",
                (task.last_done.isoformat(), household_id, id),
            )


def _consumable(row: sqlite3.Row) -> Consumable:
    return Consumable(
        name=row["name"],
        period=Period(row["period"]),
        status=Status(row["status"]),
        id=row["id"],
    )


def _task(row: sqlite3.Row) -> Task:
    return Task(
        name=row["name"],
        period=Period(row["period"]),
        difficulty=Difficulty(row["difficulty"]),
        last_done=date.fromisoformat(row["last_done"]) if row["last_done"] else None,
        id=row["id"],
    )
