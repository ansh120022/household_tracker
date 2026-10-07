"""A task: a chore you repeat on a schedule."""

from __future__ import annotations

from datetime import date, timedelta

from .enums import Difficulty, Period
from .householdItem import HouseholdItem


class Task(HouseholdItem):

    def __init__(
        self,
        name: str,
        period: Period,
        difficulty: Difficulty = Difficulty.MEDIUM,
        last_done: date | None = None,
        id: str | None = None,
    ) -> None:
        super().__init__(name, period, id)
        self.difficulty = difficulty
        self.last_done = last_done

    def is_due(self, today: date | None = None) -> bool:
        today = today or date.today()
        if self.last_done is None:
            return True
        return today - self.last_done >= timedelta(days=self.period.days)

    def mark_done(self, on: date | None = None) -> None:
        self.last_done = on or date.today()
