from __future__ import annotations

from pathlib import Path

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.staticfiles import StaticFiles

from .domain.consumable import Consumable
from .household import Household
from .schemas import (
    ConsumableCreate,
    HouseholdCreate,
    HouseholdJoin,
    HouseholdRead,
    StatusUpdate,
    read_consumable,
)

app = FastAPI()
household = Household()

FRONTEND_DIR = Path(__file__).resolve().parents[2] / "frontend"


def household_id(x_household_code: str = Header(...)) -> str:
    hid = household.household_id(x_household_code)
    if hid is None:
        raise HTTPException(status_code=401, detail="unknown household code")
    return hid


@app.post("/households", response_model=HouseholdRead)
def create_household(body: HouseholdCreate):
    return HouseholdRead(code=household.create_household(body.name))


@app.post("/households/join", response_model=HouseholdRead)
def join_household(body: HouseholdJoin):
    if household.household_id(body.code) is None:
        raise HTTPException(status_code=404, detail="household not found")
    return HouseholdRead(code=body.code)


@app.post("/consumables")
def create_consumable(body: ConsumableCreate, hid: str = Depends(household_id)):
    consumable = Consumable(name=body.name, period=body.period, status=body.status)
    household.add_consumable(hid, consumable)
    return read_consumable(consumable)


@app.get("/consumables")
def list_consumables(hid: str = Depends(household_id)):
    return [read_consumable(c) for c in household.consumables(hid)]


@app.get("/consumables/{id}")
def get_consumable(id: str, hid: str = Depends(household_id)):
    consumable = household.consumable(hid, id)
    if consumable is None:
        raise HTTPException(status_code=404, detail="consumable not found")
    return read_consumable(consumable)


@app.put("/consumables/{id}/status")
def set_consumable_status(
    id: str, body: StatusUpdate, hid: str = Depends(household_id)
):
    if household.consumable(hid, id) is None:
        raise HTTPException(status_code=404, detail="consumable not found")
    household.set_status(hid, id, body.status)
    return read_consumable(household.consumable(hid, id))


app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
