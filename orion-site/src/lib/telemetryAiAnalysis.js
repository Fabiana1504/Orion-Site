/**
 * Local analysis (fallback) y mapeo de la salida JSON del Edge Function analyze-run (OpenAI solo en servidor).
 */
import { invokeAnalyzeRun } from "./telemetryRemote";
import { isSupabaseConfigured } from "./supabaseEnv";

/**
 * Gráficos individuales para laboratorio y publicación (aceite, pista, sensores, vueltas, reacciones).
 * @param {{
 *   oilType?: string,
 *   manualTrackSec?: number | null,
 *   sensorDurationsSec?: number[],
 *   lapTimesSec?: number[],
 *   reactionTimesMs?: number[],
 * }} telemetry
 */
export function buildChartPanels(telemetry) {
  const oil = String(telemetry?.oilType || "").trim() || "Sin especificar";
  const manualTrack =
    telemetry?.manualTrackSec != null && Number.isFinite(Number(telemetry.manualTrackSec))
      ? Number(telemetry.manualTrackSec)
      : null;
  const sensors = (telemetry?.sensorDurationsSec || []).map(Number).filter((n) => Number.isFinite(n) && n > 0);
  const lapTimes = (telemetry?.lapTimesSec || []).map(Number).filter((n) => Number.isFinite(n) && n > 0);
  const reactions = (telemetry?.reactionTimesMs || []).map(Number).filter((n) => Number.isFinite(n) && n > 0);

  const oilLabel = oil.length > 24 ? `${oil.slice(0, 23)}…` : oil;
  /** @type {Array<{ id: string, title: string, type: 'bar'|'pie', unit?: string, data: { name: string, value: number }[] }>} */
  const panels = [];

  panels.push({
    id: "oil",
    title: "Aceite de referencia",
    type: "pie",
    data: [{ name: oil === "Sin especificar" ? "Sin especificar" : oilLabel, value: 100 }],
    unit: "",
  });

  if (manualTrack != null) {
    panels.push({
      id: "manualTrack",
      title: "Tiempo de pista (manual)",
      type: "bar",
      data: [{ name: "Pista", value: Math.round(manualTrack * 1000) / 1000 }],
      unit: "s",
    });
  }

  const weightG = telemetry?.carWeightG;
  if (weightG != null && Number.isFinite(Number(weightG)) && Number(weightG) > 0) {
    panels.push({
      id: "carWeight",
      title: "Peso del carro",
      type: "bar",
      data: [{ name: "Masa", value: Math.round(Number(weightG) * 10) / 10 }],
      unit: "g",
    });
  }

  if (sensors.length) {
    panels.push({
      id: "sensors",
      title: "Sensores Arduino (duración)",
      type: "bar",
      data: sensors.map((v, i) => ({
        name: `S${i + 1}`,
        value: Math.round(v * 10000) / 10000,
      })),
      unit: "s",
    });
  }

  if (lapTimes.length) {
    panels.push({
      id: "laps",
      title: "Vueltas registradas",
      type: "bar",
      data: lapTimes.map((v, i) => ({
        name: `V${i + 1}`,
        value: Math.round(v * 1000) / 1000,
      })),
      unit: "s",
    });
  }

  if (reactions.length) {
    panels.push({
      id: "reactions",
      title: "Tiempos de reacción",
      type: "bar",
      data: reactions.map((v, i) => ({
        name: `R${i + 1}`,
        value: Math.round(v * 10) / 10,
      })),
      unit: "ms",
    });
  }

  const vKmh = telemetry?.velocityKmh;
  if (vKmh != null && Number.isFinite(Number(vKmh))) {
    panels.push({
      id: "velocity",
      title: "Speed media estimada",
      type: "bar",
      data: [
        { name: "km/h", value: Math.round(Number(vKmh) * 100) / 100 },
        {
          name: "m/s",
          value:
            telemetry?.velocityMs != null && Number.isFinite(Number(telemetry.velocityMs))
              ? Math.round(Number(telemetry.velocityMs) * 1000) / 1000
              : Math.round((Number(vKmh) / 3.6) * 1000) / 1000,
        },
      ],
      unit: "derivada de L/t",
    });
  }

  const acc = telemetry?.accelerationMs2;
  if (acc != null && Number.isFinite(Number(acc))) {
    panels.push({
      id: "acceleration",
      title: "Acceleration estimada (reposo → v)",
      type: "bar",
      data: [{ name: "m/s²", value: Math.round(Number(acc) * 1000) / 1000 }],
      unit: "m/s²",
    });
  }

  return panels;
}

function normalizePanel(p) {
  if (!p || typeof p !== "object") return null;
  const id = String(p.id || "").trim();
  const title = String(p.title || "Gráfico").trim();
  if (!id || !title) return null;
  const type = p.type === "pie" ? "pie" : "bar";
  const rawData = Array.isArray(p.data) ? p.data : [];
  const data = rawData
    .map((x) => ({
      name: String(x?.name ?? "—"),
      value: typeof x?.value === "number" && Number.isFinite(x.value) ? x.value : parseFloat(x?.value) || 0,
    }))
    .filter((x) => x.name && x.name !== "—");
  if (!data.length) return null;
  return {
    id,
    title,
    type,
    data,
    unit: p.unit != null && String(p.unit).trim() !== "" ? String(p.unit).trim() : undefined,
  };
}

export function mergeChartPanels(remote, local) {
  const rList = (Array.isArray(remote) ? remote : []).map(normalizePanel).filter(Boolean);
  const rMap = new Map(rList.map((p) => [p.id, p]));
  const seen = new Set();
  const out = [];
  for (const l of local) {
    const use = rMap.get(l.id) || l;
    out.push(use);
    seen.add(l.id);
  }
  for (const p of rList) {
    if (!seen.has(p.id)) out.push(p);
  }
  return out;
}

/**
 * @param {{
 *   oilType?: string,
 *   manualTrackSec?: number | null,
 *   sensorDurationsSec?: number[],
 *   lapTimesSec?: number[],
 *   reactionTimesMs?: number[],
 *   carModel?: string,
 *   trackLengthM?: number | null,
 *   totalTimeSec?: number | null,
 *   velocityMs?: number | null,
 *   velocityKmh?: number | null,
 *   accelerationMs2?: number | null,
 * }} telemetry
 */
export function analyzeTelemetry(telemetry) {
  const oil = String(telemetry?.oilType || "").trim() || "Sin especificar";
  const carModel = String(telemetry?.carModel || "").trim();
  const manualTrack =
    telemetry?.manualTrackSec != null && Number.isFinite(Number(telemetry.manualTrackSec))
      ? Number(telemetry.manualTrackSec)
      : null;
  const sensors = (telemetry?.sensorDurationsSec || []).map(Number).filter((n) => Number.isFinite(n) && n > 0);
  const lapTimes = (telemetry?.lapTimesSec || []).map(Number).filter((n) => Number.isFinite(n) && n > 0);
  const reactions = (telemetry?.reactionTimesMs || []).map(Number).filter((n) => Number.isFinite(n) && n > 0);

  const allLapLike = [...lapTimes];
  if (manualTrack != null) allLapLike.push(manualTrack);
  if (sensors.length >= 2) {
    allLapLike.push((sensors[0] + sensors[1]) / 2);
  } else if (sensors.length === 1) {
    allLapLike.push(sensors[0]);
  }

  const lapAvg = allLapLike.length ? allLapLike.reduce((a, b) => a + b, 0) / allLapLike.length : null;
  const lapMin = allLapLike.length ? Math.min(...allLapLike) : null;
  const lapMax = allLapLike.length ? Math.max(...allLapLike) : null;
  const reactAvg = reactions.length ? reactions.reduce((a, b) => a + b, 0) / reactions.length : null;
  const reactMin = reactions.length ? Math.min(...reactions) : null;
  const reactMax = reactions.length ? Math.max(...reactions) : null;

  const barChart = [];
  lapTimes.forEach((v, i) => {
    barChart.push({ name: `Vuelta ${i + 1}`, value: Math.round(v * 1000) / 1000 });
  });
  if (manualTrack != null) {
    barChart.push({ name: "Pista (manual)", value: Math.round(manualTrack * 1000) / 1000 });
  }
  if (sensors.length >= 1) {
    barChart.push({ name: "Sensor 1 (s)", value: Math.round(sensors[0] * 1000) / 1000 });
  }
  if (sensors.length >= 2) {
    barChart.push({ name: "Sensor 2 (s)", value: Math.round(sensors[1] * 1000) / 1000 });
  }
  if (reactAvg != null) {
    barChart.push({ name: "Reacción Ø (ms)", value: Math.round(reactAvg * 10) / 10 });
  }
  if (telemetry?.velocityKmh != null && Number.isFinite(Number(telemetry.velocityKmh))) {
    barChart.push({ name: "v̄ (km/h)", value: Math.round(Number(telemetry.velocityKmh) * 100) / 100 });
  }
  if (telemetry?.accelerationMs2 != null && Number.isFinite(Number(telemetry.accelerationMs2))) {
    barChart.push({ name: "a (m/s²)", value: Math.round(Number(telemetry.accelerationMs2) * 1000) / 1000 });
  }
  if (!barChart.length) {
    barChart.push({ name: "Sin datos", value: 0 });
  }

  const pieChart = [];
  if (lapTimes.length) {
    pieChart.push({
      name: "Vueltas (suma s)",
      value: Math.round(lapTimes.reduce((a, b) => a + b, 0) * 1000) / 1000,
    });
  }
  if (reactions.length) {
    pieChart.push({
      name: "Reacciones (suma ms)",
      value: Math.round(reactions.reduce((a, b) => a + b, 0) * 100) / 100,
    });
  }
  if (sensors.length) {
    pieChart.push({
      name: "Sensores (suma s)",
      value: Math.round(sensors.reduce((a, b) => a + b, 0) * 1000) / 1000,
    });
  }
  if (!pieChart.length) {
    pieChart.push({ name: "Sin datos", value: 1 });
  }

  const bullets = [];
  if (manualTrack != null) {
    bullets.push(`Tiempo de pista (manual): ${manualTrack.toFixed(3)} s.`);
  }
  if (sensors.length >= 2) {
    bullets.push(
      `Sensores Arduino: ${sensors[0].toFixed(4)} s y ${sensors[1].toFixed(4)} s (duración medida entre haces).`,
    );
  } else if (sensors.length === 1) {
    bullets.push(`Sensor 1: ${sensors[0].toFixed(4)} s (esperando S2 para el par).`);
  }
  if (lapAvg != null) {
    bullets.push(`Promedio tiempos considerados: ${lapAvg.toFixed(3)} s (rango ${lapMin?.toFixed(3)}–${lapMax?.toFixed(3)}).`);
  }
  if (reactAvg != null) {
    bullets.push(
      `Reacción promedio: ${reactAvg.toFixed(1)} ms (${reactMin?.toFixed(0)}–${reactMax?.toFixed(0)}).`,
    );
  }
  if (oil !== "Sin especificar") {
    bullets.push(`Aceite: ${oil}.`);
  }
  if (carModel) {
    bullets.push(`Modelo de carro: ${carModel}.`);
  }
  if (telemetry?.trackLengthM != null && Number.isFinite(Number(telemetry.trackLengthM))) {
    bullets.push(`Longitud de pista referencia: ${Number(telemetry.trackLengthM).toFixed(2)} m.`);
  }
  if (telemetry?.velocityKmh != null && Number.isFinite(Number(telemetry.velocityKmh))) {
    bullets.push(
      `Speed media estimada: ${Number(telemetry.velocityKmh).toFixed(2)} km/h (${Number(telemetry.velocityMs ?? Number(telemetry.velocityKmh) / 3.6).toFixed(3)} m/s), con v = L/t.`,
    );
  }
  if (telemetry?.accelerationMs2 != null && Number.isFinite(Number(telemetry.accelerationMs2))) {
    bullets.push(`Acceleration estimada (desde reposo): ${Number(telemetry.accelerationMs2).toFixed(3)} m/s².`);
  }
  if (!bullets.length) {
    bullets.push("Cargá aceite, tiempo de pista manual, reacciones o conectá Arduino.");
  }

  const narrative = [
    `Local analysis: aceite “${oil}”.`,
    carModel ? ` Modelo ${carModel}.` : "",
    manualTrack != null ? ` Pista manual ${manualTrack.toFixed(3)} s.` : "",
    sensors.length >= 2 ? ` Dos sensores reportaron ${sensors[0].toFixed(3)} s y ${sensors[1].toFixed(3)} s.` : "",
    reactAvg != null ? ` Reacción media ${reactAvg.toFixed(0)} ms.` : "",
    telemetry?.velocityKmh != null ? ` Speed media ~${Number(telemetry.velocityKmh).toFixed(1)} km/h.` : "",
    ` Para IA en la nube guardá la corrida en Supabase y ejecutá la función analyze-run (sin API key en el navegador).`,
  ]
    .join("")
    .replace(/\s+/g, " ")
    .trim();

  const chartPanels = buildChartPanels(telemetry);

  return {
    model: "orion-local-v1",
    narrative,
    bullets,
    barChart,
    pieChart,
    chartPanels,
    reactionAvgMs: reactAvg,
    lapAvgSec: lapAvg,
    lapMinSec: lapMin,
    lapMaxSec: lapMax,
    oilType: oil,
  };
}

/**
 * Convierte el JSON estructurado del servidor (summary, alerts, …) al formato que usa el laboratorio y la home.
 * @param {{
 *   summary?: string,
 *   alerts?: string[],
 *   recommendations?: string[],
 *   chartPanels?: unknown[],
 *   confidence?: number | null,
 *   model?: string,
 * }} insight
 */
export function mapServerInsightToLabAi(insight, telemetry) {
  const local = analyzeTelemetry(telemetry);
  if (!insight || typeof insight !== "object") {
    return { ...local, _fallback: true };
  }

  const remotePanels = Array.isArray(insight.chartPanels) ? insight.chartPanels : [];
  const localPanels = buildChartPanels(telemetry);
  const chartPanels = remotePanels.length ? mergeChartPanels(remotePanels, localPanels) : localPanels;

  const alerts = Array.isArray(insight.alerts) ? insight.alerts.map((x) => String(x)) : [];
  const recs = Array.isArray(insight.recommendations) ? insight.recommendations.map((x) => String(x)) : [];

  return {
    ...local,
    model: insight.model || "orion-edge",
    narrative:
      typeof insight.summary === "string" && insight.summary.trim() ? insight.summary.trim() : local.narrative,
    bullets: local.bullets,
    alerts,
    recommendations: recs,
    confidence:
      typeof insight.confidence === "number" && Number.isFinite(insight.confidence) ? insight.confidence : null,
    chartPanels,
    barChart: local.barChart,
    pieChart: local.pieChart,
    _serverInsight: true,
  };
}

/**
 * Análisis IA vía Edge Function `analyze-run` si hay `runId` y Supabase.
 * Sin runId (o sin Supabase): solo análisis local.
 */
export async function runAiAnalysis(telemetry, options = {}) {
  const runId = options.runId;
  if (runId && isSupabaseConfigured()) {
    const res = await invokeAnalyzeRun(runId);
    if (res.ok && res.data?.insight) {
      return mapServerInsightToLabAi(res.data.insight, telemetry);
    }
    const errMsg = res.error || res.detail || "No se pudo ejecutar analyze-run";
    console.warn("analyze-run:", errMsg);
    return {
      ...analyzeTelemetry(telemetry),
      _fallback: true,
      _analyzeError: errMsg,
    };
  }
  return analyzeTelemetry(telemetry);
}
