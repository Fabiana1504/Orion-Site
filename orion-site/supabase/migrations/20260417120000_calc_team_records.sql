-- Mediciones de equipos externos (herramientas públicas).
-- Ejecutá este archivo en Supabase → SQL Editor si no usás CLI de migraciones.

create table if not exists public.calc_team_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  contact_email text,
  school_team_name text not null default '',
  calc_kind text not null,
  input_json jsonb not null default '{}'::jsonb,
  result_json jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz not null default now()
);

comment on table public.calc_team_records is
  'Cálculos guardados por equipos registrados (velocidad, reacción, etc.) para análisis Orion.';

create index if not exists calc_team_records_created_at_idx
  on public.calc_team_records (created_at desc);

create index if not exists calc_team_records_kind_idx
  on public.calc_team_records (calc_kind);

alter table public.calc_team_records enable row level security;

drop policy if exists "calc_records_select_own" on public.calc_team_records;
create policy "calc_records_select_own"
  on public.calc_team_records for select
  using (auth.uid() = user_id);

drop policy if exists "calc_records_select_lab_staff" on public.calc_team_records;
create policy "calc_records_select_lab_staff"
  on public.calc_team_records for select
  using (
    exists (
      select 1 from public.lab_access la
      where la.user_id = auth.uid()
        and la.can_access_lab is true
    )
  );

drop policy if exists "calc_records_insert_own" on public.calc_team_records;
create policy "calc_records_insert_own"
  on public.calc_team_records for insert
  with check (auth.uid() = user_id);
