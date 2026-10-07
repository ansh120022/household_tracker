from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles

from .domain.consumable import Consumable
from .household import Household
from .schemas import (
    ConsumableCreate,
    StatusUpdate,
    read_consumable,
)

app = FastAPI()
household = Household()

FRONTEND_DIR = Path(__file__).resolve().parents[2] / "frontend"


@app.post("/consumables")
def create_consumable(body: ConsumableCreate):
    consumable = Consumable(name=body.name, period=body.period, status=body.status)
    household.add_consumable(consumable)
    return read_consumable(consumable)


@app.get("/consumables")
def list_consumables():
    return [read_consumable(c) for c in household.consumables]


@app.get("/consumables/{id}")
def get_consumable(id: str):
    consumable = household.consumable(id)
    if consumable is None:
        raise HTTPException(status_code=404, detail="consumable not found")
    return read_consumable(consumable)


@app.put("/consumables/{id}/status")
def set_consumable_status(id: str, body: StatusUpdate):
    consumable = household.consumable(id)
    if consumable is None:
        raise HTTPException(status_code=404, detail="consumable not found")
    household.set_status(id, body.status)
    return read_consumable(consumable)


app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
