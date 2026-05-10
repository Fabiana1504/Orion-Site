/**
 * Comprueba que existan las variables Vite de Supabase.
 * (No forma parte de supabaseClient.js para mantener ese archivo fijo tal cual.)
 */
export function isSupabaseConfigured() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return Boolean(url && key && String(url).trim() !== "" && String(key).trim() !== "");
}
