import { supabase } from "../lib/supabaseClient";

/**
 * Lee `lab_access` para un usuario. Sin fila → sin acceso.
 * @returns {Promise<{ role: string | null, can_access_lab: boolean } | null>}
 */
export async function getLabAccess(userId) {
  if (!userId) return null;

  const { data, error } = await supabase
    .from("lab_access")
    .select("role, can_access_lab")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.warn("lab_access:", error.message);
    return null;
  }

  if (!data) {
    return { role: null, can_access_lab: false };
  }

  return {
    role: data.role ?? null,
    can_access_lab: Boolean(data.can_access_lab),
  };
}
