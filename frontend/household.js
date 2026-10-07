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
