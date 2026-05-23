-- ORION telemetría — Postgres / Supabase
-- En Supabase: SQL Editor → New query → pegar → Run.
-- Luego Project Settings → API: copiar URL y anon key a .env.local del front.

create extension if not exists "pgcrypto";

create table if not exists public.telemetry_runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  source text not null default 'web' check (source in ('web', 'arduino', 'import')),
  device_id text,

  oil_type text,
  car_model text,
  track_length_m double precision,

  manual_track_sec double precision,
  total_time_sec double precision,
  sensor_s1_sec double precision,
  sensor_s2_sec double precision,
  lap_times_sec double precision[] default '{}',
  reaction_times_ms double precision[] default '{}',

  velocity_ms double precision,
  acceleration_ms2 double precision,

  ai_payload jsonb,
  telemetry_payload jsonb
);

create index if not exists telemetry_runs_created_at_idx on public.telemetry_runs (created_at desc);

comment on table public.telemetry_runs is 'Mediciones F1 escolar: pista, reacción, sensores, aceite, modelo; cinemática derivada.';

alter table public.telemetry_runs enable row level security;

-- Demo: lectura/escritura pública (restringir en producción con auth o Edge Function + secreto de dispositivo).
create policy "telemetry_insert_anon" on public.telemetry_runs
  for insert to anon with check (true);

create policy "telemetry_select_anon" on public.telemetry_runs
  for select to anon using (true);
