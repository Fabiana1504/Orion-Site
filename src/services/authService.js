import { supabase } from "../lib/supabaseClient";

function missingConfigError() {
  return { message: "Supabase is not configured." };
}

function emptySubscription() {
  return {
    data: {
      subscription: {
        unsubscribe() {},
      },
    },
  };
}

/** Login con email y contraseña (Supabase Auth). */
export async function signInWithEmail(email, password) {
  if (!supabase) return { data: { user: null, session: null }, error: missingConfigError() };
  return supabase.auth.signInWithPassword({ email, password });
}

/** Sesión anónima (herramientas equipos: sin correo). Requiere habilitar Anonymous en Supabase Auth. */
export async function signInAnonymously() {
  if (!supabase) return { data: { user: null, session: null }, error: missingConfigError() };
  return supabase.auth.signInAnonymously();
}

/** Actualiza metadatos del usuario (p. ej. equipo + categoría en sesión anónima). */
export async function updateAuthUserData(data) {
  if (!supabase) return { data: { user: null }, error: missingConfigError() };
  return supabase.auth.updateUser({ data });
}

/** Cierra la sesión actual. */
export async function signOutUser() {
  if (!supabase) return { error: null };
  return supabase.auth.signOut();
}

/** Sesión persistida (localStorage / refresh). */
export async function getCurrentSession() {
  if (!supabase) return { data: { session: null }, error: null };
  return supabase.auth.getSession();
}

/** Usuario del JWT actual (valida con servidor si aplica). */
export async function getCurrentUser() {
  if (!supabase) return { data: { user: null }, error: null };
  return supabase.auth.getUser();
}

export function onAuthStateChange(callback) {
  if (!supabase) return emptySubscription();
  return supabase.auth.onAuthStateChange(callback);
}
