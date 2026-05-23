/**
 * Archivo: supabase/functions/analyze-run/index.ts
 * Responsabilidad: generar insight IA para una corrida, guardarlo en ai_insights
 * y devolver resumen/alertas/recomendaciones/gráficos al frontend.
 *
 * Edge Function: análisis IA con OpenAI Responses API + JSON Schema estricto.
 * Secretos: OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto en Supabase hosted).
 *
 * Body: { "run_id": "uuid" }
 */
declare const Deno: {
  env: { get: (name: string) => string | undefined };
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
};

// @ts-expect-error Deno Edge resolves remote URL imports at runtime.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ORION_SCHEMA = {
  // Esquema estricto: obliga formato estable para UI (sin markdown libre).
  type: "object",
  additionalProperties: false,
  properties: {
    summary: { type: "string", description: "Resumen ejecutivo de la corrida CO2 en español" },
    alerts: {
      type: "array",
      items: { type: "string" },
      description: "Alertas sobre tiempos, aceite o sensores",
    },
    recommendations: {
      type: "array",
      items: { type: "string" },
      description: "Recomendaciones accionables para el equipo",
    },
    chartPanels: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          type: { type: "string", enum: ["bar", "pie"] },
          unit: { type: "string" },
          data: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                name: { type: "string" },
                value: { type: "number" },
              },
              required: ["name", "value"],
            },
          },
        },
        required: ["id", "title", "type", "unit", "data"],
      },
    },
    confidence: { type: "number", description: "Confianza 0-1 en el análisis" },
  },
  required: ["summary", "alerts", "recommendations", "chartPanels", "confidence"],
};

function extractResponsesOutputText(data: Record<string, unknown>): string | null {
  // Responses API puede devolver texto en distintos nodos; este helper unifica extracción.
  const out = data.output;
  if (!Array.isArray(out)) {
    const ot = data.output_text;
    if (typeof ot === "string") return ot;
    return null;
  }
  for (const block of out as Array<Record<string, unknown>>) {
    const content = block.content;
    if (Array.isArray(content)) {
      for (const c of content as Array<Record<string, unknown>>) {
        const typ = String(c.type || "");
        if ((typ === "output_text" || typ === "text") && typeof c.text === "string") return c.text;
        if (typeof c.text === "string") return c.text;
      }
    }
    if (typeof block.text === "string") return block.text;
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    // Preflight CORS.
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!openaiKey || !supabaseUrl || !serviceKey) {
      return new Response(
        JSON.stringify({ error: "Faltan secretos OPENAI_API_KEY o Supabase en el entorno de la función." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json().catch(() => ({}));
    const runId = body?.run_id as string | undefined;
    if (!runId || typeof runId !== "string") {
      return new Response(JSON.stringify({ error: "run_id requerido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sb = createClient(supabaseUrl, serviceKey);

    const { data: run, error: e1 } = await sb.from("runs").select("*").eq("id", runId).single();
    if (e1 || !run) {
      return new Response(JSON.stringify({ error: "Corrida no encontrada", detail: e1?.message }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: sm } = await sb.from("sensor_measurements").select("*").eq("run_id", runId).maybeSingle();
    const { data: calc } = await sb.from("calculated_metrics").select("*").eq("run_id", runId).maybeSingle();

    // Se compone contexto histórico para que el modelo compare tendencia, no solo una corrida aislada.
    const { data: histRuns } = await sb
      .from("runs")
      .select("id, created_at, car_model, oil_type, track_length_m")
      .neq("id", runId)
      .order("created_at", { ascending: false })
      .limit(8);

    const histIds = (histRuns || []).map((r) => r.id).filter(Boolean);
    let calcByRun = new Map<string, Record<string, unknown>>();
    if (histIds.length) {
      const { data: histCalc } = await sb.from("calculated_metrics").select("*").in("run_id", histIds);
      for (const row of histCalc || []) {
        const rid = row.run_id as string;
        if (rid) calcByRun.set(rid, row as Record<string, unknown>);
      }
    }

    const { data: histSensors } =
      histIds.length > 0
        ? await sb.from("sensor_measurements").select("run_id, total_time_sec, lap_times_sec, reaction_times_ms").in("run_id", histIds)
        : { data: [] as Record<string, unknown>[] };

    const smByRun = new Map<string, Record<string, unknown>>();
    for (const row of histSensors || []) {
      const rid = row.run_id as string;
      if (rid) smByRun.set(rid, row as Record<string, unknown>);
    }

    const history = (histRuns || []).map((r) => ({
      ...r,
      sensor_measurements: smByRun.get(r.id) ?? null,
      calculated_metrics: calcByRun.get(r.id) ?? null,
    }));

    const model = Deno.env.get("OPENAI_MODEL") ?? "gpt-4o-mini";

    const userContent = JSON.stringify(
      {
        instructions:
          "Sos analista de un equipo de carro a escala propulsado por CO2 en pista recta (~20 m). " +
          "Compará la corrida actual con el historial si existe. Sé concreto y técnico pero claro.",
        current_run: { run, sensor: sm, calculated: calc },
        previous_runs: history ?? [],
      },
      null,
      2,
    );

    const oaiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: "system",
            content:
              "Respondés solo en JSON que cumple el schema. Español. Sin markdown. " +
              "chartPanels debe incluir al menos un gráfico útil (tiempos, velocidad, reacción).",
          },
          { role: "user", content: userContent },
        ],
        text: {
          format: {
            // JSON Schema estricto para garantizar contrato con frontend.
            type: "json_schema",
            name: "orion_co2_analysis",
            strict: true,
            schema: ORION_SCHEMA,
          },
        },
        temperature: 0.35,
      }),
    });

    if (!oaiRes.ok) {
      const errTxt = await oaiRes.text();
      return new Response(
        JSON.stringify({ error: "OpenAI error", status: oaiRes.status, detail: errTxt.slice(0, 400) }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const oaiData = (await oaiRes.json()) as Record<string, unknown>;
    const rawText = extractResponsesOutputText(oaiData);
    if (!rawText) {
      return new Response(JSON.stringify({ error: "Respuesta OpenAI sin texto parseable", oaiData }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(rawText) as Record<string, unknown>;
    } catch {
      return new Response(JSON.stringify({ error: "JSON inválido del modelo", rawText: rawText.slice(0, 500) }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: insErr } = await sb.from("ai_insights").insert({
      // Persistimos respuesta cruda para auditoría/debug, además del resumen normalizado.
      run_id: runId,
      summary: String(parsed.summary ?? ""),
      alerts: parsed.alerts ?? [],
      recommendations: parsed.recommendations ?? [],
      chart_panels: parsed.chartPanels ?? [],
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : null,
      model,
      raw_response: oaiData,
    });

    if (insErr) {
      return new Response(JSON.stringify({ error: "No se pudo guardar ai_insights", detail: insErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        ok: true,
        insight: {
          summary: parsed.summary,
          alerts: parsed.alerts,
          recommendations: parsed.recommendations,
          chartPanels: parsed.chartPanels,
          confidence: parsed.confidence,
          model,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
