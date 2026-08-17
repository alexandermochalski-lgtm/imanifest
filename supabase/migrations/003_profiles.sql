-- Paste into Supabase → SQL Editor → Run.
-- Student directory. Listed seats are visible to other authenticated students.

create table if not exists public.profiles (
  user_id text primary key,
  name text not null,
  bio text not null default '',
  listed boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists profiles_select_listed on public.profiles;
create policy profiles_select_listed on public.profiles
  for select using (listed = true or auth.uid()::text = user_id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert with check (auth.uid()::text = user_id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (auth.uid()::text = user_id);

grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
