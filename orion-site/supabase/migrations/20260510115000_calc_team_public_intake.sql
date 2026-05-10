-- Bootstrap + intake público para Herramientas equipos.
-- Ejecutar completo en Supabase SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.calc_team_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  contact_email text,
  school_team_name text not null default '',
  category text not null default '',
  calc_kind text not null,
  input_json jsonb not null default '{}'::jsonb,
  result_json jsonb not null default '{}'::jsonb,
  record_fingerprint text not null default '',
  notes text,
  source text not null default 'public_tools'
    check (source in ('public_tools', 'team_lab')),
  created_at timestamptz not null default now()
);

alter table public.calc_team_records
  add column if not exists record_fingerprint text not null default '';

create index if not exists calc_team_records_created_at_idx
  on public.calc_team_records (created_at desc);

create index if not exists calc_team_records_kind_idx
  on public.calc_team_records (calc_kind);

create unique index if not exists calc_team_records_record_fingerprint_uidx
  on public.calc_team_records (record_fingerprint)
  where record_fingerprint <> '';

comment on table public.calc_team_records is
  'Cálculos guardados por equipos para análisis Orion.';

comment on column public.calc_team_records.source is
  'Origen del registro: herramientas públicas o laboratorio.';

comment on column public.calc_team_records.record_fingerprint is
  'Hash used to ignore exact duplicate public records.';

alter table public.calc_team_records enable row level security;
grant select, insert, update, delete on public.calc_team_records to anon, authenticated;

-- Select: dueño autenticado.
drop policy if exists "calc_records_select_own" on public.calc_team_records;
create policy "calc_records_select_own"
  on public.calc_team_records for select
  to authenticated
  using (auth.uid() = user_id);

-- Select: staff de laboratorio (según lab_access).
drop policy if exists "calc_records_select_lab_staff" on public.calc_team_records;
do $$
begin
  if to_regclass('public.lab_access') is not null then
    execute $policy$
      create policy "calc_records_select_lab_staff"
        on public.calc_team_records for select
        to authenticated
        using (
          exists (
            select 1
            from public.lab_access la
            where la.user_id = auth.uid()
              and la.can_access_lab is true
          )
        )
    $policy$;
  end if;
end
$$;

-- Delete: staff de laboratorio (según lab_access).
drop policy if exists "calc_records_delete_lab_staff" on public.calc_team_records;
do $$
begin
  if to_regclass('public.lab_access') is not null then
    execute $policy$
      create policy "calc_records_delete_lab_staff"
        on public.calc_team_records for delete
        to authenticated
        using (
          exists (
            select 1
            from public.lab_access la
            where la.user_id = auth.uid()
              and la.can_access_lab is true
          )
        )
    $policy$;
  end if;
end
$$;

-- Insert público: herramientas equipos (sin login).
drop policy if exists "calc_records_insert_public" on public.calc_team_records;
drop policy if exists "calc_records_insert_public_tools" on public.calc_team_records;
create policy "calc_records_insert_public"
  on public.calc_team_records for insert
  to anon, authenticated
  with check (
    user_id is null
    and coalesce(trim(school_team_name), '') <> ''
    and coalesce(trim(category), '') <> ''
  );

create policy "calc_records_insert_public_tools"
  on public.calc_team_records for insert
  to anon, authenticated
  with check (
    user_id is null
    and source = 'public_tools'
    and coalesce(trim(school_team_name), '') <> ''
    and coalesce(trim(category), '') <> ''
  );

-- Update público: permite consolidar una sola fila por equipo/categoría.
drop policy if exists "calc_records_update_public_tools" on public.calc_team_records;
create policy "calc_records_update_public_tools"
  on public.calc_team_records for update
  to anon, authenticated
  using (
    user_id is null
    and source = 'public_tools'
  )
  with check (
    user_id is null
    and source = 'public_tools'
    and coalesce(trim(school_team_name), '') <> ''
    and coalesce(trim(category), '') <> ''
  );

-- Insert autenticado: laboratorio interno.
drop policy if exists "calc_records_insert_own" on public.calc_team_records;
create policy "calc_records_insert_own"
  on public.calc_team_records for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "calc_records_update_own" on public.calc_team_records;
create policy "calc_records_update_own"
  on public.calc_team_records for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
