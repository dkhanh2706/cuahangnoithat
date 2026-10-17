export function readUser() {
  try { return JSON.parse(localStorage.getItem("user") || "null"); }
  catch { return null; }
}

export function saveUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
  window.dispatchEvent(new Event("user-updated"));
}
