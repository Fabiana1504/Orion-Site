-- Keep explicit metric columns in sync with result_json.
-- This avoids null metric columns when older clients omit explicit fields.

create or replace function public.sync_calc_team_metric_columns()
returns trigger
language plpgsql
as $$
begin
  new.reaction_ms := case
    when new.result_json ? 'reactionMs' and nullif(new.result_json->>'reactionMs', '') is not null
      then (new.result_json->>'reactionMs')::double precision
    else null
  end;

  new.acceleration_ms2 := case
    when new.result_json ? 'accelerationMs2' and nullif(new.result_json->>'accelerationMs2', '') is not null
      then (new.result_json->>'accelerationMs2')::double precision
    else null
  end;

  new.velocity_kmh := case
    when new.result_json ? 'velocityKmh' and nullif(new.result_json->>'velocityKmh', '') is not null
      then (new.result_json->>'velocityKmh')::double precision
    else null
  end;

  return new;
end;
$$;

drop trigger if exists trg_sync_calc_team_metric_columns on public.calc_team_records;
create trigger trg_sync_calc_team_metric_columns
before insert or update of result_json
on public.calc_team_records
for each row
execute function public.sync_calc_team_metric_columns();

-- Backfill any existing rows that still have null explicit metrics.
update public.calc_team_records
set result_json = result_json
where reaction_ms is null
   or acceleration_ms2 is null
   or velocity_kmh is null;
