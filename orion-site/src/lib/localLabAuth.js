const LOCAL_LAB_AUTH_KEY = "orion-local-lab-auth";

export function getLocalLabCredentials() {
  const username = String(import.meta.env.VITE_LAB_LOGIN_USER ?? "").trim();
  const password = String(import.meta.env.VITE_LAB_LOGIN_PASSWORD ?? "");
  return { username, password };
}

export function hasLocalLabCredentialsConfigured() {
  const { username, password } = getLocalLabCredentials();
  return username.length > 0 && password.length > 0;
}

export function matchesLocalLabCredentials(username, password) {
  const configured = getLocalLabCredentials();
  if (!configured.username || !configured.password) return false;
  return username.trim() === configured.username && password === configured.password;
}

export function readLocalLabSession() {
  try {
    return localStorage.getItem(LOCAL_LAB_AUTH_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeLocalLabSession(active) {
  try {
    if (active) localStorage.setItem(LOCAL_LAB_AUTH_KEY, "1");
    else localStorage.removeItem(LOCAL_LAB_AUTH_KEY);
  } catch {
    /* ignore */
  }
}

export function createLocalLabUser(username) {
  const safeUsername = username.trim() || "orion-lab";
  return {
    id: "local-lab-user",
    email: safeUsername,
    is_anonymous: false,
    app_metadata: { provider: "local-lab" },
    user_metadata: { source: "local-lab" },
  };
}
