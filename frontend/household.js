const HOUSEHOLD_KEY = "household";

function householdCode() {
  return localStorage.getItem(HOUSEHOLD_KEY);
}

function requireHousehold() {
  if (!householdCode()) {
    location.href = "welcome.html";
  }
}

function api(path, options = {}) {
  return fetch(path, {
    ...options,
    headers: {
      ...options.headers,
      "X-Household-Code": householdCode(),
    },
  });
}

function inviteLink() {
  return `${location.origin}/welcome.html?code=${encodeURIComponent(householdCode())}`;
}

async function shareInviteLink(button) {
  const link = inviteLink();

  if (navigator.share) {
    try {
      await navigator.share({ text: "Join our household:", url: link });
    } catch {
      // Closing the share sheet without choosing an app also lands here.
    }
    return;
  }

  const label = button.textContent;
  button.disabled = true;
  try {
    await navigator.clipboard.writeText(link);
    button.textContent = "Link copied ✓";
  } catch {
    button.textContent = "Couldn't copy";
  }
  setTimeout(() => {
    button.textContent = label;
    button.disabled = false;
  }, 2000);
}
