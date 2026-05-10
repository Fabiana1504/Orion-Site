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
      "No hay conexión con Supabase (el navegador no pudo llegar al servidor). Revisá: " +
      "(1) En .env.local, VITE_SUPABASE_URL (https://xxxx.supabase.co) y VITE_SUPABASE_ANON_KEY bien copiados; " +
      "(2) Que el proyecto en Supabase no esté pausado; " +
      "(3) Internet, VPN o firewall. Reiniciá el servidor de Vite (npm run dev) después de cambiar .env."
    );
  }
  return null;
}
