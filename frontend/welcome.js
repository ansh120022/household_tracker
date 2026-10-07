const createForm = document.querySelector("#create-form");
const joinForm = document.querySelector("#join-form");
const joinError = document.querySelector("#join-error");
const start = document.querySelector("#start");
const result = document.querySelector("#result");

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

joinForm.addEventListener("submit", (event) => {
  event.preventDefault();
  join(joinForm.elements.code.value);
});

async function join(code) {
  const response = await fetch("/households/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  if (!response.ok) {
    joinForm.elements.code.value = code;
    joinError.hidden = false;
    return;
  }
  const household = await response.json();
  localStorage.setItem(HOUSEHOLD_KEY, household.code);
  location.href = "index.html";
}

function enter(code) {
  localStorage.setItem(HOUSEHOLD_KEY, code);
  start.hidden = true;
  result.hidden = false;
}

document.querySelector("#copy").addEventListener("click", () => {
  navigator.clipboard.writeText(inviteLink());
});

const invitedCode = new URLSearchParams(location.search).get("code");
if (invitedCode) {
  join(invitedCode);
}
