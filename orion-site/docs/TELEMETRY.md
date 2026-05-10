# Orion — telemetría CO₂ (20 m) y análisis

## Arquitectura (resumen)

| Capa | Contenido |
|------|-----------|
| **Manual** | `runs`: aceite, peso, modelo, observaciones, `track_length_m` (default 20 m), velocidad final + tiempo para aceleración |
| **Sensores** | `sensor_measurements`: `reaction_times_ms[]`, `total_time_sec`, `sensor_s1_sec`, `sensor_s2_sec`, `lap_times_sec[]`, `telemetry_payload` |
| **Métricas** | `calculated_metrics`: recalculado por trigger al insertar/actualizar sensores (`average_speed_ms/kmh`, `best_time_sec`, `average_reaction_ms`, `estimated_acceleration_ms2`) |
| **IA** | `ai_insights` + Edge Function `analyze-run` (OpenAI Responses API, JSON Schema estricto). La clave OpenAI solo existe en el servidor |

La tabla legacy `telemetry_runs` se mantiene: el botón “Publicar” sigue insertando ahí para compatibilidad.

## Archivos tocados en este refactor

- `database/migrations/002_normalized_telemetry.sql` — tablas, RPC `create_run_complete`, vista `v_run_dashboard`, trigger de métricas.
- `supabase/functions/analyze-run/index.ts` — IA server-side, historial de corridas, guardado en `ai_insights`.
- `supabase/functions/ingest-device/index.ts` — POST opcional con `x-orion-device-secret` → RPC (Arduino sin anon en firmware).
- `supabase/config.toml` — `verify_jwt = false` para invocar con anon key desde el front.
- `src/lib/telemetryRemote.js` — payload normalizado, RPC, `invoke` a `analyze-run`, dashboard, `markRunPublished`, legacy `saveTelemetryRun`.
- `src/lib/telemetryAiAnalysis.js` — análisis local; `mapServerInsightToLabAi`; `runAiAnalysis(telemetry, { runId })` sin OpenAI en cliente.
- `src/pages/TeamLabPage.jsx` — peso, observaciones, pista 20 m por defecto, guardar corrida, KPIs, alertas/recomendaciones/confianza.
- `src/components/DataAnalysisSection.jsx` — misma información estructurada en la vista pública.
- `src/index.css` — estilos KPI y bloques de alertas/recomendaciones.
- `.env.example` — sin `VITE_OPENAI_API_KEY`.
- `firmware/uno_r4_wifi_telemetry/uno_r4_wifi_telemetry.ino` — ejemplo hacia `create_run_complete`.

## Probar en local

1. **Base de datos**  
   En Supabase → SQL: ejecutá `database/schema.sql` si aún no existe el proyecto, luego `database/migrations/002_normalized_telemetry.sql`.

2. **Secretos de Edge Functions**  
   Dashboard → Project Settings → Edge Functions → Secrets: `OPENAI_API_KEY` (y opcional `OPENAI_MODEL`, `DEVICE_INGEST_SECRET`).

3. **Desplegar funciones**  
   Desde la carpeta del proyecto (con Supabase CLI vinculado):

   ```bash
   supabase functions deploy analyze-run
   supabase functions deploy ingest-device
   ```

4. **Front**  
   Copiá `.env.example` a `.env.local` con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.

   ```bash
   npm install
   npm run dev
   ```

5. **Flujo laboratorio**  
   Iniciá sesión → cargá datos → **Guardar corrida (Supabase)** → **Análisis IA (servidor)** → **Publicar** (localStorage + opcional `is_published` + fila legacy).

6. **Probar `analyze-run` sin front** (opcional):

   ```bash
   curl -s -X POST "$SUPABASE_URL/functions/v1/analyze-run" \
     -H "Authorization: Bearer $ANON_KEY" \
     -H "apikey: $ANON_KEY" \
     -H "Content-Type: application/json" \
     -d '{"run_id":"<uuid>"}'
   ```

## Notas de seguridad

Las políticas RLS del migration son permisivas (`anon`) para desarrollo. Antes de producción, restringí INSERT/UPDATE a roles autenticados o a la service role y mové el ingest solo a `ingest-device` con secreto fuerte.
