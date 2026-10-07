const tabs = document.querySelectorAll(".tabs button");
const panels = {
  consumables: document.querySelector("#consumables"),
  tasks: document.querySelector("#tasks"),
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
}

const library = document.querySelector("#library");
const sheet = document.querySelector("#sheet");
const form = sheet.querySelector("form");
const fields = form.elements;
const sheetTitle = document.querySelector("#sheet-title");
let editingId = null;

async function loadConsumables() {
  const response = await fetch("/consumables");
  const consumables = await response.json();
  library.replaceChildren(...consumables.map(row));
}

function row(c) {
  const li = document.createElement("li");

  const text = document.createElement("div");
  const name = document.createElement("div");
  name.textContent = c.name;
  const period = document.createElement("div");
  period.className = "period";
  period.textContent = c.period;
  text.append(name, period);

  const status = document.createElement("span");
  status.className = "status";
  status.textContent = c.status;

  li.append(text, status);
  li.addEventListener("click", () => openEdit(c));
  return li;
}

function openAdd() {
  editingId = null;
  sheetTitle.textContent = "New consumable";
  form.reset();
  fields.name.readOnly = false;
  fields.period.disabled = false;
  sheet.returnValue = "";
  sheet.showModal();
}

function openEdit(c) {
  editingId = c.id;
  sheetTitle.textContent = "Edit status";
  fields.name.value = c.name;
  fields.period.value = c.period;
  fields.status.value = c.status;
  fields.name.readOnly = true;
  fields.period.disabled = true;
  sheet.returnValue = "";
  sheet.showModal();
}

document.querySelector("#add").addEventListener("click", openAdd);

sheet.addEventListener("close", async () => {
  if (sheet.returnValue !== "save") return;

  if (editingId === null) {
    await fetch("/consumables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fields.name.value,
        period: fields.period.value,
        status: fields.status.value,
      }),
    });
  } else {
    await fetch(`/consumables/${editingId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: fields.status.value }),
    });
  }

  loadConsumables();
});

loadConsumables();
