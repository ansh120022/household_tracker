from __future__ import annotations
from enum import Enum


class Period(Enum):
    WEEKLY = 7
    BIWEEKLY = 14
    MONTHLY = 30

    @property
    def days(self) -> int:
        return self.value

    @property
    def label(self) -> str:
        return {
            Period.WEEKLY: "every week",
            Period.BIWEEKLY: "every two weeks",
            Period.MONTHLY: "every month",
        }[self]


class Status(Enum):
    FULL = "full"
    LOW = "coming to an end"
    EMPTY = "finished"


class Difficulty(Enum):
    LIGHT = "light"
    MEDIUM = "medium"
    HEAVY = "heavy"
