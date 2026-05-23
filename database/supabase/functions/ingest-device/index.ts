/**
 * Archivo: supabase/functions/ingest-device/index.ts
 * Responsabilidad: endpoint seguro para que Arduino/dispositivos envíen corridas
 * sin exponer anon key en firmware.
 *
 * Ingesta opcional para Arduino / dispositivos sin anon key en firmware.
 * Header: x-orion-device-secret: <DEVICE_INGEST_SECRET>
 * Body: mismo objeto JSON que acepta RPC create_run_complete (campos planos en la raíz).
 *
 * La función reenvía a create_run_complete con service role.
 */
declare const Deno: {
  env: { get: (name: string) => string | undefined };
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
};

// @ts-expect-error Deno Edge resolves remote URL imports at runtime.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-orion-device-secret",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    // Preflight CORS para clientes web/embebidos.
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const expected = Deno.env.get("DEVICE_INGEST_SECRET");
    if (!expected || expected.length < 8) {
      return new Response(
        JSON.stringify({ error: "ingest-device deshabilitado: configurá DEVICE_INGEST_SECRET (≥8 chars) en la función." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const sent = req.headers.get("x-orion-device-secret");
    // Autenticación simple por header compartido entre dispositivo y función.
    if (sent !== expected) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: "Supabase no configurado en la función" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return new Response(JSON.stringify({ error: "JSON inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = body.payload && typeof body.payload === "object" ? body.payload : body;

    const sb = createClient(supabaseUrl, serviceKey);
    // Centraliza validación/normalización en la RPC SQL del backend.
    const { data: runId, error } = await sb.rpc("create_run_complete", { payload });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, run_id: runId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
