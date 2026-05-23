/**
 * Comprueba que existan las variables Vite de Supabase.
 * (No forma parte de supabaseClient.js para mantener ese archivo fijo tal cual.)
 */
export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && String(url).trim() !== "" && String(key).trim() !== "");
}
