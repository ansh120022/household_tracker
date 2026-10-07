requireHousehold();

const tabs = document.querySelectorAll(".tabs button");
const panels = {
  "to-buy": document.querySelector("#to-buy"),
  "to-do": document.querySelector("#to-do"),
};

for (const tab of tabs) {
  tab.addEventListener("click", () => showTab(tab.dataset.tab));
}

function showTab(name) {
  for (const tab of tabs) {
    const selected = tab.dataset.tab === name;
    tab.classList.toggle("active", selected);
    tab.setAttribute("aria-selected", selected);
  }
  for (const [key, panel] of Object.entries(panels)) {
    panel.hidden = key !== name;
  }
  addButton.hidden = name !== "to-buy";
}

const list = document.querySelector("#list");
let consumables = [];

async function loadShoppingList() {
  const response = await api("/consumables");
  consumables = await response.json();
  const toBuy = consumables.filter((c) => c.needs_restock);
  list.replaceChildren(...toBuy.map(row));
}

function row(c) {
  const li = document.createElement("li");

  const box = document.createElement("input");
  box.type = "checkbox";
  box.id = "buy-" + c.id;

  const label = document.createElement("label");
  label.htmlFor = box.id;
  label.textContent = c.name;

  li.append(box);
  if (c.image_url) {
    const img = document.createElement("img");
    img.src = c.image_url;
    img.alt = "";
    img.className = "thumb";
    li.append(img);
  }
  li.append(label);
  box.addEventListener("change", () => check(c.id, li));
  return li;
}

function check(id, li) {
  api(`/consumables/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "full" }),
  });
  li.classList.add("leaving");
  li.addEventListener("animationend", () => li.remove(), { once: true });
}

const todo = document.querySelector("#todo");

async function loadTodoList() {
  const response = await api("/tasks");
  const tasks = await response.json();
  const due = tasks.filter((t) => t.is_due);
  todo.replaceChildren(...due.map(todoRow));
}

function todoRow(t) {
  const li = document.createElement("li");

  const box = document.createElement("input");
  box.type = "checkbox";
  box.id = "do-" + t.id;

  const label = document.createElement("label");
  label.htmlFor = box.id;
  label.textContent = t.name;

  li.append(box, label);
  box.addEventListener("change", () => done(t.id, li));
  return li;
}

function done(id, li) {
  api(`/tasks/${id}/done`, { method: "POST" });
  li.classList.add("leaving");
  li.addEventListener("animationend", () => li.remove(), { once: true });
}

const addButton = document.querySelector("#add");
const picker = document.querySelector("#picker");
const search = document.querySelector("#search");
const pickerList = document.querySelector("#picker-list");
const STATUS_ORDER = ["finished", "running low", "full"];

addButton.addEventListener("click", async () => {
  await loadShoppingList();
  search.value = "";
  renderPicker();
  picker.showModal();
  search.focus();
});

document.querySelector("#picker-close").addEventListener("click", () => picker.close());
search.addEventListener("input", renderPicker);

function renderPicker() {
  const query = search.value.trim();
  const lower = query.toLowerCase();
  const matches = consumables
    .filter((c) => c.name.toLowerCase().includes(lower))
    .sort(
      (a, b) =>
        STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) ||
        a.name.localeCompare(b.name)
    );
  const rows = matches.map(pickerRow);
  const exists = consumables.some((c) => c.name.toLowerCase() === lower);
  if (query && !exists) {
    rows.push(newRow(query));
  }
  pickerList.replaceChildren(...rows);
}

function pickerRow(c) {
  const li = document.createElement("li");
  if (c.image_url) {
    const img = document.createElement("img");
    img.src = c.image_url;
    img.alt = "";
    img.className = "thumb";
    li.append(img);
  }

  const name = document.createElement("span");
  name.className = "name";
  name.textContent = c.name;

  const tag = document.createElement("span");
  if (c.needs_restock) {
    li.classList.add("on-list");
    tag.className = "tag";
    tag.textContent = "on list";
  } else {
    tag.className = "plus";
    tag.textContent = "+";
    li.addEventListener("click", () => addToList(c.id));
  }

  li.append(name, tag);
  return li;
}

function newRow(name) {
  const li = document.createElement("li");
  li.className = "new";
  li.textContent = `+ Add "${name}"`;
  li.addEventListener("click", () => createAndAdd(name));
  return li;
}

async function addToList(id) {
  await api(`/consumables/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "running low" }),
  });
  picker.close();
  loadShoppingList();
}

async function createAndAdd(name) {
  await api("/consumables", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, period: "every 3 months", status: "running low" }),
  });
  picker.close();
  loadShoppingList();
}

loadShoppingList();
loadTodoList();
