-- Categoría del equipo en cada medición (herramientas públicas).
alter table public.calc_team_records
  add column if not exists category text not null default '';

comment on column public.calc_team_records.category is
  'Categoría STEM (F1, CO2, etc.) elegida al entrar al panel.';
