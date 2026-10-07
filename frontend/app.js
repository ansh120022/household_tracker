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
}

const list = document.querySelector("#list");

async function loadShoppingList() {
  const response = await fetch("/consumables");
  const consumables = await response.json();
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

  li.append(box, label);
  box.addEventListener("change", () => check(c.id, li));
  return li;
}

function check(id, li) {
  fetch(`/consumables/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "full" }),
  });
  li.classList.add("leaving");
  li.addEventListener("animationend", () => li.remove(), { once: true });
}

loadShoppingList();
