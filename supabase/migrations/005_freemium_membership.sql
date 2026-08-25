-- Paste into Supabase → SQL Editor → Run.
-- Freemium: allow status = 'free' on memberships (campus access without $49.99 seat).

alter table public.memberships drop constraint if exists memberships_status_check;
alter table public.memberships
  add constraint memberships_status_check
  check (status in ('active', 'canceled', 'free'));
