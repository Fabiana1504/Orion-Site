-- Consolidate calc_team_records to one row per team/category.
-- Merges metrics across existing rows, then enforces uniqueness.

-- 1) Ensure metric columns are populated from result_json where missing.
update public.calc_team_records
set
  reaction_ms = coalesce(
    reaction_ms,
    case when result_json ? 'reactionMs' then nullif(result_json->>'reactionMs', '')::double precision end
  ),
  acceleration_ms2 = coalesce(
    acceleration_ms2,
    case when result_json ? 'accelerationMs2' then nullif(result_json->>'accelerationMs2', '')::double precision end
  ),
  velocity_kmh = coalesce(
    velocity_kmh,
    case when result_json ? 'velocityKmh' then nullif(result_json->>'velocityKmh', '')::double precision end
  );

-- 2) Pick one keeper row (latest) per team/category and merge all metrics into it.
with grouped as (
  select
    school_team_name,
    category,
    max(reaction_ms) filter (where reaction_ms is not null) as reaction_ms,
    max(acceleration_ms2) filter (where acceleration_ms2 is not null) as acceleration_ms2,
    max(velocity_kmh) filter (where velocity_kmh is not null) as velocity_kmh
  from public.calc_team_records
  group by school_team_name, category
),
keepers as (
  select distinct on (school_team_name, category)
    id,
    school_team_name,
    category
  from public.calc_team_records
  order by school_team_name, category, created_at desc, id desc
)
update public.calc_team_records t
set
  reaction_ms = coalesce(g.reaction_ms, t.reaction_ms),
  acceleration_ms2 = coalesce(g.acceleration_ms2, t.acceleration_ms2),
  velocity_kmh = coalesce(g.velocity_kmh, t.velocity_kmh),
  calc_kind = 'team_metrics_bundle',
  result_json = jsonb_strip_nulls(
    jsonb_build_object(
      'reactionMs', coalesce(g.reaction_ms, t.reaction_ms),
      'accelerationMs2', coalesce(g.acceleration_ms2, t.acceleration_ms2),
      'velocityKmh', coalesce(g.velocity_kmh, t.velocity_kmh)
    )
  )
from grouped g
join keepers k
  on k.school_team_name = g.school_team_name
 and k.category = g.category
where t.id = k.id;

-- 3) Delete duplicates, keep only keeper rows.
with keepers as (
  select distinct on (school_team_name, category)
    id,
    school_team_name,
    category
  from public.calc_team_records
  order by school_team_name, category, created_at desc, id desc
)
delete from public.calc_team_records t
where exists (
  select 1
  from keepers k
  where k.school_team_name = t.school_team_name
    and k.category = t.category
    and k.id <> t.id
);

-- 4) Enforce one row per team/category from now on.
create unique index if not exists calc_team_records_team_category_uidx
  on public.calc_team_records (school_team_name, category);
