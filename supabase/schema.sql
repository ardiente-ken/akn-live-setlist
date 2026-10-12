-- =====================================================================
-- AKN Gigs: full database setup (songs, admins, song requests, realtime)
-- Supabase: SQL Editor -> New query -> paste all -> Run.
-- Idempotent: safe to run on a fresh project OR on top of your existing
-- setup (it only adds what's missing and re-creates policies).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. SONGS
-- ---------------------------------------------------------------------
create table if not exists public.songs (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  artist     text not null,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.songs
  add column if not exists lyrics     text        not null default '',
  add column if not exists chords     text        not null default '',
  add column if not exists updated_at timestamptz not null default now();

create index if not exists songs_active_idx on public.songs (is_active);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists songs_set_updated_at on public.songs;
create trigger songs_set_updated_at
  before update on public.songs
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 2. ADMINS (allow-list of users who can manage songs and the queue)
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.admins enable row level security;

drop policy if exists "Admins can read own row" on public.admins;
create policy "Admins can read own row"
  on public.admins for select to authenticated
  using (user_id = auth.uid());

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

grant select on public.admins to authenticated;

-- ---------------------------------------------------------------------
-- 3. SONGS: row level security
-- ---------------------------------------------------------------------
alter table public.songs enable row level security;

grant select on public.songs to anon;
grant select, insert, update, delete on public.songs to authenticated;

-- Public: read active songs only
drop policy if exists "Public can read active songs" on public.songs;
create policy "Public can read active songs"
  on public.songs for select to anon
  using (is_active = true);

-- Admins: full access
drop policy if exists "Admins can read all songs" on public.songs;
create policy "Admins can read all songs"
  on public.songs for select to authenticated
  using (public.is_admin());

drop policy if exists "Admins can insert songs" on public.songs;
create policy "Admins can insert songs"
  on public.songs for insert to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can update songs" on public.songs;
create policy "Admins can update songs"
  on public.songs for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can delete songs" on public.songs;
create policy "Admins can delete songs"
  on public.songs for delete to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------
-- 4. SONG REQUESTS
-- ---------------------------------------------------------------------
create table if not exists public.song_requests (
  id             uuid primary key default gen_random_uuid(),
  song_id        uuid references public.songs(id) on delete set null,
  title          text not null check (char_length(title) between 1 and 120),
  artist         text not null default '' check (char_length(artist) <= 120),
  requester_name text not null default '' check (char_length(requester_name) <= 40),
  status         text not null default 'pending'
                   check (status in ('pending', 'played', 'dismissed')),
  created_at     timestamptz not null default now(),
  handled_at     timestamptz
);

create index if not exists song_requests_status_created_idx
  on public.song_requests (status, created_at);

alter table public.song_requests enable row level security;

grant select, insert on public.song_requests to anon;
grant select, insert, update, delete on public.song_requests to authenticated;

-- Everyone can see the queue (realtime needs this to reach the performer's device)
drop policy if exists "Anyone can read requests" on public.song_requests;
create policy "Anyone can read requests"
  on public.song_requests for select to anon, authenticated
  using (true);

-- Anyone can request; rows must start as pending; queue capped at 100 pending
drop policy if exists "Anyone can create pending requests" on public.song_requests;
create policy "Anyone can create pending requests"
  on public.song_requests for insert to anon, authenticated
  with check (
    status = 'pending'
    and handled_at is null
    and (select count(*) from public.song_requests where status = 'pending') < 100
  );

-- Only admins can mark played / dismiss / delete
drop policy if exists "Admins can update requests" on public.song_requests;
create policy "Admins can update requests"
  on public.song_requests for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can delete requests" on public.song_requests;
create policy "Admins can delete requests"
  on public.song_requests for delete to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------
-- 5. REALTIME for the request queue
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'song_requests'
  ) then
    alter publication supabase_realtime add table public.song_requests;
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 6. MAKE YOURSELF ADMIN (do this once)
--    a) Dashboard -> Authentication -> Users -> Add user (email + password)
--    b) Uncomment, put your email in, and run:
-- ---------------------------------------------------------------------
-- insert into public.admins (user_id)
--   select id from auth.users where email = 'YOUR_EMAIL_HERE'
--   on conflict do nothing;

-- ---------------------------------------------------------------------
-- 7. OPTIONAL: starter songs (only inserts if the table is empty)
-- ---------------------------------------------------------------------
-- insert into public.songs (title, artist)
--   select * from (values ('Black Loafers', 'AKN'), ('Pasaway', 'AKN')) as v(title, artist)
--   where not exists (select 1 from public.songs);