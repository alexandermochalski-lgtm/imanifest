-- Paste into Supabase → SQL Editor → Run.
-- X-style campus profiles: handle, media, follows, short posts, likes.

alter table public.profiles
  add column if not exists handle text,
  add column if not exists avatar_url text not null default '',
  add column if not exists banner_url text not null default '',
  add column if not exists location text not null default '',
  add column if not exists website text not null default '',
  add column if not exists pinned_post_id text,
  add column if not exists created_at timestamptz not null default now();

create unique index if not exists profiles_handle_unique
  on public.profiles (lower(handle))
  where handle is not null and handle <> '';

create table if not exists public.profile_follows (
  follower_id text not null,
  following_id text not null,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create index if not exists profile_follows_following_idx on public.profile_follows (following_id);
create index if not exists profile_follows_follower_idx on public.profile_follows (follower_id);

create table if not exists public.profile_posts (
  id text primary key,
  author_id text not null,
  body text not null,
  image_url text not null default '',
  reply_to_id text references public.profile_posts (id) on delete set null,
  created_at timestamptz not null default now(),
  check (char_length(body) >= 1 and char_length(body) <= 280)
);

create index if not exists profile_posts_author_idx on public.profile_posts (author_id, created_at desc);
create index if not exists profile_posts_reply_idx on public.profile_posts (reply_to_id);

create table if not exists public.profile_post_likes (
  post_id text not null references public.profile_posts (id) on delete cascade,
  user_id text not null,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create index if not exists profile_post_likes_user_idx on public.profile_post_likes (user_id, created_at desc);

alter table public.profile_follows enable row level security;
alter table public.profile_posts enable row level security;
alter table public.profile_post_likes enable row level security;

drop policy if exists profile_follows_select on public.profile_follows;
create policy profile_follows_select on public.profile_follows
  for select using (true);

drop policy if exists profile_follows_insert_own on public.profile_follows;
create policy profile_follows_insert_own on public.profile_follows
  for insert with check (auth.uid()::text = follower_id);

drop policy if exists profile_follows_delete_own on public.profile_follows;
create policy profile_follows_delete_own on public.profile_follows
  for delete using (auth.uid()::text = follower_id);

drop policy if exists profile_posts_select on public.profile_posts;
create policy profile_posts_select on public.profile_posts
  for select using (
    author_id = auth.uid()::text
    or exists (
      select 1 from public.profiles p
      where p.user_id = author_id and (p.listed = true or p.user_id = auth.uid()::text)
    )
  );

drop policy if exists profile_posts_insert_own on public.profile_posts;
create policy profile_posts_insert_own on public.profile_posts
  for insert with check (auth.uid()::text = author_id);

drop policy if exists profile_posts_update_own on public.profile_posts;
create policy profile_posts_update_own on public.profile_posts
  for update using (auth.uid()::text = author_id);

drop policy if exists profile_posts_delete_own on public.profile_posts;
create policy profile_posts_delete_own on public.profile_posts
  for delete using (auth.uid()::text = author_id);

drop policy if exists profile_post_likes_select on public.profile_post_likes;
create policy profile_post_likes_select on public.profile_post_likes
  for select using (true);

drop policy if exists profile_post_likes_insert_own on public.profile_post_likes;
create policy profile_post_likes_insert_own on public.profile_post_likes
  for insert with check (auth.uid()::text = user_id);

drop policy if exists profile_post_likes_delete_own on public.profile_post_likes;
create policy profile_post_likes_delete_own on public.profile_post_likes
  for delete using (auth.uid()::text = user_id);

-- Refresh profiles policies to allow reading own unlisted + listed seats
drop policy if exists profiles_select_listed on public.profiles;
create policy profiles_select_listed on public.profiles
  for select using (listed = true or auth.uid()::text = user_id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert with check (auth.uid()::text = user_id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (auth.uid()::text = user_id);

grant select, insert, update, delete on public.profile_follows to authenticated;
grant select, insert, update, delete on public.profile_posts to authenticated;
grant select, insert, delete on public.profile_post_likes to authenticated;
grant all on public.profile_follows to service_role;
grant all on public.profile_posts to service_role;
grant all on public.profile_post_likes to service_role;
