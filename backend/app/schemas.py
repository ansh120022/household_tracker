from __future__ import annotations

from datetime import date

from pydantic import BaseModel

from .domain.consumable import Consumable
from .domain.enums import Difficulty, Period, Status
from .domain.task import Task


class HouseholdCreate(BaseModel):
    name: str


class HouseholdJoin(BaseModel):
    code: str


class HouseholdRead(BaseModel):
    code: str


class ConsumableCreate(BaseModel):
    name: str
    period: Period
    status: Status = Status.FULL


class TaskCreate(BaseModel):
    name: str
    period: Period
    difficulty: Difficulty = Difficulty.MEDIUM


class StatusUpdate(BaseModel):
    status: Status


class ConsumableRead(BaseModel):
    id: str
    name: str
    period: Period
    status: Status
    needs_restock: bool


class TaskRead(BaseModel):
    id: str
    name: str
    period: Period
    difficulty: Difficulty
    last_done: date | None
    is_due: bool


def read_consumable(c: Consumable) -> ConsumableRead:
    return ConsumableRead(
        id=c.id,
        name=c.name,
        period=c.period,
        status=c.status,
        needs_restock=c.needs_restock,
    )


def read_task(t: Task) -> TaskRead:
    return TaskRead(
        id=t.id,
        name=t.name,
        period=t.period,
        difficulty=t.difficulty,
        last_done=t.last_done,
        is_due=t.is_due(),
    )
