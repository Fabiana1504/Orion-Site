import { supabase } from "../lib/supabaseClient";

function missingConfigResult() {
  return { data: null, error: { message: "Supabase is not configured." } };
}

/**
 * @param {{
 *   userId?: string | null,
 *   contactEmail: string | null,
 *   schoolTeamName: string,
 *   category: string,
 *   calcKind: string,
 *   inputJson: Record<string, unknown>,
 *   resultJson: Record<string, unknown>,
 *   notes?: string | null,
 *   source?: "public_tools" | "team_lab",
 * }} row
 */
export async function insertCalcRecord(row) {
  if (!supabase) return missingConfigResult();
  // Extraemos métricas principales para guardarlas también en columnas explícitas.
  // Esto facilita filtros/reportes sin parsear JSON en cada consulta.
  const reactionMsRaw = row?.resultJson?.reactionMs;
  const accelerationRaw = row?.resultJson?.accelerationMs2;
  const velocityRaw = row?.resultJson?.velocityKmh;
  const reaction_ms = Number.isFinite(Number(reactionMsRaw)) ? Number(reactionMsRaw) : null;
  const acceleration_ms2 = Number.isFinite(Number(accelerationRaw)) ? Number(accelerationRaw) : null;
  const velocity_kmh = Number.isFinite(Number(velocityRaw)) ? Number(velocityRaw) : null;

  const payload = {
    user_id: row.userId ?? null,
    contact_email: row.contactEmail,
    school_team_name: row.schoolTeamName.trim() || "Unnamed team",
    category: row.category.trim() || "—",
    calc_kind: row.calcKind,
    input_json: row.inputJson,
    result_json: row.resultJson,
    notes: row.notes?.trim() || null,
    source: row.source ?? (row.userId ? "team_lab" : "public_tools"),
  };
  if (reaction_ms != null) payload.reaction_ms = reaction_ms;
  if (acceleration_ms2 != null) payload.acceleration_ms2 = acceleration_ms2;
  if (velocity_kmh != null) payload.velocity_kmh = velocity_kmh;

  // Upsert por equipo + categoría + tipo de cálculo:
  // mantiene una fila "vigente" por cada métrica sin mezclar velocidad/reacción/aceleración.
  const upsertRes = await supabase
    .from("calc_team_records")
    .upsert(payload, { onConflict: "school_team_name,category,calc_kind" })
    .select("id, created_at, reaction_ms, acceleration_ms2, velocity_kmh");

  if (!upsertRes.error) return upsertRes;

  // Backward compatibility if unique index/policies/columns are not yet available.
  if (
    upsertRes.error?.code === "42P10" || // no unique constraint for ON CONFLICT
    upsertRes.error?.code === "42501" || // RLS/policy blocks UPDATE path
    upsertRes.error?.code === "42703" // missing columns in older schema
  ) {
    // Compatibilidad con esquemas antiguos: inserción simple sin columnas nuevas.
    const legacyPayload = {
      user_id: payload.user_id,
      contact_email: payload.contact_email,
      school_team_name: payload.school_team_name,
      category: payload.category,
      calc_kind: payload.calc_kind,
      input_json: payload.input_json,
      result_json: payload.result_json,
      notes: payload.notes,
    };
    if (payload.source != null) {
      legacyPayload.source = payload.source;
    }
    return supabase
      .from("calc_team_records")
      .insert(legacyPayload)
      .select("id, created_at, reaction_ms, acceleration_ms2, velocity_kmh");
  }

  return upsertRes;
}

/**
 * Inserta una medición desde Team tools (flujo público sin login).
 */
export async function insertPublicCalcRecord(row) {
  // Wrapper para flujo público: siempre sin userId y marcado como public_tools.
  return insertCalcRecord({ ...row, userId: null, source: "public_tools" });
}

/** Últimas mediciones del usuario actual (requiere sesión). */
export async function fetchMyCalcRecords(userId, limit = 40) {
  if (!supabase) return missingConfigResult();
  return supabase
    .from("calc_team_records")
    .select("id, calc_kind, school_team_name, category, input_json, result_json, notes, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
}

/** Todas las mediciones (RLS: sólo personal con acceso al laboratorio). */
export async function fetchAllCalcRecordsForLab(limit = 500) {
  if (!supabase) return { data: [], error: { message: "Supabase is not configured." } };
  // Intento principal: esquema nuevo con columnas explícitas de métricas.
  const res = await supabase
    .from("calc_team_records")
    .select(
      "id, user_id, contact_email, school_team_name, category, calc_kind, input_json, result_json, reaction_ms, acceleration_ms2, velocity_kmh, notes, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!res.error) return res;

  // Fallback for DBs that still don't have explicit metric columns.
  if (res.error?.code === "42703") {
    // Fallback: esquema viejo sin reaction_ms/acceleration_ms2/velocity_kmh.
    return supabase
      .from("calc_team_records")
      .select(
        "id, user_id, contact_email, school_team_name, category, calc_kind, input_json, result_json, notes, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(limit);
  }

  return res;
}

/**
 * Delete one calc record by id (RLS must allow).
 */
export async function deleteCalcRecordById(id) {
  if (!supabase) return missingConfigResult();
  // Eliminación directa; el control real de permisos lo hace RLS.
  return supabase.from("calc_team_records").delete().eq("id", id);
}
