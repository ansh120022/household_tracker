from __future__ import annotations

from .enums import Period, Status
from .householdItem import HouseholdItem


class Consumable(HouseholdItem):
    def __init__(
        self,
        name: str,
        period: Period,
        status: Status = Status.FULL,
        id: str | None = None,
    ) -> None:
        super().__init__(name, period, id)
        self.status = status

    @property
    def needs_restock(self) -> bool:
        return self.status in (Status.LOW, Status.EMPTY)
