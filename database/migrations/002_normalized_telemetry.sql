-- ORION — telemetría normalizada (CO2, pista 20 m)
-- Ejecutar después de schema.sql inicial si ya existe telemetry_runs (no se elimina).
-- Nuevas tablas: runs, sensor_measurements, calculated_metrics, ai_insights

create extension if not exists "pgcrypto";

-- === runs: datos manuales / contexto de corrida ===
create table if not exists public.runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source text not null default 'web' check (source in ('web', 'arduino', 'import')),
  device_id text,
  is_published boolean not null default false,

  oil_type text,
  car_weight_g double precision,
  car_model text,
  observations text,

  track_length_m double precision not null default 20,
  final_speed_kmh double precision,
  accel_sample_time_sec double precision
);

create index if not exists runs_created_at_idx on public.runs (created_at desc);
create index if not exists runs_car_model_idx on public.runs (car_model);

comment on table public.runs is 'Contexto manual y reglamento: aceite, peso, modelo, pista (20 m), notas.';

-- === sensor_measurements: lecturas automáticas (una fila por corrida) ===
create table if not exists public.sensor_measurements (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.runs (id) on delete cascade,
  created_at timestamptz not null default now(),

  reaction_times_ms double precision[] not null default '{}',
  total_time_sec double precision,
  sensor_s1_sec double precision,
  sensor_s2_sec double precision,
  lap_times_sec double precision[] not null default '{}',
  telemetry_payload jsonb not null default '{}'::jsonb,

  unique (run_id)
);

create index if not exists sensor_run_id_idx on public.sensor_measurements (run_id);

comment on table public.sensor_measurements is 'Tiempos de sensores, reacción, vueltas y payload crudo del Arduino.';

-- === calculated_metrics: derivadas (trigger) ===
create table if not exists public.calculated_metrics (
  run_id uuid primary key references public.runs (id) on delete cascade,
  computed_at timestamptz not null default now(),

  average_speed_ms double precision,
  average_speed_kmh double precision,
  estimated_acceleration_ms2 double precision,
  best_time_sec double precision,
  average_reaction_ms double precision
);

comment on table public.calculated_metrics is 'v=L/t, mejor tiempo, reacción media, aceleración estimada desde runs.final_speed_kmh y accel_sample_time_sec.';

-- === ai_insights: salida del modelo (Edge Function) ===
create table if not exists public.ai_insights (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.runs (id) on delete cascade,
  created_at timestamptz not null default now(),

  summary text not null,
  alerts jsonb not null default '[]'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  chart_panels jsonb not null default '[]'::jsonb,
  confidence double precision,
  model text,
  raw_response jsonb
);

create index if not exists ai_insights_run_idx on public.ai_insights (run_id, created_at desc);

comment on table public.ai_insights is 'Análisis IA server-side: summary, alertas, recomendaciones, gráficos sugeridos.';

-- === Trigger: recalcular métricas al insertar/actualizar sensores ===
create or replace function public.apply_calculated_metrics()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  len_m double precision;
  t_total double precision;
  t_best double precision;
  v_ms double precision;
  v_kmh double precision;
  avg_rx double precision;
  accel double precision;
begin
  select * into r from public.runs where id = new.run_id;
  if not found then
    return new;
  end if;

  len_m := coalesce(r.track_length_m, 20);
  if len_m <= 0 then
    len_m := 20;
  end if;

  t_total := new.total_time_sec;
  if (t_total is null or t_total <= 0) and new.lap_times_sec is not null and cardinality(new.lap_times_sec) > 0 then
    select avg(x) into t_total from unnest(new.lap_times_sec) as t(x);
  end if;

  t_best := t_total;
  if new.lap_times_sec is not null and cardinality(new.lap_times_sec) > 0 then
    select min(x) into t_best from unnest(new.lap_times_sec) as t(x);
    if t_total is not null and t_total > 0 then
      t_best := least(t_best, t_total);
    end if;
  end if;

  if t_total is not null and t_total > 0 and len_m > 0 then
    v_ms := len_m / t_total;
    v_kmh := v_ms * 3.6;
  else
    v_ms := null;
    v_kmh := null;
  end if;

  if new.reaction_times_ms is not null and cardinality(new.reaction_times_ms) > 0 then
    select avg(x) into avg_rx from unnest(new.reaction_times_ms) as t(x);
  else
    avg_rx := null;
  end if;

  accel := null;
  if r.final_speed_kmh is not null and r.accel_sample_time_sec is not null and r.accel_sample_time_sec > 0 then
    accel := (r.final_speed_kmh / 3.6) / r.accel_sample_time_sec;
  end if;

  insert into public.calculated_metrics (
    run_id,
    average_speed_ms,
    average_speed_kmh,
    estimated_acceleration_ms2,
    best_time_sec,
    average_reaction_ms,
    computed_at
  ) values (
    new.run_id,
    v_ms,
    v_kmh,
    accel,
    t_best,
    avg_rx,
    now()
  )
  on conflict (run_id) do update set
    average_speed_ms = excluded.average_speed_ms,
    average_speed_kmh = excluded.average_speed_kmh,
    estimated_acceleration_ms2 = excluded.estimated_acceleration_ms2,
    best_time_sec = excluded.best_time_sec,
    average_reaction_ms = excluded.average_reaction_ms,
    computed_at = excluded.computed_at;

  return new;
end;
$$;

drop trigger if exists trg_sensor_apply_metrics on public.sensor_measurements;
create trigger trg_sensor_apply_metrics
  after insert or update on public.sensor_measurements
  for each row
  execute function public.apply_calculated_metrics();

-- === RPC: crear corrida + medición en una llamada (web / Arduino via REST) ===
create or replace function public.create_run_complete(payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
  rx double precision[];
  laps double precision[];
begin
  select coalesce(array_agg((e #>> '{}')::double precision), '{}')
    into rx
  from jsonb_array_elements(coalesce(payload->'reaction_times_ms', '[]'::jsonb)) as t(e);

  select coalesce(array_agg((e #>> '{}')::double precision), '{}')
    into laps
  from jsonb_array_elements(coalesce(payload->'lap_times_sec', '[]'::jsonb)) as t(e);

  insert into public.runs (
    source,
    device_id,
    oil_type,
    car_weight_g,
    car_model,
    observations,
    track_length_m,
    final_speed_kmh,
    accel_sample_time_sec
  ) values (
    coalesce(nullif(trim(payload->>'source'), ''), 'web'),
    nullif(trim(payload->>'device_id'), ''),
    nullif(trim(payload->>'oil_type'), ''),
    case when (payload->>'car_weight_g') ~ '^[0-9]+(\.[0-9]+)?$' then (payload->>'car_weight_g')::double precision end,
    nullif(trim(payload->>'car_model'), ''),
    nullif(trim(payload->>'observations'), ''),
    coalesce(
      case when (payload->>'track_length_m') ~ '^[0-9]+(\.[0-9]+)?$' then (payload->>'track_length_m')::double precision end,
      20
    ),
    case when (payload->>'final_speed_kmh') ~ '^[0-9]+(\.[0-9]+)?$' then (payload->>'final_speed_kmh')::double precision end,
    case when (payload->>'accel_sample_time_sec') ~ '^[0-9]+(\.[0-9]+)?$' then (payload->>'accel_sample_time_sec')::double precision end
  )
  returning id into new_id;

  insert into public.sensor_measurements (
    run_id,
    reaction_times_ms,
    total_time_sec,
    sensor_s1_sec,
    sensor_s2_sec,
    lap_times_sec,
    telemetry_payload
  ) values (
    new_id,
    rx,
    case when (payload->>'total_time_sec') ~ '^[0-9]+(\.[0-9]+)?$' then (payload->>'total_time_sec')::double precision end,
    case when (payload->>'sensor_s1_sec') ~ '^[0-9]+(\.[0-9]+)?$' then (payload->>'sensor_s1_sec')::double precision end,
    case when (payload->>'sensor_s2_sec') ~ '^[0-9]+(\.[0-9]+)?$' then (payload->>'sensor_s2_sec')::double precision end,
    laps,
    coalesce(payload->'telemetry_payload', '{}'::jsonb)
  );

  return new_id;
end;
$$;

grant execute on function public.create_run_complete(jsonb) to anon, authenticated;

-- === Vista dashboard (última IA por corrida) ===
create or replace view public.v_run_dashboard as
select
  r.id as run_id,
  r.created_at,
  r.source,
  r.device_id,
  r.oil_type,
  r.car_weight_g,
  r.car_model,
  r.observations,
  r.track_length_m,
  r.is_published,
  sm.total_time_sec,
  sm.sensor_s1_sec,
  sm.sensor_s2_sec,
  sm.reaction_times_ms,
  sm.lap_times_sec,
  c.average_speed_ms,
  c.average_speed_kmh,
  c.estimated_acceleration_ms2,
  c.best_time_sec,
  c.average_reaction_ms,
  ai.summary as ai_summary,
  ai.alerts as ai_alerts,
  ai.recommendations as ai_recommendations,
  ai.chart_panels as ai_chart_panels,
  ai.confidence as ai_confidence,
  ai.model as ai_model,
  ai.created_at as ai_created_at
from public.runs r
left join public.sensor_measurements sm on sm.run_id = r.id
left join public.calculated_metrics c on c.run_id = r.id
left join lateral (
  select *
  from public.ai_insights x
  where x.run_id = r.id
  order by x.created_at desc
  limit 1
) ai on true;

-- === RLS ===
alter table public.runs enable row level security;
alter table public.sensor_measurements enable row level security;
alter table public.calculated_metrics enable row level security;
alter table public.ai_insights enable row level security;

create policy "runs_rw_anon" on public.runs for all to anon using (true) with check (true);
create policy "sensor_rw_anon" on public.sensor_measurements for all to anon using (true) with check (true);
create policy "calc_sel_anon" on public.calculated_metrics for select to anon using (true);
create policy "ai_rw_anon" on public.ai_insights for all to anon using (true) with check (true);

-- Vista: permitir lectura a anon (Supabase puede requerir security invoker; si falla, usar tabla materializada)
grant select on public.v_run_dashboard to anon, authenticated;
