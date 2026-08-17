-- Paste into Supabase → SQL Editor → Run.
-- Campus messenger: mentor threads are free; peer DMs cost coins on the campus ledger.

create table if not exists public.campus_messages (
  id text primary key,
  from_id text not null,
  from_name text not null,
  to_id text not null,
  to_name text not null,
  kind text not null check (kind in ('mentor', 'peer')),
  course_id text,
  coins_spent numeric not null default 0,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists campus_messages_from_idx on public.campus_messages (from_id, created_at desc);
create index if not exists campus_messages_to_idx on public.campus_messages (to_id, created_at desc);

alter table public.campus_messages enable row level security;

drop policy if exists campus_messages_select_own on public.campus_messages;
create policy campus_messages_select_own on public.campus_messages
  for select using (
    auth.uid()::text = from_id
    or auth.uid()::text = to_id
  );

drop policy if exists campus_messages_insert_own on public.campus_messages;
create policy campus_messages_insert_own on public.campus_messages
  for insert with check (auth.uid()::text = from_id);
