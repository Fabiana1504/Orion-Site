import { supabase } from "./supabaseClient";
import { isSupabaseConfigured } from "./supabaseEnv";

function getClient() {
  return isSupabaseConfigured() ? supabase : null;
}

/**
 * Armar payload para RPC public.create_run_complete (jsonb).
 * Las métricas L/t y aceleración se recalculan en Postgres vía trigger → calculated_metrics.
 */
export function buildNormalizedRunPayload({
  source = "web",
  device_id = null,
  oil_type = null,
  car_model = null,
  observations = null,
  car_weight_g = null,
  track_length_m = 20,
  final_speed_kmh = null,
  accel_sample_time_sec = null,
  total_time_sec = null,
  sensor_s1_sec = null,
  sensor_s2_sec = null,
  lap_times_sec = [],
  reaction_times_ms = [],
  telemetry_payload = {},
}) {
  return {
    source: source || "web",
    device_id: device_id ?? undefined,
    oil_type: oil_type ?? undefined,
    car_model: car_model ?? undefined,
    observations: observations ?? undefined,
    car_weight_g: car_weight_g != null && Number.isFinite(Number(car_weight_g)) ? Number(car_weight_g) : undefined,
    track_length_m: track_length_m != null && Number.isFinite(Number(track_length_m)) && Number(track_length_m) > 0
      ? Number(track_length_m)
      : 20,
    final_speed_kmh: final_speed_kmh != null && Number.isFinite(Number(final_speed_kmh)) ? Number(final_speed_kmh) : undefined,
    accel_sample_time_sec:
      accel_sample_time_sec != null && Number.isFinite(Number(accel_sample_time_sec))
        ? Number(accel_sample_time_sec)
        : undefined,
    total_time_sec: total_time_sec != null && Number.isFinite(Number(total_time_sec)) ? Number(total_time_sec) : undefined,
    sensor_s1_sec: sensor_s1_sec != null && Number.isFinite(Number(sensor_s1_sec)) ? Number(sensor_s1_sec) : undefined,
    sensor_s2_sec: sensor_s2_sec != null && Number.isFinite(Number(sensor_s2_sec)) ? Number(sensor_s2_sec) : undefined,
    lap_times_sec: Array.isArray(lap_times_sec) ? lap_times_sec.map(Number).filter((n) => Number.isFinite(n)) : [],
    reaction_times_ms: Array.isArray(reaction_times_ms)
      ? reaction_times_ms.map(Number).filter((n) => Number.isFinite(n))
      : [],
    telemetry_payload: telemetry_payload && typeof telemetry_payload === "object" ? telemetry_payload : {},
  };
}

/** Nueva corrida normalizada (runs + sensor_measurements → calculated_metrics). */
export async function createRunComplete(payload) {
  const sb = getClient();
  if (!sb) {
    return { ok: false, skipped: true, error: "Supabase no configurado" };
  }
  const { data, error } = await sb.rpc("create_run_complete", { payload });
  if (error) {
    console.warn("create_run_complete:", error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true, runId: data };
}

/** Edge Function analyze-run (OpenAI solo en servidor). */
export async function invokeAnalyzeRun(runId) {
  const sb = getClient();
  if (!sb) {
    return { ok: false, error: "Supabase no configurado" };
  }
  const { data, error } = await sb.functions.invoke("analyze-run", {
    body: { run_id: runId },
  });
  if (error) {
    return { ok: false, error: error.message || String(error) };
  }
  if (data && typeof data === "object" && data.error) {
    return {
      ok: false,
      error: String(data.error),
      detail: data.detail != null ? String(data.detail) : undefined,
    };
  }
  return { ok: true, data };
}

/** Fila consolidada: manual + sensores + métricas + última IA. */
export async function fetchRunDashboard(runId) {
  const sb = getClient();
  if (!sb) return { ok: false, skipped: true };
  const { data, error } = await sb.from("v_run_dashboard").select("*").eq("run_id", runId).maybeSingle();
  if (error) return { ok: false, error: error.message };
  return { ok: true, row: data };
}

export async function listRunDashboard(limit = 30) {
  const sb = getClient();
  if (!sb) return { ok: false, data: [], skipped: true };
  const { data, error } = await sb
    .from("v_run_dashboard")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return { ok: false, data: [], error: error.message };
  return { ok: true, data: data || [] };
}

export async function markRunPublished(runId, published = true) {
  const sb = getClient();
  if (!sb) return { ok: false, skipped: true };
  const { error } = await sb.from("runs").update({ is_published: published }).eq("id", runId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * @deprecated Table legacy telemetry_runs (convive con el esquema nuevo).
 * @param {{
 *   source?: string,
 *   device_id?: string | null,
 *   oil_type?: string | null,
 *   car_model?: string | null,
 *   track_length_m?: number | null,
 *   manual_track_sec?: number | null,
 *   total_time_sec?: number | null,
 *   sensor_s1_sec?: number | null,
 *   sensor_s2_sec?: number | null,
 *   lap_times_sec?: number[],
 *   reaction_times_ms?: number[],
 *   velocity_ms?: number | null,
 *   acceleration_ms2?: number | null,
 *   ai_payload?: object | null,
 *   telemetry_payload?: object | null,
 * }} row
 */
export async function saveTelemetryRun(row) {
  const sb = getClient();
  if (!sb) {
    return { ok: true, skipped: true };
  }

  const payload = {
    source: row.source || "web",
    device_id: row.device_id ?? null,
    oil_type: row.oil_type ?? null,
    car_model: row.car_model ?? null,
    track_length_m: row.track_length_m ?? null,
    manual_track_sec: row.manual_track_sec ?? null,
    total_time_sec: row.total_time_sec ?? null,
    sensor_s1_sec: row.sensor_s1_sec ?? null,
    sensor_s2_sec: row.sensor_s2_sec ?? null,
    lap_times_sec: row.lap_times_sec?.length ? row.lap_times_sec : [],
    reaction_times_ms: row.reaction_times_ms?.length ? row.reaction_times_ms : [],
    velocity_ms: row.velocity_ms ?? null,
    acceleration_ms2: row.acceleration_ms2 ?? null,
    ai_payload: row.ai_payload ?? null,
    telemetry_payload: row.telemetry_payload ?? null,
  };

  const { error } = await sb.from("telemetry_runs").insert(payload);
  if (error) {
    console.warn("Supabase telemetry_runs insert:", error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function listRecentRuns(limit = 20) {
  const sb = getClient();
  if (!sb) return { ok: false, data: [], skipped: true };
  const { data, error } = await sb
    .from("telemetry_runs")
    .select("id, created_at, oil_type, car_model, total_time_sec, velocity_ms, source")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return { ok: false, data: [], error: error.message };
  return { ok: true, data: data || [] };
}
