# Household Manager

A shared tracker for your home: what to buy and what to do.

Use it for free at https://household-manager.duckdns.org/. You need no registration.

- [For users](#for-users)
- [For contributors](#for-contributors)

---

# For users

## Why this app exists

This isn’t another productivity app designed to turn your personal life into a corporate project. 

It’s simply an up-to-date, shared space for the things that keep your home running smoothly, right when you want to handle them. 

It’s built for people living together who want to contribute equally and designed to prevent that situation when one person becomes the default memory-keeper, while the other — even when genuinely wanting to help — gets caught off guard by reminders at the wrong moment. 

By design, this app has zero push notifications. 

The point is that you open it only when you have the energy and time to give to your home. This system is here to support your life at your own pace, never to dictate it.

## Who it fits

**Chores.** You tidy when the mood hits and tolerate some mess. When you need a pause from a difficult intellectual taks or need a quick win, open the app, filter the waiting tasks by energy level (Light, Medium or Heavy), do one, and tick the box.

**Shopping.** You pass a store every other day without a list. Open the app to see what your home needs.

## Who it doesn't fit

- Households with strict daily routines, such as pet care. 
- Shoppers who make one big weekly trip with a fixed checklist.

#### How It Works

**1. Manual Initial Setup** Navigate to Settings to add your household basics: 

**Consumables**: Shampoo, dish soap, hand soap, paper towels, etc. **Repeatable Chores**: Cleaning the bathroom, dusting, vacuuming, changing filters. 

When you first begin, it may be not easy to define the interval low long the consumable lasts or how often a chore is best to be done. Feel free to set longer intervals rather than shorter ones, as we don't want things to appear on the list earlier than nesessary.  You can always adjust these periods later in Settings as you find a rhythm. 

**2. What happens automatically** 

Once a set period passes — meaning a consumable is likely running low or a chore was last done a while ago — it appears on your list. The app syncs in real-time across devices, so everyone sharing household have an an actual view of what’s needed without needing to look around or ask. Here is how checking things off works: Checking a Chore: Marks it as Complete. The chore will appear again once its next period arrives. Checking a Consumable: Marks it as Full. 

**3. Quick Adds for daily flexibility** 

One-time additions are now possible: When I need to grab specific ingredients for a recipe I want to try tonight, I just quick-add it straight to the list. Items added this way don't need a repeat schedule, unless you choose to turn a quick-added item into a recurring later - then find it in settings and set a period. 



---

## For contributors

#### Overview

Everything belongs to a **household**. Creating one returns a code: the household name in lowercase with hyphens, plus 8 random characters, such as `flat-12-k7m3q9xp`. Others join with that code. The app has no user accounts, so the code is the only key.

**Consumables** (milk, dish soap) have a status you set by hand: `full`, `running low` or `finished`. `Consumable.needs_restock` is true for `running low` and `finished`, and the To buy list shows those items. Ticking an item sets its status to `full`.

A consumable has a `period` field. The API stores it, returns it and accepts changes to it, and Settings displays it. No code reads it to decide anything.

**Tasks** (vacuuming, changing bed sheets) have a `period`, a `difficulty` and a `last_done` date. `Task.is_due` returns true when `last_done` is empty, or when at least `period.days` days have passed since `last_done`. Ticking a task sets `last_done` to the current date. Undo sends the previous `last_done` to `PUT /tasks/{id}/last_done`.

`Period.days`: `weekly` 7, `biweekly` 14, `monthly` 30, `every N months` N × 30, `yearly` 365.

## Stack

- **Backend:** Python 3.10+ with [FastAPI](https://fastapi.tiangolo.com/) and SQLite. The Pydantic models use `X | None` types, which need 3.10. `.python-version` pins 3.12.
- **Frontend:** plain HTML, CSS and JavaScript with no build step. FastAPI serves it from the same server.

## Run on your machine

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.api:app --reload
```

Open http://127.0.0.1:8000 and create a household. Interactive API docs live at http://127.0.0.1:8000/docs.

The app reads no environment variables. `household.py` fixes two paths: `backend/household.db` for data and `backend/images/` for photos. The app creates both on first start. Delete both to start with empty data.

The browser stores your household code in local storage for the address you opened. `127.0.0.1` and `localhost` count as different addresses, so pick one and stay with it.

## Project structure

```
backend/
  app/
    domain/               no HTTP or storage code
      enums.py            Period, Status, Difficulty
      householdItem.py    HouseholdItem base class: id, name, period
      consumable.py       Consumable: status, image, needs_restock
      task.py             Task: difficulty, last_done, is_due(), mark_done()
    household.py          the only code that touches storage: SQLite and photo files
    schemas.py            request and response models
    api.py                HTTP endpoints; serves frontend/ and images/
  requirements.txt
  household.db            created on first start; git-ignored
  images/                 consumable photos; git-ignored
frontend/
  household.js            stores the household code, adds it to every API request, shares the invite link
  welcome.html, .js       create or join a household
  index.html, app.js      To buy and To do lists
  settings.html, .js      add and edit consumables, add tasks, share the invite link, log out
  style.css
  manifest.json           web app manifest, app name "Household"
  icons/                  app icons, 192 and 512 px
openapi.json              generated API spec
LICENSE
```

`openapi.json` comes from the code. Regenerate it from `backend/` after you change `api.py`, `schemas.py` or `domain/enums.py`:

```bash
.venv/bin/python -c "import json; from app.api import app; print(json.dumps(app.openapi(), indent=2))" > ../openapi.json
```

## API

| Method | Path                         | Purpose                                         |
| ------ | ---------------------------- | ----------------------------------------------- |
| POST   | `/households`                | create a household, returns its code            |
| POST   | `/households/join`           | check that a household code exists              |
| POST   | `/consumables`               | add a consumable                                |
| GET    | `/consumables`               | list the household's consumables                |
| GET    | `/consumables/{id}`          | get one consumable                              |
| PUT    | `/consumables/{id}`          | change a consumable's name, period, status      |
| DELETE | `/consumables/{id}`          | delete a consumable and its photo               |
| PUT    | `/consumables/{id}/status`   | set a consumable's status                       |
| PUT    | `/consumables/{id}/image`    | set a consumable's photo (raw JPEG body, max 2 MB) |
| POST   | `/tasks`                     | add a task                                      |
| GET    | `/tasks`                     | list the household's tasks                      |
| POST   | `/tasks/{id}/done`           | set a task's `last_done` to the current date    |
| PUT    | `/tasks/{id}/last_done`      | set or clear a task's `last_done` (used by undo) |
| GET    | `/images/{name}.jpg`         | serve a consumable photo                        |

Every endpoint except the two `/households` ones and `/images` needs an `X-Household-Code` header with the household's code. A missing header returns 422. An unknown code returns 401. `/households/join` returns 404 for an unknown code. An unknown consumable or task id returns 404.

`PUT /consumables/{id}/image` rejects a body over 2 MB (2 × 1024 × 1024 bytes) with 413 and a body without a JPEG signature with 415. The frontend resizes photos to 600 px on the long side and encodes them as JPEG before upload. Each upload gets a new random file name, and the server deletes the old file. The random name protects `/images`: only `GET /consumables` reveals it.

Defaults: `POST /consumables` sets `status` to `full` when you omit it. `POST /tasks` sets `difficulty` to `medium`.

Allowed values:

- `period`: `weekly`, `biweekly`, `monthly`, `every 2 months` through `every 11 months`, `yearly`
- `status`: `full`, `running low`, `finished`
- `difficulty`: `light`, `medium`, `heavy`

Full request and response schemas live at `/docs` while the server runs, and in `openapi.json`.

## Limitations

- The API has no endpoints to edit or delete a task. `Household.update_task` and `Household.delete_task` exist, and no endpoint calls them.
- The API has no endpoint to remove a photo.
- The frontend fetches data on page load and after the user's own actions. It has no polling, websockets or service worker.
- `is_due` and `mark_done` use the server's local date.
- A household name without Latin letters or digits produces a code that starts with a hyphen, such as `-k7m3q9xp`.
- `requirements.txt` pins no versions.
- The repo has no tests.

## Deploying

Any Linux server with Python 3.10+ can host the app. One working setup:

- Run uvicorn as a systemd service under its own user, listening on `127.0.0.1:8000`, without `--reload`.
- Put [Caddy](https://caddyserver.com/) in front with `reverse_proxy 127.0.0.1:8000`. Caddy gets and renews an HTTPS certificate for you.
- Open SSH, 80 and 443 in the firewall and close everything else.

The invite button and the phone install need HTTPS. Browsers restrict the Web Share API, the clipboard API and app installation to secure pages. If you have no domain name, [sslip.io](https://sslip.io) gives you a hostname for your server's IP that Caddy can certify.

## License

[MIT](LICENSE)
