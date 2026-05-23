/**
 * Convierte errores típicos de red / fetch en texto útil (español).
 * @param {unknown} err
 * @returns {string | null} mensaje si aplica; si no, null (usar el mensaje original).
 */
export function humanizeNetworkError(err) {
  const raw = err?.message != null ? String(err.message) : String(err ?? "");
  const l = raw.toLowerCase();
  if (
    l.includes("failed to fetch") ||
    l.includes("networkerror") ||
    l.includes("network request failed") ||
    l.includes("load failed") ||
    l.includes("fetcherror")
  ) {
    return (
      "No connection to Supabase (the browser could not reach the server). Check: " +
      "(1) In .env.local, VITE_SUPABASE_URL (https://xxxx.supabase.co) and VITE_SUPABASE_ANON_KEY are correctly copied; " +
      "(2) The Supabase project is not paused; " +
      "(3) Internet, VPN, or firewall. Restart the Vite server (npm run dev) after changing .env."
    );
  }
  return null;
}
