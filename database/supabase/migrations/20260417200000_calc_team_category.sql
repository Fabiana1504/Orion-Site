-- Archivo: 20260417200000_calc_team_category.sql
-- Responsabilidad: agregar categoría del equipo para poder segmentar reportes/filtros.

-- Cambio de esquema mínimo para soportar filtro por categoría en laboratorio.
alter table public.calc_team_records
  add column if not exists category text not null default '';

comment on column public.calc_team_records.category is
  'Categoría STEM (F1, CO2, etc.) elegida al entrar al panel.';
