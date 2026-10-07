# household_tracker

A small shared tracker for a home: what to buy and what to do.

- **Consumables** (milk, dish soap, …) have a status you set by hand: full, coming
  to an end, or finished. Anything coming to an end or finished shows up on the
  **To buy** list. Ticking it there sets it back to full.
- **Tasks** (vacuuming, changing bed sheets, …) have a regularity: weekly, every two
  weeks, or monthly. A task shows up on the **To do** list when it hasn't been done
  within that period, or has never been done. Ticking it marks it done today.

Everything belongs to a **household**. One person creates a household and gets a code
like `flat-12-k7m3q9xp`; others join by entering that code. There are no user
accounts — the code is the only key, so share it only with people in your household.

## Stack

- **Backend:** Python 3.10+ with [FastAPI](https://fastapi.tiangolo.com/), data in
  SQLite.
- **Frontend:** plain HTML, CSS and JavaScript, no build step. FastAPI serves it from
  the same server.

Free to use at https://212-192-2-109.sslip.io/ — no registration required.

To use it on your phone, open it in Chrome and select "Install" from the Chrome menu. You can then open it like a regular mobile app using your app drawer or by searching for "Household" on your phone.

No personal data requested. 

You can also deploy the app on your own host.

## Run locally

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.api:app --reload
```

Open http://127.0.0.1:8000 and create a household. Interactive API docs are at
http://127.0.0.1:8000/docs.

Data is stored in `backend/household.db`, created on first start. Delete the file to
start empty.

The browser remembers your household code in local storage for the address you
opened, so `127.0.0.1` and `localhost` count as different places — stick to one.

## Project structure

```
backend/
  app/
    domain/        Consumable, Task and the enums; no HTTP or storage code
    household.py   the only code that reads and writes SQLite
    schemas.py     request and response models
    api.py         HTTP endpoints; also serves frontend/
frontend/
  welcome.html     create or join a household
  index.html       To buy and To do lists
  settings.html    add consumables and tasks, change status, see the household code
  household.js     stores the household code, adds it to every API request
```

## Endpoints

| Method | Path                        | Purpose                                   |
| ------ | --------------------------- | ----------------------------------------- |
| POST   | `/households`               | create a household, returns its code      |
| POST   | `/households/join`          | check a household code exists             |
| POST   | `/consumables`              | add a consumable                          |
| GET    | `/consumables`              | list the household's consumables          |
| GET    | `/consumables/{id}`         | get one consumable                        |
| PUT    | `/consumables/{id}/status`  | set a consumable's status by hand         |
| POST   | `/tasks`                    | add a task                                |
| GET    | `/tasks`                    | list the household's tasks                |
| POST   | `/tasks/{id}/done`          | mark a task done today                    |

All endpoints except the two `/households` ones need an `X-Household-Code` header
with the household's code. A missing header returns 422, an unknown code returns 401.

Allowed values:

- `period`: `weekly`, `biweekly`, `monthly`
- `status`: `full`, `coming to an end`, `finished`
- `difficulty`: `light`, `medium`, `heavy`

Full request and response schemas are at `/docs` while the server is running.

## Deploying

Any Linux server with Python 3.10+ works. One setup that does:

- run uvicorn as a systemd service under its own user, listening on `127.0.0.1:8000`
  (no `--reload`);
- put [Caddy](https://caddyserver.com/) in front of it with `reverse_proxy
  127.0.0.1:8000` — it gets and renews an HTTPS certificate automatically;
- open only SSH, 80 and 443 in the firewall.

HTTPS is needed for the copy buttons (the browser clipboard API only works on secure
pages). Without a domain name, [sslip.io](https://sslip.io) gives you a hostname for
your server's IP that Caddy can get a certificate for.

## License

[MIT](LICENSE)
