export const AUTH_KEY = "orion-analytics-auth";

export function readAuth() {
  try {
    return localStorage.getItem(AUTH_KEY) === "1";
  } catch {
    return false;
  }
}

export function setAuth(isLoggedIn) {
  try {
    if (isLoggedIn) localStorage.setItem(AUTH_KEY, "1");
    else localStorage.removeItem(AUTH_KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event("orion-auth-change"));
}
