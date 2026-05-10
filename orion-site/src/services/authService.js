import { supabase } from "../lib/supabaseClient";

/** Login con email y contraseña (Supabase Auth). */
export async function signInWithEmail(email, password) {
  return supabase.auth.signInWithPassword({ email, password });
}

/** Sesión anónima (herramientas equipos: sin correo). Requiere habilitar Anonymous en Supabase Auth. */
export async function signInAnonymously() {
  return supabase.auth.signInAnonymously();
}

/** Actualiza metadatos del usuario (p. ej. equipo + categoría en sesión anónima). */
export async function updateAuthUserData(data) {
  return supabase.auth.updateUser({ data });
}

/** Cierra la sesión actual. */
export async function signOutUser() {
  return supabase.auth.signOut();
}

/** Sesión persistida (localStorage / refresh). */
export async function getCurrentSession() {
  return supabase.auth.getSession();
}

/** Usuario del JWT actual (valida con servidor si aplica). */
export async function getCurrentUser() {
  return supabase.auth.getUser();
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}
