-- Add explicit metric columns for easier per-team analysis.
-- Keeps result_json as source of truth and backfills existing rows.

alter table public.calc_team_records
  add column if not exists reaction_ms double precision,
  add column if not exists acceleration_ms2 double precision,
  add column if not exists velocity_kmh double precision;

comment on column public.calc_team_records.reaction_ms is
  'Reaction time in milliseconds (from reaction calculators).';
comment on column public.calc_team_records.acceleration_ms2 is
  'Acceleration in m/s² (from acceleration calculator).';
comment on column public.calc_team_records.velocity_kmh is
  'Speed in km/h (from speed calculator).';

update public.calc_team_records
set
  reaction_ms = case
    when result_json ? 'reactionMs' then nullif(result_json->>'reactionMs', '')::double precision
    else null
  end,
  acceleration_ms2 = case
    when result_json ? 'accelerationMs2' then nullif(result_json->>'accelerationMs2', '')::double precision
    else null
  end,
  velocity_kmh = case
    when result_json ? 'velocityKmh' then nullif(result_json->>'velocityKmh', '')::double precision
    else null
  end;

create index if not exists calc_team_records_team_created_idx
  on public.calc_team_records (school_team_name, created_at desc);

create index if not exists calc_team_records_reaction_idx
  on public.calc_team_records (reaction_ms) where reaction_ms is not null;

create index if not exists calc_team_records_accel_idx
  on public.calc_team_records (acceleration_ms2) where acceleration_ms2 is not null;

create index if not exists calc_team_records_velocity_idx
  on public.calc_team_records (velocity_kmh) where velocity_kmh is not null;
