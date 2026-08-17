-- Paste into Supabase → SQL Editor → Run.
-- Memberships persist the $49.99/mo campus seat across browsers.

create table if not exists public.memberships (
  user_id text primary key,
  email text not null,
  status text not null check (status in ('active', 'canceled')),
  paid_at date not null default current_date,
  updated_at timestamptz not null default now()
);

create unique index if not exists memberships_email_idx on public.memberships (lower(email));

alter table public.memberships enable row level security;

drop policy if exists memberships_select_own on public.memberships;
create policy memberships_select_own on public.memberships
  for select using (
    auth.uid()::text = user_id
    or lower(coalesce(auth.jwt()->>'email', '')) = lower(email)
  );

drop policy if exists memberships_upsert_own on public.memberships;
create policy memberships_upsert_own on public.memberships
  for insert with check (
    auth.uid()::text = user_id
    or lower(coalesce(auth.jwt()->>'email', '')) = lower(email)
  );

drop policy if exists memberships_update_own on public.memberships;
create policy memberships_update_own on public.memberships
  for update using (
    auth.uid()::text = user_id
    or lower(coalesce(auth.jwt()->>'email', '')) = lower(email)
  );
