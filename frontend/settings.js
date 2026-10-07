requireHousehold();

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

document.querySelector("#copy-link").addEventListener("click", () => {
  navigator.clipboard.writeText(inviteLink());
});

document.querySelector("#logout").addEventListener("click", () => {
  if (!confirm("Log out? You'll need an invite link to come back.")) return;
  localStorage.removeItem(HOUSEHOLD_KEY);
  location.href = "welcome.html";
});

const library = document.querySelector("#library");
const sheet = document.querySelector("#sheet");
const form = sheet.querySelector("form");
const fields = form.elements;
const sheetTitle = document.querySelector("#sheet-title");
let editingId = null;

async function loadConsumables() {
  const response = await api("/consumables");
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

  if (c.image_url) {
    const img = document.createElement("img");
    img.src = c.image_url;
    img.alt = "";
    img.className = "thumb";
    li.append(img);
  }
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
  fields.image.value = "";
  fields.name.readOnly = true;
  fields.period.disabled = true;
  sheet.returnValue = "";
  sheet.showModal();
}

document.querySelector("#add").addEventListener("click", () => {
  if (panels.tasks.hidden) {
    openAdd();
  } else {
    openAddTask();
  }
});

sheet.addEventListener("close", async () => {
  if (sheet.returnValue !== "save") return;

  let id = editingId;
  if (editingId === null) {
    const response = await api("/consumables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fields.name.value,
        period: fields.period.value,
        status: fields.status.value,
      }),
    });
    const created = await response.json();
    id = created.id;
  } else {
    await api(`/consumables/${editingId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: fields.status.value }),
    });
  }

  const file = fields.image.files[0];
  if (file) {
    await api(`/consumables/${id}/image`, {
      method: "PUT",
      headers: { "Content-Type": "image/jpeg" },
      body: await shrink(file),
    });
  }

  loadConsumables();
});

async function shrink(file) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.8));
}

const taskLibrary = document.querySelector("#task-library");
const taskSheet = document.querySelector("#task-sheet");
const taskForm = taskSheet.querySelector("form");
const taskFields = taskForm.elements;

async function loadTasks() {
  const response = await api("/tasks");
  const tasks = await response.json();
  taskLibrary.replaceChildren(...tasks.map(taskRow));
}

function taskRow(t) {
  const li = document.createElement("li");

  const text = document.createElement("div");
  const name = document.createElement("div");
  name.textContent = t.name;
  const period = document.createElement("div");
  period.className = "period";
  period.textContent = t.period;
  text.append(name, period);

  const difficulty = document.createElement("span");
  difficulty.className = "difficulty";
  difficulty.textContent = t.difficulty;

  li.append(text, difficulty);
  return li;
}

function openAddTask() {
  taskForm.reset();
  taskSheet.returnValue = "";
  taskSheet.showModal();
}

taskSheet.addEventListener("close", async () => {
  if (taskSheet.returnValue !== "save") return;

  await api("/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: taskFields.name.value,
      period: taskFields.period.value,
      difficulty: taskFields.difficulty.value,
    }),
  });

  loadTasks();
});

loadConsumables();
loadTasks();
