-- Permite guardar una fila por equipo + categoría + tipo de cálculo
-- (en vez de una sola fila por equipo/categoría que pisaba mediciones).

-- 1) Quitar índice previo (equipo+categoría) que causaba sobreescritura entre tipos.
drop index if exists public.calc_team_records_team_category_uidx;

-- 2) Consolidar posibles duplicados por equipo+categoría+tipo, dejando el más reciente.
with ranked as (
  select
    id,
    row_number() over (
      partition by school_team_name, category, calc_kind
      order by created_at desc, id desc
    ) as rn
  from public.calc_team_records
)
delete from public.calc_team_records t
using ranked r
where t.id = r.id
  and r.rn > 1;

-- 3) Nuevo índice único: una fila por tipo de medición dentro de cada equipo/categoría.
create unique index if not exists calc_team_records_team_category_kind_uidx
  on public.calc_team_records (school_team_name, category, calc_kind);
