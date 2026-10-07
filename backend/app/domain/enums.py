from __future__ import annotations
from enum import Enum


class Period(Enum):
    WEEKLY = "weekly"
    BIWEEKLY = "biweekly"
    MONTHLY = "monthly"
    EVERY_2_MONTHS = "every 2 months"
    EVERY_3_MONTHS = "every 3 months"
    EVERY_4_MONTHS = "every 4 months"
    EVERY_5_MONTHS = "every 5 months"
    EVERY_6_MONTHS = "every 6 months"
    EVERY_7_MONTHS = "every 7 months"
    EVERY_8_MONTHS = "every 8 months"
    EVERY_9_MONTHS = "every 9 months"
    EVERY_10_MONTHS = "every 10 months"
    EVERY_11_MONTHS = "every 11 months"
    YEARLY = "yearly"

    @property
    def days(self) -> int:
        return {
            Period.WEEKLY: 7,
            Period.BIWEEKLY: 14,
            Period.MONTHLY: 30,
            Period.EVERY_2_MONTHS: 60,
            Period.EVERY_3_MONTHS: 90,
            Period.EVERY_4_MONTHS: 120,
            Period.EVERY_5_MONTHS: 150,
            Period.EVERY_6_MONTHS: 180,
            Period.EVERY_7_MONTHS: 210,
            Period.EVERY_8_MONTHS: 240,
            Period.EVERY_9_MONTHS: 270,
            Period.EVERY_10_MONTHS: 300,
            Period.EVERY_11_MONTHS: 330,
            Period.YEARLY: 365,
        }[self]

    @property
    def label(self) -> str:
        return {
            Period.WEEKLY: "every week",
            Period.BIWEEKLY: "every two weeks",
            Period.MONTHLY: "every month",
            Period.EVERY_2_MONTHS: "every 2 months",
            Period.EVERY_3_MONTHS: "every 3 months",
            Period.EVERY_4_MONTHS: "every 4 months",
            Period.EVERY_5_MONTHS: "every 5 months",
            Period.EVERY_6_MONTHS: "every 6 months",
            Period.EVERY_7_MONTHS: "every 7 months",
            Period.EVERY_8_MONTHS: "every 8 months",
            Period.EVERY_9_MONTHS: "every 9 months",
            Period.EVERY_10_MONTHS: "every 10 months",
            Period.EVERY_11_MONTHS: "every 11 months",
            Period.YEARLY: "every year",
        }[self]


class Status(Enum):
    FULL = "full"
    LOW = "coming to an end"
    EMPTY = "finished"


class Difficulty(Enum):
    LIGHT = "light"
    MEDIUM = "medium"
    HEAVY = "heavy"
