from __future__ import annotations
import uuid
from .enums import Period


class HouseholdItem:
    def __init__(self, name: str, period: Period, id: str | None = None) -> None:
        self.id = id or uuid.uuid4().hex
        self.name = name
        self.period = period

    def __repr__(self) -> str:
        return f"{type(self).__name__}(name={self.name!r}, period={self.period.name})"
