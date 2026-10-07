# household_tracker

TBD

## Run the backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt   
uvicorn app.api:app --reload
```

The server runs at http://127.0.0.1:8000.


## Endpoints

| Method | Path                        | Purpose                           |
| ------ | --------------------------- | --------------------------------- |
| POST   | `/consumables`              | add a consumable                  |
| GET    | `/consumables`              | list all consumables              |
| GET    | `/consumables/{id}`         | get one consumable                |
| PUT    | `/consumables/{id}/status`  | set a consumable's status by hand |
