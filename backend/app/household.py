from __future__ import annotations

from datetime import date

from .domain.consumable import Consumable
from .domain.enums import Status
from .domain.task import Task


class Household:
    def __init__(self) -> None:
        self.consumables: list[Consumable] = []
        self.tasks: list[Task] = []

    def add_consumable(self, consumable: Consumable) -> Consumable:
        self.consumables.append(consumable)
        return consumable

    def add_task(self, task: Task) -> Task:
        self.tasks.append(task)
        return task

    def consumable(self, id: str) -> Consumable | None:
        return next((c for c in self.consumables if c.id == id), None)

    def task(self, id: str) -> Task | None:
        return next((t for t in self.tasks if t.id == id), None)

    def shopping_list(self) -> list[Consumable]:
        return [c for c in self.consumables if c.needs_restock]

    def todo_list(self, today: date | None = None) -> list[Task]:
        return [t for t in self.tasks if t.is_due(today)]

    def set_status(self, id: str, status: Status) -> None:
        consumable = self.consumable(id)
        if consumable is not None:
            consumable.status = status

    def complete_task(self, id: str, on: date | None = None) -> None:
        task = self.task(id)
        if task is not None:
            task.mark_done(on)
