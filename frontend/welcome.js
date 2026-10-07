const createForm = document.querySelector("#create-form");
const joinForm = document.querySelector("#join-form");
const joinError = document.querySelector("#join-error");
const result = document.querySelector("#result");
const codeDisplay = document.querySelector("#code-display");

createForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const response = await fetch("/households", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: createForm.elements.name.value }),
  });
  const household = await response.json();
  enter(household.code);
});

joinForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const response = await fetch("/households/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: joinForm.elements.code.value }),
  });
  if (!response.ok) {
    joinError.hidden = false;
    return;
  }
  const household = await response.json();
  enter(household.code);
});

function enter(code) {
  localStorage.setItem(HOUSEHOLD_KEY, code);
  codeDisplay.textContent = code;
  result.hidden = false;
}

document.querySelector("#copy").addEventListener("click", () => {
  navigator.clipboard.writeText(codeDisplay.textContent);
});
