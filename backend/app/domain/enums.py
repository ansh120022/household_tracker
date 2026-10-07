from __future__ import annotations
from enum import Enum


class Period(Enum):
    WEEKLY = "weekly"
    BIWEEKLY = "biweekly"
    MONTHLY = "monthly"

    @property
    def days(self) -> int:
        return {
            Period.WEEKLY: 7,
            Period.BIWEEKLY: 14,
            Period.MONTHLY: 30,
        }[self]

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
